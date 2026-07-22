package com.restroaudit.backend.service;
import com.restroaudit.backend.model.Feedback;
import com.restroaudit.backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackRepository repository;
    public List<Feedback> findAll() { return repository.findAll(); }
    public Optional<Feedback> findById(Integer id) { return repository.findById(id); }
    public Feedback save(Feedback entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
