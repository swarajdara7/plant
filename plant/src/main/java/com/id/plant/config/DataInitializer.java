package com.id.plant.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.id.plant.model.Plant;
import com.id.plant.repository.PlantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(PlantRepository plantRepository, ObjectMapper objectMapper) {
        return args -> {
            if (plantRepository.count() == 0) {
                try (InputStream inputStream = getClass().getResourceAsStream("/data/plants.json")) {
                    List<Plant> plants = objectMapper.readValue(inputStream, new TypeReference<List<Plant>>() {});
                    plants.forEach(plant -> {
                        if (plant.getUserId() == null) {
                            plant.setUserId("ADMIN");
                        }
                    });
                    plantRepository.saveAll(plants);
                    System.out.println("✅ Successfully auto-seeded 40 Indian Plants into the database!");
                } catch (Exception e) {
                    System.out.println("❌ Unable to load Indian plants: " + e.getMessage());
                }
            } else {
                System.out.println("✅ Database already contains plants. Skipping auto-seed.");
            }
        };
    }
}
