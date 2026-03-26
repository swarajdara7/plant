package com.id.plant.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MockPlantIdService implements PlantIdService {

    @Override
    public Map<String, Object> identifyPlant(MultipartFile image) {
        // In a real implementation, we would send 'image' to plant.id API
        // Here, we simulate a response
        
        Map<String, Object> response = new HashMap<>();
        response.put("isPlant", true);
        
        // Simulating predictions
        Map<String, Object> suggestion = new HashMap<>();
        
        // We can randomly choose a mock plant name based on file name or just return a default
        String filename = image.getOriginalFilename() != null ? image.getOriginalFilename().toLowerCase() : "";
        
        if (filename.contains("aloe")) {
            suggestion.put("plant_name", "Aloe vera");
        } else if (filename.contains("snake")) {
            suggestion.put("plant_name", "Sansevieria");
        } else {
            suggestion.put("plant_name", "Ficus elastica");
        }
        
        suggestion.put("probability", 0.95);
        
        response.put("suggestions", List.of(suggestion));
        
        return response;
    }
}
