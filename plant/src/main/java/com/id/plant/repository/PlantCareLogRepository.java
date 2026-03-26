package com.id.plant.repository;

import com.id.plant.model.PlantCareLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantCareLogRepository extends JpaRepository<PlantCareLog, String> {
    List<PlantCareLog> findByPlantId(String plantId);
    List<PlantCareLog> findByUserId(String userId);
}
