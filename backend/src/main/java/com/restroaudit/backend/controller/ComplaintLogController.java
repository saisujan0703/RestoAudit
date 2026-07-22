package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.ComplaintLog;
import com.restroaudit.backend.model.Feedback;
import com.restroaudit.backend.service.ComplaintLogService;
import com.restroaudit.backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaint-logs")
@CrossOrigin(origins = "*")
public class ComplaintLogController {
    @Autowired private ComplaintLogService service;
    @Autowired private FeedbackRepository feedbackRepository;

    @GetMapping
    public List<ComplaintLog> getAll() { return service.findAll(); }

    @PostMapping
    public Map<String, Object> create(@RequestBody ComplaintLog entity) {
        return resolveAndSave(entity);
    }

    @PutMapping("/{logId}")
    public Map<String, Object> update(@PathVariable Integer logId, @RequestBody ComplaintLog entity) {
        entity.setLogId(logId);
        return resolveAndSave(entity);
    }

    /** Resolve detached Feedback reference and return flat DTO to avoid circular serialization. */
    private Map<String, Object> resolveAndSave(ComplaintLog entity) {
        if (entity.getFeedback() != null && entity.getFeedback().getFeedbackId() != null) {
            Feedback f = feedbackRepository.findById(entity.getFeedback().getFeedbackId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback not found"));
            entity.setFeedback(f);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "feedback reference is required");
        }
        ComplaintLog saved = service.save(entity);

        // Return flat DTO to avoid circular serialization
        Map<String, Object> result = new HashMap<>();
        result.put("logId", saved.getLogId());
        result.put("status", saved.getStatus());
        result.put("resolutionNotes", saved.getResolutionNotes());
        if (saved.getFeedback() != null) result.put("feedbackId", saved.getFeedback().getFeedbackId());
        return result;
    }
}
