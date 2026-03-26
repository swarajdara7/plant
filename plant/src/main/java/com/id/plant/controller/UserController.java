package com.id.plant.controller;

import com.id.plant.model.Plant;
import com.id.plant.model.Reminder;
import com.id.plant.model.User;
import com.id.plant.repository.PlantRepository;
import com.id.plant.repository.ReminderRepository;
import com.id.plant.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private com.id.plant.service.PlantIdService plantIdService;

    @Autowired
    private com.id.plant.repository.PlantKnowledgeBaseRepository knowledgeBaseRepository;

    @Autowired
    private com.id.plant.service.ReminderGenerationService reminderGenerationService;

    @Autowired
    private com.id.plant.service.PerenualApiService perenualApiService;

    @Autowired
    private com.id.plant.repository.PlantCareLogRepository plantCareLogRepository;

    @Autowired
    private com.id.plant.repository.PlantRequestRepository plantRequestRepository;

    // ================= USER PROFILE =================
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setEmail(updatedUser.getEmail());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= USER PLANTS =================
    // Fetch ALL plants (admin-added + user-added)
    @GetMapping("/plants")
    public ResponseEntity<List<Plant>> getAllPlants() {
        return ResponseEntity.ok(plantRepository.findAll());
    }

    // Add a plant for a specific user
    @PostMapping("/{id}/plants")
    public ResponseEntity<Plant> addUserPlant(@PathVariable String id, @RequestBody Plant plant) {
        plant.setUserId(id);
        if (plant.getCreatedAt() == null) {
            plant.setCreatedAt(LocalDateTime.now());
        }
        Plant savedPlant = plantRepository.save(plant);
        reminderGenerationService.generateInitialReminders(savedPlant);
        return ResponseEntity.ok(savedPlant);
    }
    
    @PutMapping("/{userId}/plants/{plantId}/bought")
    public ResponseEntity<?> toggleUserPlantBought(@PathVariable String userId, @PathVariable String plantId, @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(userId).orElseThrow();
        boolean bought = body.get("bought");
        List<String> plantIds = user.getPlantIds();
        if (plantIds == null) {
            plantIds = new ArrayList<>();
        }
        if (bought && !plantIds.contains(plantId)) {
            plantIds.add(plantId);
            plantRepository.findById(plantId).ifPresent(plant -> {
                reminderGenerationService.generateRemindersForUserPlant(plant, userId);
            });
        } else if (!bought) {
            plantIds.remove(plantId);
        }
        user.setPlantIds(plantIds);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // ================= USER REMINDERS =================
    // Fetch ALL reminders
    @GetMapping("/reminders")
    public ResponseEntity<List<Reminder>> getAllReminders() {
        return ResponseEntity.ok(reminderRepository.findAll());
    }

    // Fetch user-specific reminders
    @GetMapping("/{id}/reminders")
    public ResponseEntity<List<Reminder>> getUserReminders(@PathVariable String id) {
        List<Reminder> reminders = reminderRepository.findByUserId(id);
        for(Reminder r : reminders) {
            plantRepository.findById(r.getPlantId()).ifPresent(p -> r.setPlantName(p.getName()));
        }
        return ResponseEntity.ok(reminders);
    }

    // Add a reminder for a specific user
    @PostMapping("/{id}/reminders")
    public ResponseEntity<Reminder> addUserReminder(@PathVariable String id, @RequestBody Reminder reminder) {
        reminder.setUserId(id);
        if (reminder.getCreatedAt() == null) {
            reminder.setCreatedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    // Mark a reminder as completed
    @PutMapping("/reminders/{reminderId}/completed")
    public ResponseEntity<?> markReminderCompleted(@PathVariable String reminderId) {
        return reminderRepository.findById(reminderId)
                .map(reminder -> {
                    // Log the care action
                    com.id.plant.model.PlantCareLog log = new com.id.plant.model.PlantCareLog(
                            reminder.getPlantId(),
                            reminder.getUserId(),
                            reminder.getType(),
                            "Completed via reminder"
                    );
                    plantCareLogRepository.save(log);

                    // Fetch plant to determine interval and create new reminder for the future date
                    plantRepository.findById(reminder.getPlantId()).ifPresent(plant -> {
                        String frequencyStr = "N/A";
                        if (reminder.getType().equalsIgnoreCase("Watering")) {
                            frequencyStr = plant.getWateringFrequency();
                        } else if (reminder.getType().equalsIgnoreCase("Fertilizing")) {
                            frequencyStr = plant.getFertilizingFrequency();
                        }
                        
                        long daysToAdd = getDaysFromFrequencyStr(frequencyStr);
                        if (daysToAdd > 0) {
                            Reminder nextReminder = new Reminder(
                                    reminder.getPlantId(),
                                    reminder.getUserId(),
                                    reminder.getType(),
                                    LocalDateTime.now().plusDays(daysToAdd),
                                    false
                            );
                            reminderRepository.save(nextReminder);
                        }
                    });
                    
                    // Set current reminder to completed true
                    reminder.setCompleted(true);
                    return ResponseEntity.ok(reminderRepository.save(reminder));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private long getDaysFromFrequencyStr(String frequency) {
        if (frequency == null) return 0;
        if (frequency.equalsIgnoreCase("Daily")) return 1;
        if (frequency.equalsIgnoreCase("Weekly")) return 7;
        if (frequency.equalsIgnoreCase("Bi-Weekly")) return 14;
        if (frequency.equalsIgnoreCase("Monthly")) return 30;
        return 0;
    }

    // ================= USER STATS =================
    // Stats for a specific user
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable String id) {
        return userRepository.findById(id).map(user -> {
            List<Plant> plants = plantRepository.findByUserId(id);
            List<String> boughtPlantIds = user.getPlantIds();
            if (boughtPlantIds != null && !boughtPlantIds.isEmpty()) {
                plants.addAll(plantRepository.findAllById(boughtPlantIds));
            }
            plants = plants.stream().distinct().collect(java.util.stream.Collectors.toList());

            List<Reminder> reminders = reminderRepository.findByUserId(id);
            for(Reminder r : reminders) {
                plantRepository.findById(r.getPlantId()).ifPresent(p -> r.setPlantName(p.getName()));
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("userId", id);
            stats.put("username", user.getUsername());
            stats.put("totalPlants", plants.size());
            stats.put("totalReminders", reminders.size());
            stats.put("plants", plants);
            stats.put("reminders", reminders);

            return ResponseEntity.ok(stats);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= IMAGE RECOGNITION =================
    @PostMapping("/recognize-plant")
    public ResponseEntity<?> recognizePlant(@RequestParam("image") org.springframework.web.multipart.MultipartFile image) {
        try {
            Map<String, Object> result = plantIdService.identifyPlant(image);
            
            if (result.containsKey("suggestions")) {
                List<Map<String, Object>> suggestions = (List<Map<String, Object>>) result.get("suggestions");
                if (!suggestions.isEmpty()) {
                    String speciesName = (String) suggestions.get(0).get("plant_name");
                    
                    com.id.plant.model.PlantKnowledgeBase kb = knowledgeBaseRepository.findBySpeciesNameIgnoreCase(speciesName)
                            .orElseGet(() -> {
                                com.id.plant.model.PlantKnowledgeBase newKb = perenualApiService.fetchPlantDetails(speciesName);
                                return knowledgeBaseRepository.save(newKb);
                            });
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("speciesName", kb.getSpeciesName());
                    response.put("wateringFrequency", kb.getWateringFrequency());
                    response.put("fertilizingFrequency", kb.getFertilizingFrequency());
                    response.put("careInstructions", kb.getCareInstructions());
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.badRequest().body("Could not identify the plant.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing image: " + e.getMessage());
        }
    }

    // ================= BROCHURE & REQUESTS =================
    @GetMapping("/plants/brochure")
    public ResponseEntity<List<Plant>> getBrochurePlants() {
        List<Plant> brochure = plantRepository.findAll().stream()
                .filter(p -> p.getUserId() == null || p.getUserId().isEmpty() || p.getUserId().equalsIgnoreCase("admin"))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(brochure);
    }

    @PostMapping("/{id}/request-plant")
    public ResponseEntity<?> requestPlant(@PathVariable String id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElseThrow();
        String photoUrl = body.get("photoUrl");
        com.id.plant.model.PlantRequest request = new com.id.plant.model.PlantRequest(
                id, user.getUsername(), photoUrl, "PENDING"
        );
        return ResponseEntity.ok(plantRequestRepository.save(request));
    }

    // ================= GLOBAL STATS =================
    // Stats for all users combined
    @GetMapping("/all/stats")
    public ResponseEntity<?> getAllUserStats() {
        List<Plant> allPlants = plantRepository.findAll();
        List<Reminder> allReminders = reminderRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPlants", allPlants.size());
        stats.put("totalReminders", allReminders.size());
        stats.put("plants", allPlants);
        stats.put("reminders", allReminders);

        return ResponseEntity.ok(stats);
    }
}
