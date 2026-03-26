package com.id.plant.repository;

import com.id.plant.model.PlantKnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantKnowledgeBaseRepository extends JpaRepository<PlantKnowledgeBase, String> {
    Optional<PlantKnowledgeBase> findBySpeciesNameIgnoreCase(String speciesName);
}
