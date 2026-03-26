package com.id.plant.repository;

import com.id.plant.model.PlantRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlantRequestRepository extends JpaRepository<PlantRequest, String> {
    List<PlantRequest> findByUserId(String userId);
    List<PlantRequest> findByStatus(String status);
}
