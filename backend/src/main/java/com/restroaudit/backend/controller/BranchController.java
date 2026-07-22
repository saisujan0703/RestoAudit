package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.Branch;
import com.restroaudit.backend.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*")
public class BranchController {
    @Autowired
    private BranchService service;
    
    @GetMapping
    public List<Branch> getAll() { return service.findAll(); }
    
    @PostMapping
    public Branch create(@RequestBody Branch entity) { return service.save(entity); }
}

