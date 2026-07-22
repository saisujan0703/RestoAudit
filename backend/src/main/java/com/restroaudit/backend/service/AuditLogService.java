package com.restroaudit.backend.service;

import com.restroaudit.backend.model.AuditLog;
import com.restroaudit.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository repository;

    public List<AuditLog> findLatest(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return repository.findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "actionTimestamp", "auditId")))
                .getContent();
    }
}
