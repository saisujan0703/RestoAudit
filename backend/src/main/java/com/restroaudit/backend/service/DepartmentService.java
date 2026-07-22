package com.restroaudit.backend.service;
import com.restroaudit.backend.model.Department;
import com.restroaudit.backend.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository repository;
    public List<Department> findAll() { return repository.findAll(); }
    public Optional<Department> findById(Integer id) { return repository.findById(id); }
    public Department save(Department entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
