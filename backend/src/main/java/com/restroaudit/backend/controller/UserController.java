package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.User;
import com.restroaudit.backend.service.UserService;
import com.restroaudit.backend.repository.BranchRepository;
import com.restroaudit.backend.repository.DepartmentRepository;
import com.restroaudit.backend.model.Branch;
import com.restroaudit.backend.model.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // SECURITY: Restrict to known origins only
public class UserController {
    @Autowired
    private UserService service;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @GetMapping
    public List<User> getAll(@RequestParam(required = false) Integer branchId) {
        if (branchId != null) {
            return service.findByBranchId(branchId);
        }
        return service.findAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Integer id) {
        return service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
    
    @PostMapping
    public Map<String, Object> create(@RequestBody User entity) {
        // Resolve branch reference if only an id was provided
        try {
            if (entity.getBranch() != null && entity.getBranch().getBranchId() != null) {
                Integer bid = entity.getBranch().getBranchId();
                Branch b = branchRepository.findById(bid).orElse(null);
                entity.setBranch(b);
            }
        } catch (Exception ignored) {}
        // Resolve department reference if provided
        try {
            if (entity.getDepartment() != null) {
                Integer did = entity.getDepartment().getDeptId();
                Department d = departmentRepository.findById(did).orElse(null);
                entity.setDepartment(d);
            }
        } catch (Exception ignored) {}

        User saved = service.save(entity);
        // Return flat DTO — safe from serialization issues
        Map<String, Object> result = new HashMap<>();
        result.put("userId", saved.getUserId());
        result.put("firstName", saved.getFirstName());
        result.put("lastName", saved.getLastName());
        result.put("email", saved.getEmail());
        result.put("phoneNo", saved.getPhoneNo());
        result.put("userRole", saved.getUserRole());
        result.put("loyaltyPoints", saved.getLoyaltyPoints());
        if (saved.getBranch() != null) result.put("branchId", saved.getBranch().getBranchId());
        if (saved.getDepartment() != null) result.put("deptId", saved.getDepartment().getDeptId());
        return result;
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<Map<String, Object>> update(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        User existing = service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));


        if (body.containsKey("firstName"))  existing.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName"))   existing.setLastName((String) body.get("lastName"));
        if (body.containsKey("email"))      existing.setEmail((String) body.get("email"));
        if (body.containsKey("phoneNo"))    existing.setPhoneNo((String) body.get("phoneNo"));
        if (body.containsKey("userRole"))   existing.setUserRole((String) body.get("userRole"));

        if (body.containsKey("branchId") && body.get("branchId") != null) {
            Integer bid = Integer.valueOf(body.get("branchId").toString());
            branchRepository.findById(bid).ifPresent(existing::setBranch);
        }
        if (body.containsKey("deptId") && body.get("deptId") != null) {
            Integer did = Integer.valueOf(body.get("deptId").toString());
            departmentRepository.findById(did).ifPresent(existing::setDepartment);
        }

        User saved = service.save(existing);
        Map<String, Object> result = new HashMap<>();
        result.put("userId",    saved.getUserId());
        result.put("firstName", saved.getFirstName());
        result.put("lastName",  saved.getLastName());
        result.put("email",     saved.getEmail());
        result.put("phoneNo",   saved.getPhoneNo());
        result.put("userRole",  saved.getUserRole());
        result.put("loyaltyPoints", saved.getLoyaltyPoints());
        if (saved.getBranch()     != null) result.put("branchId", saved.getBranch().getBranchId());
        if (saved.getDepartment() != null) result.put("deptId",   saved.getDepartment().getDeptId());
        return org.springframework.http.ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}

