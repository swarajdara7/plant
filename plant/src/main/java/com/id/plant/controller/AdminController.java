package com.id.plant.controller;

import com.id.plant.model.Plant;
import com.id.plant.model.User;
import com.id.plant.model.Reminder;
import com.id.plant.repository.PlantRepository;
import com.id.plant.repository.UserRepository;
import com.id.plant.repository.ReminderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private com.id.plant.service.ReminderGenerationService reminderGenerationService;

    @Autowired
    private com.id.plant.repository.PlantRequestRepository plantRequestRepository;

    @Autowired
    private com.id.plant.service.PlantIdService plantIdService;

    // ================= REQUESTS =================
    @GetMapping("/requests")
    public ResponseEntity<List<com.id.plant.model.PlantRequest>> getAllRequests() {
        return ResponseEntity.ok(plantRequestRepository.findAll());
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable String id) {
        return plantRequestRepository.findById(id).map(req -> {
            req.setStatus("APPROVED");
            plantRequestRepository.save(req);
            return ResponseEntity.ok(req);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable String id) {
        return plantRequestRepository.findById(id).map(req -> {
            req.setStatus("REJECTED");
            plantRequestRepository.save(req);
            return ResponseEntity.ok(req);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ================= USERS =================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body("User not found"));
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> {
                    user.setUsername(userDetails.getUsername());
                    user.setEmail(userDetails.getEmail());
                    user.setRole(userDetails.getRole());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.status(404).body("User not found"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ================= PLANTS =================
    @GetMapping("/plants")
    public ResponseEntity<List<Plant>> getAllPlants() {
        return ResponseEntity.ok(plantRepository.findAll());
    }

    @GetMapping("/plants/{id}")
    public ResponseEntity<?> getPlantById(@PathVariable String id) {
        return plantRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body("Plant not found"));
    }

    @PostMapping("/plants")
    public ResponseEntity<Plant> addPlant(@RequestBody Plant plant) {
        if (plant.getType() == null) plant.setType("Unknown");
        if (plant.getPhotoUrl() == null) plant.setPhotoUrl("");
        if (plant.getWateringFrequency() == null) plant.setWateringFrequency("N/A");
        if (plant.getFertilizingFrequency() == null) plant.setFertilizingFrequency("N/A");
        Plant savedPlant = plantRepository.save(plant);
        reminderGenerationService.generateInitialReminders(savedPlant);
        return ResponseEntity.ok(savedPlant);
    }

    @PutMapping("/plants/{id}")
    public ResponseEntity<?> updatePlant(@PathVariable String id, @RequestBody Plant plantDetails) {
        return plantRepository.findById(id)
                .<ResponseEntity<?>>map(plant -> {
                    plant.setName(plantDetails.getName());
                    plant.setType(plantDetails.getType());
                    plant.setPhotoUrl(plantDetails.getPhotoUrl());
                    plant.setWateringFrequency(plantDetails.getWateringFrequency());
                    plant.setFertilizingFrequency(plantDetails.getFertilizingFrequency());
                    plant.setUserId(plantDetails.getUserId());
                    return ResponseEntity.ok(plantRepository.save(plant));
                })
                .orElse(ResponseEntity.status(404).body("Plant not found"));
    }

    @DeleteMapping("/plants/{id}")
    public ResponseEntity<?> deletePlant(@PathVariable String id) {
        if (!plantRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Plant not found");
        }
        plantRepository.deleteById(id);
        return ResponseEntity.ok("Plant deleted successfully");
    }

    // ================= REMINDERS =================
    @PostMapping("/reminders/trigger")
    public ResponseEntity<?> triggerReminders() {
        reminderGenerationService.triggerManually();
        return ResponseEntity.ok("Reminders generation triggered successfully.");
    }

    @GetMapping("/reminders")
    public ResponseEntity<List<Reminder>> getAllReminders() {
        return ResponseEntity.ok(reminderRepository.findAll());
    }

    @GetMapping("/reminders/{id}")
    public ResponseEntity<?> getReminderById(@PathVariable String id) {
        return reminderRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body("Reminder not found"));
    }

    @PostMapping("/reminders")
    public ResponseEntity<Reminder> addReminder(@RequestBody Reminder reminder) {
        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    @PutMapping("/reminders/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable String id, @RequestBody Reminder reminderDetails) {
        return reminderRepository.findById(id)
                .<ResponseEntity<?>>map(reminder -> {
                    reminder.setPlantId(reminderDetails.getPlantId());
                    reminder.setUserId(reminderDetails.getUserId());
                    reminder.setType(reminderDetails.getType());
                    reminder.setReminderTime(reminderDetails.getReminderTime());
                    reminder.setCompleted(reminderDetails.isCompleted());
                    return ResponseEntity.ok(reminderRepository.save(reminder));
                })
                .orElse(ResponseEntity.status(404).body("Reminder not found"));
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable String id) {
        if (!reminderRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Reminder not found");
        }
        reminderRepository.deleteById(id);
        return ResponseEntity.ok("Reminder deleted successfully");
    }

    // ================= STATS =================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPlants", plantRepository.count());
        stats.put("totalReminders", reminderRepository.count());
        return ResponseEntity.ok(stats);
    }

    // ================= TRENDS =================
 // ================= TRENDS =================
    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getTrends() {
        List<User> users = userRepository.findAll();
        List<Plant> plants = plantRepository.findAll();
        List<Reminder> reminders = reminderRepository.findAll();

        Map<LocalDate, Map<String, Integer>> trendMap = new TreeMap<>();

        // Users
        users.forEach(u -> {
            if (u.getCreatedAt() != null) {
                LocalDate date = u.getCreatedAt().toLocalDate();
                trendMap.putIfAbsent(date, new HashMap<>());
                trendMap.get(date).put("users", trendMap.get(date).getOrDefault("users", 0) + 1);
            }
        });

        // Plants
        plants.forEach(p -> {
            if (p.getCreatedAt() != null) {
                LocalDate date = p.getCreatedAt().toLocalDate();
                trendMap.putIfAbsent(date, new HashMap<>());
                trendMap.get(date).put("plants", trendMap.get(date).getOrDefault("plants", 0) + 1);
            }
        });

        // Reminders
        reminders.forEach(r -> {
            if (r.getCreatedAt() != null) {
                LocalDate date = r.getCreatedAt().toLocalDate();
                trendMap.putIfAbsent(date, new HashMap<>());
                trendMap.get(date).put("reminders", trendMap.get(date).getOrDefault("reminders", 0) + 1);
            }
        });

        List<Map<String, Object>> trends = trendMap.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", entry.getKey().toString());
            map.put("users", entry.getValue().getOrDefault("users", 0));
            map.put("plants", entry.getValue().getOrDefault("plants", 0));
            map.put("reminders", entry.getValue().getOrDefault("reminders", 0));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(trends);
    }

}
