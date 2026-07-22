package com.restroaudit.backend.service;
import com.restroaudit.backend.model.ComplaintLog;
import com.restroaudit.backend.repository.ComplaintLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintLogService {
    @Autowired
    private ComplaintLogRepository repository;
    public List<ComplaintLog> findAll() { return repository.findAll(); }
    public Optional<ComplaintLog> findById(Integer id) { return repository.findById(id); }
    public ComplaintLog save(ComplaintLog entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
