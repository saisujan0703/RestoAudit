package com.restroaudit.backend.repository;
import com.restroaudit.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
	List<Order> findByUser_UserId(Integer userId);

	// Find orders belonging to a specific branch
	List<Order> findByBranch_BranchId(Integer branchId);
}