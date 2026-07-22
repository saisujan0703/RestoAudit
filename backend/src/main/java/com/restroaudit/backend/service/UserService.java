package com.restroaudit.backend.service;
import com.restroaudit.backend.model.User;
import com.restroaudit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;
    public List<User> findAll() { return repository.findAll(); }
    public Optional<User> findById(Integer id) { return repository.findById(id); }
    public User save(User entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
    
    // SECURITY: Find users scoped to a specific branch
    public List<User> findByBranchId(Integer branchId) {
        return repository.findByBranch_BranchId(branchId);
    }
}
