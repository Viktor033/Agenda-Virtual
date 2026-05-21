package com.saas.shifty.repository;

import com.saas.shifty.entity.Professional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfessionalRepository extends JpaRepository<Professional, Long> {
    List<Professional> findByStatus(String status);
}
