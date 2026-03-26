package com.id.plant.service;

import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface PlantIdService {
    /**
     * Identifies a plant from an image and returns its species details.
     */
    Map<String, Object> identifyPlant(MultipartFile image);
}
