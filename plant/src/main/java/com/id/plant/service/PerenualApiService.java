package com.id.plant.service;

import com.id.plant.model.PlantKnowledgeBase;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PerenualApiService {

    private final String API_KEY = "sk-NShm69bce626e8a2b15609";
    private final String BASE_URL = "https://perenual.com/api";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PlantKnowledgeBase fetchPlantDetails(String speciesName) {
        try {
            // 1. Search for the plant to get its Perenual ID
            String searchUrl = BASE_URL + "/species-list?key=" + API_KEY + "&q=" + speciesName;
            ResponseEntity<String> searchResponse = restTemplate.getForEntity(searchUrl, String.class);
            JsonNode searchRoot = objectMapper.readTree(searchResponse.getBody());
            JsonNode dataArray = searchRoot.path("data");

            if (dataArray.isArray() && dataArray.size() > 0) {
                // Get the first match
                JsonNode firstMatch = dataArray.get(0);
                int plantId = firstMatch.path("id").asInt();

                // 2. Fetch detailed care instructions
                String detailsUrl = BASE_URL + "/species/details/" + plantId + "?key=" + API_KEY;
                ResponseEntity<String> detailsResponse = restTemplate.getForEntity(detailsUrl, String.class);
                JsonNode detailsRoot = objectMapper.readTree(detailsResponse.getBody());

                // Parse the care data
                String watering = detailsRoot.path("watering").asText("Weekly");
                
                // Sunlight is usually an array, let's join it
                JsonNode sunlightNode = detailsRoot.path("sunlight");
                String sunlight = "Indirect sunlight";
                if (sunlightNode.isArray() && sunlightNode.size() > 0) {
                    sunlight = sunlightNode.get(0).asText();
                }

                String careInstructions = "Sunlight: " + sunlight + ". description: " + detailsRoot.path("description").asText("No description available.");
                // Fertilizing isn't explicitly top-level always, we default to Monthly or extract if available
                String fertilizing = "Monthly";

                PlantKnowledgeBase kb = new PlantKnowledgeBase(
                        speciesName,
                        capitalize(watering),
                        fertilizing,
                        careInstructions
                );
                return kb;
            }
        } catch (Exception e) {
            System.err.println("Error fetching from Perenual API: " + e.getMessage());
        }

        // Fallback if API fails or plant not found
        return new PlantKnowledgeBase(
                speciesName,
                "Weekly",
                "Monthly",
                "Keep in indirect sunlight. (Fallback Data)"
        );
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
