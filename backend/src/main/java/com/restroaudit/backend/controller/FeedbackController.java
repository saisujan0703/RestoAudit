package com.restroaudit.backend.controller;
import com.restroaudit.backend.model.Feedback;
import com.restroaudit.backend.model.User;
import com.restroaudit.backend.model.Branch;
import com.restroaudit.backend.model.MenuItem;
import com.restroaudit.backend.service.FeedbackService;
import com.restroaudit.backend.repository.UserRepository;
import com.restroaudit.backend.repository.BranchRepository;
import com.restroaudit.backend.repository.MenuItemRepository;
import com.restroaudit.backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*")
public class FeedbackController {
    @Autowired private FeedbackService service;
    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private MenuItemRepository menuItemRepository;

    @GetMapping
    public List<Feedback> getAll() { return service.findAll(); }

    @PostMapping
    public Map<String, Object> create(@RequestBody Feedback entity) {
        // Resolve detached User reference
        if (entity.getUser() != null && entity.getUser().getUserId() != null) {
            User u = userRepository.findById(entity.getUser().getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + entity.getUser().getUserId()));
            entity.setUser(u);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user.userId is required");
        }

        // Resolve detached Branch reference (optional)
        if (entity.getBranch() != null && entity.getBranch().getBranchId() != null) {
            Branch b = branchRepository.findById(entity.getBranch().getBranchId()).orElse(null);
            entity.setBranch(b);
        }

        // Resolve detached MenuItem reference (required)
        if (entity.getMenuItem() != null && entity.getMenuItem().getItemId() != null) {
            MenuItem m = menuItemRepository.findById(entity.getMenuItem().getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "MenuItem not found: " + entity.getMenuItem().getItemId()));
            entity.setMenuItem(m);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "menuItem.itemId is required");
        }

        // orderId must be set (DB: NOT NULL)
        if (entity.getOrderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId is required");
        }
        // Check for duplicate: order_id is UNIQUE in Feedback table
        boolean alreadyRated = feedbackRepository.findAll().stream()
            .anyMatch(f -> entity.getOrderId().equals(f.getOrderId()));
        if (alreadyRated) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order has already been rated. Each order can only have one feedback.");
        }

        Feedback saved;
        try {
            saved = service.save(entity);
        } catch (Exception e) {
            // Surface the real DB error for debugging
            String cause = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            String rootCause = e.getCause() != null && e.getCause().getCause() != null ? e.getCause().getCause().getMessage() : "";
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "DB save failed: " + cause + " | root: " + rootCause);
        }

        // Return flat DTO to avoid circular serialization
        Map<String, Object> result = new HashMap<>();
        result.put("feedbackId", saved.getFeedbackId());
        result.put("ratingScore", saved.getRatingScore());
        result.put("textComments", saved.getTextComments());
        result.put("orderId", saved.getOrderId());
        if (saved.getUser() != null) result.put("userId", saved.getUser().getUserId());
        if (saved.getMenuItem() != null) {
            Map<String, Object> item = new HashMap<>();
            item.put("itemId", saved.getMenuItem().getItemId());
            item.put("itemName", saved.getMenuItem().getItemName());
            result.put("menuItem", item);
        }
        return result;
    }
}
