package com.id.plant.controller;

import com.id.plant.model.User;
import com.id.plant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class HomeController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Home
    @GetMapping("/")
    public String home() {
        return "Welcome to PlantPal API!";
    }

    // Status
    @GetMapping("/status")
    public String status() {
        return "PlantPal API is running smoothly.";
    }

    // Register user
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Email already registered!");
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Username already taken!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole("USER");
        user.setPlantIds(new ArrayList<>());
        userRepository.save(user);
        return ResponseEntity.ok("✅ User registered successfully: " + user.getUsername());
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
        if (optionalUser.isEmpty()) return ResponseEntity.badRequest().body("❌ Email not found!");
        User user = optionalUser.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("❌ Invalid password!");
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Login successful! Welcome " + user.getUsername());
        response.put("userId", user.getId());
        response.put("role", user.getRole());
        
        return ResponseEntity.ok(response);
    }

    // List all users
    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }
}
