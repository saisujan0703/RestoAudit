package com.restroaudit.backend.repository;
import com.restroaudit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // SECURITY: Find all users in a specific branch (for branch-scoped queries)
    List<User> findByBranch_BranchId(Integer branchId);
}