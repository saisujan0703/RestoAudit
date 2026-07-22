package com.restroaudit.backend.service;
import com.restroaudit.backend.model.Order;
import com.restroaudit.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepository repository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private com.restroaudit.backend.repository.UserRepository userRepository;

    @Autowired
    private com.restroaudit.backend.repository.BranchRepository branchRepository;

    @Autowired
    private com.restroaudit.backend.repository.IngredientRepository ingredientRepository;

    public List<Order> findAll() { return repository.findAll(); }
    public List<Order> findByUserId(Integer userId) { return repository.findByUser_UserId(userId); }
    public List<Order> findByBranchId(Integer branchId) { return repository.findByBranch_BranchId(branchId); }
    public Optional<Order> findById(Integer id) { return repository.findById(id); }
    
    @Autowired
    private com.restroaudit.backend.repository.MenuItemRepository menuItemRepository;

    @org.springframework.transaction.annotation.Transactional
    public Order save(Order entity) {
        // Resolve detached references before saving so JPA can persist the graph safely.
        if (entity.getUser() != null && entity.getUser().getUserId() != null) {
            entity.setUser(userRepository.findById(entity.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user selected for order")));
        }

        if (entity.getBranch() != null && entity.getBranch().getBranchId() != null) {
            entity.setBranch(branchRepository.findById(entity.getBranch().getBranchId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid branch selected for order")));
        }

        // Server-side branch enforcement: compare the customer's registered branch
        // (from the database) with the incoming order's branchId. If the customer
        // is registered to a branch, the order must target the same branch.
        Integer incomingBranchId = (entity.getBranch() != null && entity.getBranch().getBranchId() != null)
                ? entity.getBranch().getBranchId() : null;
        if (entity.getUser() != null && entity.getUser().getUserId() != null && incomingBranchId != null) {
            Integer custBranchId = userRepository.findById(entity.getUser().getUserId())
                    .map(u -> u.getBranch() != null ? u.getBranch().getBranchId() : null)
                    .orElse(null);
            if (custBranchId != null && !custBranchId.equals(incomingBranchId)) {
                throw new IllegalArgumentException("Order branch does not match customer's registered branch");
            }
        }

        if (entity.getOrderDetails() != null) {
            for (com.restroaudit.backend.model.OrderDetail detail : entity.getOrderDetails()) {
                if (detail.getMenuItem() != null && detail.getMenuItem().getItemId() != null) {
                    detail.setMenuItem(menuItemRepository.findById(detail.getMenuItem().getItemId())
                        .orElseThrow(() -> new IllegalArgumentException("Invalid menu item in order details")));
                }
                detail.setOrder(entity);
            }
        }
        boolean isNewOrder = entity.getOrderId() == null;
        
        // 1. Save the order first to get ID
        Order savedOrder = repository.save(entity);
        
        // 2. Update Loyalty Points & Stock (ONLY FOR NEW ORDERS)
        if (isNewOrder && savedOrder.getUser() != null && savedOrder.getUser().getUserId() != null) {
            com.restroaudit.backend.model.User user = userRepository.findById(savedOrder.getUser().getUserId()).orElse(null);
            if (user != null) {
                double totalOrderValue = 0;
                if (savedOrder.getOrderDetails() != null) {
                    for (com.restroaudit.backend.model.OrderDetail detail : savedOrder.getOrderDetails()) {
                        totalOrderValue += detail.getSubtotal();
                        
                        // 3. Affect Stock using recipe table
                        if (detail.getMenuItem() != null && detail.getMenuItem().getItemId() != null) {
                            Integer itemId = detail.getMenuItem().getItemId();
                            int qty = detail.getQuantity() != null ? detail.getQuantity() : 1;
                            
                            String sql = "SELECT ing_id, quantity_required FROM recipe WHERE item_id = ?";
                            List<java.util.Map<String, Object>> recipes = jdbcTemplate.queryForList(sql, itemId);
                            
                            for (java.util.Map<String, Object> r : recipes) {
                                Integer ingId = (Integer) r.get("ing_id");
                                java.math.BigDecimal reqQty = (java.math.BigDecimal) r.get("quantity_required");
                                
                                com.restroaudit.backend.model.Ingredient ing = ingredientRepository.findById(ingId).orElse(null);
                                if (ing != null && ing.getStockQuantity() != null) {
                                    java.math.BigDecimal totalToDeduct = reqQty.multiply(java.math.BigDecimal.valueOf(qty));
                                    ing.setStockQuantity(ing.getStockQuantity().subtract(totalToDeduct));
                                    ingredientRepository.save(ing);
                                }
                            }
                        }
                    }
                }
                
                int pointsEarned = (int) (totalOrderValue / 10);
                user.setLoyaltyPoints((user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0) + pointsEarned);
                userRepository.save(user);
            }
        }
        
        return savedOrder;
    }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
