package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.Department;
import com.restroaudit.backend.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {
    @Autowired
    private DepartmentService service;
    
    @GetMapping
    public List<Department> getAll() { return service.findAll(); }
    
    @PostMapping
    public Department create(@RequestBody Department entity) { return service.save(entity); }
}

