package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.Ingredient;
import com.restroaudit.backend.service.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@CrossOrigin(origins = "*")
public class IngredientController {
    @Autowired
    private IngredientService service;
    
    @GetMapping
    public List<Ingredient> getAll() { return service.findAll(); }
    
    @PostMapping
    public Ingredient create(@RequestBody Ingredient entity,
                             @RequestHeader(value = "X-Branch-Id", required = false) Integer actingBranchId) {
        if (actingBranchId != null && entity != null) {
            try {
                if (entity.getClass().getMethod("getBranch").invoke(entity) != null) {
                    Object b = entity.getClass().getMethod("getBranch").invoke(entity);
                    java.lang.reflect.Method m = b.getClass().getMethod("getBranchId");
                    Integer bid = (Integer) m.invoke(b);
                    if (bid != null && !actingBranchId.equals(bid)) {
                        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Cannot create ingredient for another branch");
                    }
                }
            } catch (NoSuchMethodException nsme) {
                // entity doesn't have branch - ignore
            } catch (Exception e) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid branch in request", e);
            }
        }
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Ingredient update(@PathVariable Integer id, @RequestBody Ingredient entity) {
        Ingredient existing = service.findById(id).orElseThrow(() -> new RuntimeException("Ingredient not found"));
        if (entity.getIngName() != null) existing.setIngName(entity.getIngName());
        if (entity.getStockQuantity() != null) existing.setStockQuantity(entity.getStockQuantity());
        if (entity.getExpiryDate() != null) existing.setExpiryDate(entity.getExpiryDate());
        return service.save(existing);
    }
}

