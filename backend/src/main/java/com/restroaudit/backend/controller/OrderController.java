package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.Order;
import com.restroaudit.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // SECURITY: Restrict to known origins only
public class OrderController {
    @Autowired
    private OrderService service;
    
    @GetMapping
    public List<Order> getAll(@RequestParam(required = false) Integer branchId) {
        if (branchId != null) {
            return service.findByBranchId(branchId);
        }
        return service.findAll();
    }

	@GetMapping("/by-user/{userId}")
	public List<Order> getByUser(@PathVariable Integer userId) {
		return service.findByUserId(userId);
	}
    
    @GetMapping("/by-branch/{branchId}")
    public List<java.util.Map<String,Object>> getByBranch(@PathVariable Integer branchId) {
        java.util.List<Order> orders = service.findByBranchId(branchId);
        java.util.List<java.util.Map<String,Object>> out = new java.util.ArrayList<>();
        for (Order o : orders) {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("orderId", o.getOrderId());
            m.put("orderStatus", o.getOrderStatus());
            m.put("orderTime", o.getOrderTime());
            if (o.getUser() != null) {
                java.util.Map<String,Object> u = new java.util.HashMap<>();
                u.put("userId", o.getUser().getUserId());
                u.put("firstName", o.getUser().getFirstName());
                u.put("lastName", o.getUser().getLastName());
                m.put("user", u);
            }
            if (o.getBranch() != null) {
                java.util.Map<String,Object> b = new java.util.HashMap<>();
                b.put("branchId", o.getBranch().getBranchId());
                b.put("addressLine", o.getBranch().getAddressLine());
                m.put("branch", b);
            }
            if (o.getOrderDetails() != null) {
                java.util.List<java.util.Map<String,Object>> details = new java.util.ArrayList<>();
                for (com.restroaudit.backend.model.OrderDetail d : o.getOrderDetails()) {
                    java.util.Map<String,Object> dm = new java.util.HashMap<>();
                    dm.put("quantity", d.getQuantity());
                    dm.put("subtotal", d.getSubtotal());
                    if (d.getMenuItem() != null) {
                        java.util.Map<String,Object> item = new java.util.HashMap<>();
                        item.put("itemId", d.getMenuItem().getItemId());
                        item.put("itemName", d.getMenuItem().getItemName());
                        item.put("price", d.getMenuItem().getPrice());
                        dm.put("menuItem", item);
                    }
                    details.add(dm);
                }
                m.put("orderDetails", details);
            }
            out.add(m);
        }
        return out;
    }
    
    @PostMapping
    public Map<String, Object> create(@RequestBody Order entity) {

        try {
            Order saved = service.save(entity);
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", saved.getOrderId());
            response.put("orderStatus", saved.getOrderStatus());
            response.put("message", "Order placed successfully");
            return response;
        } catch (IllegalArgumentException iae) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, iae.getMessage(), iae);
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Failed to place order", e);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Integer id) {

        service.deleteById(id);
    }
    
    @PutMapping("/{id}")
    public Map<String, Object> update(
            @PathVariable Integer id,
            @RequestBody Order updatedData) {
        Order existing = service.findById(id).orElseThrow(() -> 
                new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Order not found"));

        existing.setOrderStatus(updatedData.getOrderStatus());
        // Since we are only updating status, we save it directly without altering details.
        Order saved = service.save(existing);
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", saved.getOrderId());
        response.put("orderStatus", saved.getOrderStatus());
        response.put("message", "Order updated successfully");
        return response;
    }
}

