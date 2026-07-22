package com.restroaudit.backend.repository;
import com.restroaudit.backend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    // SECURITY: Find all menu items in a specific branch

}