package com.id.plant.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "plant_knowledge_base")
public class PlantKnowledgeBase {

    @Id
    private String speciesName; // e.g., "Ficus elastica", "Aloe Vera"
    
    private String wateringFrequency; // e.g., "Weekly", "Daily"
    private String fertilizingFrequency; // e.g., "Monthly", "Bi-Weekly"
    private String careInstructions;

    public PlantKnowledgeBase() {}

    public PlantKnowledgeBase(String speciesName, String wateringFrequency, String fertilizingFrequency, String careInstructions) {
        this.speciesName = speciesName;
        this.wateringFrequency = wateringFrequency;
        this.fertilizingFrequency = fertilizingFrequency;
        this.careInstructions = careInstructions;
    }

    public String getSpeciesName() { return speciesName; }
    public void setSpeciesName(String speciesName) { this.speciesName = speciesName; }

    public String getWateringFrequency() { return wateringFrequency; }
    public void setWateringFrequency(String wateringFrequency) { this.wateringFrequency = wateringFrequency; }

    public String getFertilizingFrequency() { return fertilizingFrequency; }
    public void setFertilizingFrequency(String fertilizingFrequency) { this.fertilizingFrequency = fertilizingFrequency; }

    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }
}
