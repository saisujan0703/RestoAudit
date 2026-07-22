package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.MenuItem;
import com.restroaudit.backend.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // SECURITY: Restrict to known origins
public class MenuItemController {
    @Autowired
    private MenuItemService service;
    
    @GetMapping
    public List<MenuItem> getAll(@RequestParam(required = false) Integer branchId) {
        if (branchId != null) {
            return service.findByBranchId(branchId);
        }
        return service.findAll();
    }
    
    @PostMapping
    public MenuItem create(@RequestBody MenuItem entity) {
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}

