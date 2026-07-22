package com.restroaudit.backend.service;
import com.restroaudit.backend.model.Branch;
import com.restroaudit.backend.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BranchService {
    @Autowired
    private BranchRepository repository;
    public List<Branch> findAll() { return repository.findAll(); }
    public Optional<Branch> findById(Integer id) { return repository.findById(id); }
    public Branch save(Branch entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
