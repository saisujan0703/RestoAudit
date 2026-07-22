package com.restroaudit.backend.service;
import com.restroaudit.backend.model.Ingredient;
import com.restroaudit.backend.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class IngredientService {
    @Autowired
    private IngredientRepository repository;
    public List<Ingredient> findAll() { return repository.findAll(); }
    public Optional<Ingredient> findById(Integer id) { return repository.findById(id); }
    public Ingredient save(Ingredient entity) { return repository.save(entity); }
    public void deleteById(Integer id) { repository.deleteById(id); }
}
