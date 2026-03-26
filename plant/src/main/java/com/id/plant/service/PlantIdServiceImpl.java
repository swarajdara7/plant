package com.id.plant.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.Base64;

@Service
public class PlantIdServiceImpl implements PlantIdService {
    
    private final String API_KEY = "SP9W5KvRdWAI31S1uFYIrbOCDwKveJ3kq1GdJLUQLIoLwHKa3Y";
    private final String API_URL = "https://plant.id/api/v3/identification";
    
    @Override
    public Map<String, Object> identifyPlant(MultipartFile image) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            String imagePayload = "data:" + image.getContentType() + ";base64," + base64Image;

            RestTemplate restTemplate = new RestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Api-Key", API_KEY);
            headers.set("Content-Type", "application/json");
            
            Map<String, Object> body = new HashMap<>();
            body.put("images", Collections.singletonList(imagePayload));
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            Map<String, Object> result = new HashMap<>();
            
            if (responseBody != null && responseBody.containsKey("result")) {
                Map<String, Object> resultObj = (Map<String, Object>) responseBody.get("result");
                if (resultObj.containsKey("classification")) {
                    Map<String, Object> classification = (Map<String, Object>) resultObj.get("classification");
                    if (classification.containsKey("suggestions")) {
                        List<Map<String, Object>> suggestions = (List<Map<String, Object>>) classification.get("suggestions");
                        List<Map<String, Object>> formattedSuggestions = new ArrayList<>();
                        for(Map<String, Object> sugg : suggestions) {
                            Map<String, Object> formattedSugg = new HashMap<>();
                            formattedSugg.put("plant_name", sugg.get("name"));
                            formattedSugg.put("probability", sugg.get("probability"));
                            formattedSuggestions.add(formattedSugg);
                        }
                        result.put("suggestions", formattedSuggestions);
                    }
                }
            } else {
                throw new RuntimeException("Invalid response from plant.id");
            }
            
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to identify plant: " + e.getMessage());
        }
    }
}
