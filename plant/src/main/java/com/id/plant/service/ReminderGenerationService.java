package com.id.plant.service;

import com.id.plant.model.Plant;
import com.id.plant.model.Reminder;
import com.id.plant.repository.PlantRepository;
import com.id.plant.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderGenerationService {

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    /**
     * Care Schedule Generation Algorithm:
     * Generates initial future-dated reminders for a newly created plant.
     */
    public void generateInitialReminders(Plant plant) {
        System.out.println("Generating initial care schedule for plant: " + plant.getId());
        LocalDateTime now = LocalDateTime.now();

        // 1. Watering Frequency
        if (plant.getWateringFrequency() != null && !plant.getWateringFrequency().equalsIgnoreCase("N/A")) {
            long daysToAdd = getDaysFromFrequency(plant.getWateringFrequency());
            if (daysToAdd > 0) {
                List<Reminder> existing = reminderRepository.findByPlantIdAndTypeAndCompletedFalse(plant.getId(), "Watering");
                if (existing.isEmpty()) {
                    Reminder wateringReminder = new Reminder(
                            plant.getId(),
                            plant.getUserId(),
                            "Watering",
                            now.plusDays(daysToAdd),
                            false
                    );
                    reminderRepository.save(wateringReminder);
                }
            }
        }

        // 2. Fertilizing Frequency
        if (plant.getFertilizingFrequency() != null && !plant.getFertilizingFrequency().equalsIgnoreCase("N/A")) {
            long daysToAdd = getDaysFromFrequency(plant.getFertilizingFrequency());
            if (daysToAdd > 0) {
                List<Reminder> existing = reminderRepository.findByPlantIdAndTypeAndCompletedFalse(plant.getId(), "Fertilizing");
                if (existing.isEmpty()) {
                    Reminder fertilizingReminder = new Reminder(
                            plant.getId(),
                            plant.getUserId(),
                            "Fertilizing",
                            now.plusDays(daysToAdd),
                            false
                    );
                    reminderRepository.save(fertilizingReminder);
                }
            }
        }
    }

    public void generateRemindersForUserPlant(Plant plant, String userId) {
        LocalDateTime now = LocalDateTime.now();
        if (plant.getWateringFrequency() != null && !plant.getWateringFrequency().equalsIgnoreCase("N/A")) {
            long days = getDaysFromFrequency(plant.getWateringFrequency());
            if (days > 0) {
                List<Reminder> existing = reminderRepository.findByPlantIdAndTypeAndCompletedFalse(plant.getId(), "Watering");
                if (existing.isEmpty()) {
                    reminderRepository.save(new Reminder(plant.getId(), userId, "Watering", now.plusDays(days), false));
                }
            }
        }
        if (plant.getFertilizingFrequency() != null && !plant.getFertilizingFrequency().equalsIgnoreCase("N/A")) {
            long days = getDaysFromFrequency(plant.getFertilizingFrequency());
            if (days > 0) {
                List<Reminder> existing = reminderRepository.findByPlantIdAndTypeAndCompletedFalse(plant.getId(), "Fertilizing");
                if (existing.isEmpty()) {
                    reminderRepository.save(new Reminder(plant.getId(), userId, "Fertilizing", now.plusDays(days), false));
                }
            }
        }
    }

    private long getDaysFromFrequency(String frequency) {
        if (frequency == null) return 0;
        if (frequency.toLowerCase().contains("daily")) return 1;
        if (frequency.toLowerCase().contains("weekly")) return 7;
        if (frequency.toLowerCase().contains("bi-weekly")) return 14;
        if (frequency.toLowerCase().contains("monthly")) return 30;
        // Dynamically extract the first number found, e.g. "every 3 days" -> 3, "7-10 days" -> 7
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+").matcher(frequency);
            if (m.find()) {
                return Long.parseLong(m.group());
            }
        } catch (Exception e) {}
        
        return 0; // Unknown or N/A
    }

    /**
     * Reminder Trigger Engine (Cron / Cloud Scheduler):
     * Runs daily. Finds all reminders where nextDueDate <= today.
     * Triggers a notification, and updates nextDueDate by adding frequency interval.
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void generateDailyReminders() {
        System.out.println("Running Reminder Trigger Engine...");
        LocalDateTime todayEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        List<Reminder> activeReminders = reminderRepository.findByCompletedFalse();
        
        for (Reminder reminder : activeReminders) {
            // Check if reminder is due (nextDueDate <= today)
            // We use todayEnd to include anything scheduled for today
            if (reminder.getReminderTime().isBefore(todayEnd) || reminder.getReminderTime().isEqual(todayEnd)) {
                
                // Fetch the plant to get its configuration
                Plant plant = plantRepository.findById(reminder.getPlantId()).orElse(null);
                if (plant == null) continue;

                // 1. Dispatch Push Notification (Simulated)
                System.out.println("🔔 PUSH NOTIFICATION SENT -> User: " + reminder.getUserId() 
                                   + " | Plant: " + plant.getName() 
                                   + " | Task: " + reminder.getType());

                // 2. Update the reminder's nextDueDate by adding frequency interval
                String frequencyStr = "N/A";
                if (reminder.getType().equalsIgnoreCase("Watering")) {
                    frequencyStr = plant.getWateringFrequency();
                } else if (reminder.getType().equalsIgnoreCase("Fertilizing")) {
                    frequencyStr = plant.getFertilizingFrequency();
                }

                long daysToAdd = getDaysFromFrequency(frequencyStr);
                
                if (daysToAdd > 0) {
                    reminder.setReminderTime(LocalDateTime.now().plusDays(daysToAdd));
                    // We don't mark it completed so the same record is just bumped forward
                    reminderRepository.save(reminder);
                }
            }
        }
    }

    // Manual trigger for testing
    public void triggerManually() {
        generateDailyReminders();
    }
}
