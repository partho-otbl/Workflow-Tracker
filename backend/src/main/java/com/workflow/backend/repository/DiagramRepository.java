package com.workflow.backend.repository;

import com.workflow.backend.entity.Diagram;
import com.workflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagramRepository extends JpaRepository<Diagram, Long> {
    List<Diagram> findByUser(User user);
}
