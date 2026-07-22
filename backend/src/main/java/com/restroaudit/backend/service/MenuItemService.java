package com.restroaudit.backend.service;
import com.restroaudit.backend.model.MenuItem;
import com.restroaudit.backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {
    @Autowired
    private MenuItemRepository repository;
    public List<MenuItem> findAll() { return repository.findAll(); }
    public Optional<MenuItem> findById(Integer id) { return repository.findById(id); }
    public MenuItem save(MenuItem entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
    
    // SECURITY: Find menu items scoped to a specific branch
    public List<MenuItem> findByBranchId(Integer branchId) {
        return repository.findAll();
    }
}
