package com.restroaudit.backend.controller;

import com.restroaudit.backend.model.AuditLog;
import com.restroaudit.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {
    @Autowired
    private AuditLogService service;

    @GetMapping
    public List<AuditLog> getLatest(@RequestParam(defaultValue = "100") int limit) {
        return service.findLatest(limit);
    }
}
