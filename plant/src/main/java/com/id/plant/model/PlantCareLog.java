package com.id.plant.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.Column;

import java.time.LocalDateTime;

@Entity
@Table(name = "plant_care_logs")
public class PlantCareLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String plantId;
    private String userId;
    private String actionType; // e.g. "Watering", "Fertilizing", "Pruning"
    
    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "logged_at", updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime loggedAt;

    public PlantCareLog() {}

    public PlantCareLog(String plantId, String userId, String actionType, String notes) {
        this.plantId = plantId;
        this.userId = userId;
        this.actionType = actionType;
        this.notes = notes;
        this.loggedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlantId() { return plantId; }
    public void setPlantId(String plantId) { this.plantId = plantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
}
