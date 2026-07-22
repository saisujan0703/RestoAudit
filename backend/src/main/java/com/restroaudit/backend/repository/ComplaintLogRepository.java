package com.restroaudit.backend.repository;
import com.restroaudit.backend.model.ComplaintLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintLogRepository extends JpaRepository<ComplaintLog, Integer> {
}