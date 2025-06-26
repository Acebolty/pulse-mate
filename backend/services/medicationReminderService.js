const User = require('../models/User');
const Alert = require('../models/Alert');
const emailService = require('./emailService');

class MedicationReminderService {
  constructor() {
    this.frequencyPatterns = {
      // Daily patterns
      'once daily': { times: 1, interval: 24, defaultTimes: ['08:00'] },
      'once a day': { times: 1, interval: 24, defaultTimes: ['08:00'] },
      'daily': { times: 1, interval: 24, defaultTimes: ['08:00'] },
      '1x daily': { times: 1, interval: 24, defaultTimes: ['08:00'] },
      
      'twice daily': { times: 2, interval: 12, defaultTimes: ['08:00', '20:00'] },
      'twice a day': { times: 2, interval: 12, defaultTimes: ['08:00', '20:00'] },
      '2x daily': { times: 2, interval: 12, defaultTimes: ['08:00', '20:00'] },
      'bid': { times: 2, interval: 12, defaultTimes: ['08:00', '20:00'] },
      
      'three times daily': { times: 3, interval: 8, defaultTimes: ['08:00', '16:00', '24:00'] },
      'three times a day': { times: 3, interval: 8, defaultTimes: ['08:00', '16:00', '24:00'] },
      '3x daily': { times: 3, interval: 8, defaultTimes: ['08:00', '16:00', '24:00'] },
      'tid': { times: 3, interval: 8, defaultTimes: ['08:00', '16:00', '24:00'] },
      
      'four times daily': { times: 4, interval: 6, defaultTimes: ['08:00', '14:00', '20:00', '02:00'] },
      'four times a day': { times: 4, interval: 6, defaultTimes: ['08:00', '14:00', '20:00', '02:00'] },
      '4x daily': { times: 4, interval: 6, defaultTimes: ['08:00', '14:00', '20:00', '02:00'] },
      'qid': { times: 4, interval: 6, defaultTimes: ['08:00', '14:00', '20:00', '02:00'] },
      
      // Specific intervals
      'every 4 hours': { times: 6, interval: 4, defaultTimes: ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00'] },
      'every 6 hours': { times: 4, interval: 6, defaultTimes: ['08:00', '14:00', '20:00', '02:00'] },
      'every 8 hours': { times: 3, interval: 8, defaultTimes: ['08:00', '16:00', '00:00'] },
      'every 12 hours': { times: 2, interval: 12, defaultTimes: ['08:00', '20:00'] },
      
      // Weekly patterns
      'once weekly': { times: 1, interval: 168, defaultTimes: ['08:00'], weekly: true },
      'weekly': { times: 1, interval: 168, defaultTimes: ['08:00'], weekly: true },
      
      // As needed
      'as needed': { times: 0, interval: 0, defaultTimes: [], asNeeded: true },
      'prn': { times: 0, interval: 0, defaultTimes: [], asNeeded: true }
    };
  }

  parseFrequency(frequencyString) {
    if (!frequencyString) return null;
    
    const normalized = frequencyString.toLowerCase().trim();
    
    // Direct match
    if (this.frequencyPatterns[normalized]) {
      return this.frequencyPatterns[normalized];
    }
    
    // Pattern matching for variations
    for (const [pattern, config] of Object.entries(this.frequencyPatterns)) {
      if (normalized.includes(pattern)) {
        return config;
      }
    }
    
    // Default fallback
    return { times: 1, interval: 24, defaultTimes: ['08:00'] };
  }

  generateMedicationSchedule(medications) {
    const schedule = [];
    
    medications.forEach(medication => {
      const frequency = this.parseFrequency(medication.frequency);
      
      if (frequency.asNeeded) {
        // Skip as-needed medications for scheduled reminders
        return;
      }
      
      frequency.defaultTimes.forEach((time, index) => {
        schedule.push({
          medicationName: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          scheduledTime: time,
          doseNumber: index + 1,
          totalDoses: frequency.times,
          interval: frequency.interval
        });
      });
    });
    
    return schedule.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  async getUserMedicationSchedule(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.medicalInfo?.medications) {
        return [];
      }
      
      return this.generateMedicationSchedule(user.medicalInfo.medications);
    } catch (error) {
      console.error('Error getting user medication schedule:', error);
      return [];
    }
  }

  async sendMedicationReminder(userId, medication) {
    try {
      const user = await User.findById(userId);
      
      // Check if user has medication reminders enabled
      if (!user?.settings?.notifications?.emailNotifications || 
          !user?.settings?.notifications?.medicationReminders) {
        console.log(`Medication reminders disabled for user ${userId}`);
        return { success: false, reason: 'disabled' };
      }

      const reminderData = {
        medicationName: medication.medicationName,
        dosage: medication.dosage,
        scheduledTime: medication.scheduledTime,
        doseNumber: medication.doseNumber,
        totalDoses: medication.totalDoses,
        frequency: medication.frequency
      };
      
      const emailResult = await emailService.sendMedicationReminder(
        user.email,
        user.firstName || 'User',
        reminderData
      );

      if (emailResult.success) {
        console.log(`Medication reminder email sent to: ${user.email} for ${medication.medicationName}`);
      }

      return emailResult;
    } catch (error) {
      console.error('Error sending medication reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDailyMedicationSummary(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user?.settings?.notifications?.emailNotifications || 
          !user?.settings?.notifications?.medicationReminders) {
        return { success: false, reason: 'disabled' };
      }

      const schedule = await this.getUserMedicationSchedule(userId);
      
      if (schedule.length === 0) {
        return { success: false, reason: 'no_medications' };
      }

      const summaryData = {
        date: new Date().toLocaleDateString(),
        medications: schedule,
        totalMedications: [...new Set(schedule.map(s => s.medicationName))].length,
        totalDoses: schedule.length
      };
      
      const emailResult = await emailService.sendDailyMedicationSummary(
        user.email,
        user.firstName || 'User',
        summaryData
      );

      return emailResult;
    } catch (error) {
      console.error('Error sending daily medication summary:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMedicationRemindersToAllUsers() {
    try {
      const users = await User.find({
        'settings.notifications.emailNotifications': true,
        'settings.notifications.medicationReminders': true,
        'medicalInfo.medications.0': { $exists: true } // Has at least one medication
      });

      console.log(`Checking medication reminders for ${users.length} users...`);

      const results = [];
      const currentTime = new Date();
      const currentHour = currentTime.getHours().toString().padStart(2, '0');
      const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinute}`;

      for (const user of users) {
        const schedule = this.generateMedicationSchedule(user.medicalInfo.medications);
        
        // Find medications due at current time (within 5 minutes)
        const dueMedications = schedule.filter(med => {
          const [schedHour, schedMin] = med.scheduledTime.split(':').map(Number);
          const schedTime = schedHour * 60 + schedMin;
          const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
          
          // Check if medication is due within 5 minutes
          return Math.abs(schedTime - currentTimeMinutes) <= 5;
        });

        for (const medication of dueMedications) {
          const result = await this.sendMedicationReminder(user._id, medication);
          results.push({ 
            userId: user._id, 
            email: user.email, 
            medication: medication.medicationName,
            ...result 
          });
          
          // Add delay to avoid overwhelming email service
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending medication reminders to all users:', error);
      throw error;
    }
  }

  getMedicationInsights(medications) {
    const insights = [];
    
    if (medications.length === 0) {
      insights.push("💊 No medications currently recorded. Add your medications in your profile to get personalized reminders.");
      return insights;
    }

    const totalMedications = medications.length;
    const dailyDoses = medications.reduce((total, med) => {
      const frequency = this.parseFrequency(med.frequency);
      return total + (frequency.asNeeded ? 0 : frequency.times);
    }, 0);

    insights.push(`💊 You have ${totalMedications} medication${totalMedications > 1 ? 's' : ''} with ${dailyDoses} daily dose${dailyDoses > 1 ? 's' : ''} scheduled.`);

    // Check for complex schedules
    const complexMeds = medications.filter(med => {
      const frequency = this.parseFrequency(med.frequency);
      return frequency.times >= 3;
    });

    if (complexMeds.length > 0) {
      insights.push(`⏰ ${complexMeds.length} medication${complexMeds.length > 1 ? 's require' : ' requires'} multiple daily doses. Set reminders to stay on track.`);
    }

    // Check for as-needed medications
    const asNeededMeds = medications.filter(med => {
      const frequency = this.parseFrequency(med.frequency);
      return frequency.asNeeded;
    });

    if (asNeededMeds.length > 0) {
      insights.push(`📋 ${asNeededMeds.length} medication${asNeededMeds.length > 1 ? 's are' : ' is'} marked as "as needed" - take only when necessary.`);
    }

    return insights;
  }

  async createMedicationAlert(userId, medication, alertType = 'reminder') {
    try {
      const alertData = {
        userId: userId,
        type: alertType === 'overdue' ? 'warning' : 'info',
        title: alertType === 'overdue'
          ? `Overdue Medication: ${medication.medicationName}`
          : `Medication Reminder: ${medication.medicationName}`,
        message: alertType === 'overdue'
          ? `Your ${medication.medicationName} (${medication.dosage}) was scheduled for ${medication.scheduledTime} and is now overdue.`
          : `Time to take your ${medication.medicationName} (${medication.dosage}) scheduled for ${medication.scheduledTime}.`,
        source: 'Medication Reminder System',
        timestamp: new Date(),
        isRead: false
      };

      const alert = new Alert(alertData);
      const savedAlert = await alert.save();

      console.log(`Medication alert created: ${savedAlert.title}`);
      return savedAlert;
    } catch (error) {
      console.error('Error creating medication alert:', error);
      return null;
    }
  }

  async checkAndCreateMedicationAlerts(userId) {
    try {
      const schedule = await this.getUserMedicationSchedule(userId);
      if (schedule.length === 0) return [];

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const createdAlerts = [];

      for (const medication of schedule) {
        const [schedHour, schedMin] = medication.scheduledTime.split(':').map(Number);
        const schedTime = schedHour * 60 + schedMin;

        // Check if medication is overdue (more than 30 minutes past)
        if (currentTime > schedTime + 30) {
          // Check if we already created an overdue alert today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const existingAlert = await Alert.findOne({
            userId: userId,
            title: `Overdue Medication: ${medication.medicationName}`,
            createdAt: { $gte: today }
          });

          if (!existingAlert) {
            const alert = await this.createMedicationAlert(userId, medication, 'overdue');
            if (alert) createdAlerts.push(alert);
          }
        }
        // Check if medication is due soon (within 15 minutes)
        else if (schedTime - currentTime <= 15 && schedTime - currentTime > 0) {
          // Check if we already created a reminder alert in the last hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

          const existingAlert = await Alert.findOne({
            userId: userId,
            title: `Medication Reminder: ${medication.medicationName}`,
            createdAt: { $gte: oneHourAgo }
          });

          if (!existingAlert) {
            const alert = await this.createMedicationAlert(userId, medication, 'reminder');
            if (alert) createdAlerts.push(alert);
          }
        }
      }

      return createdAlerts;
    } catch (error) {
      console.error('Error checking medication alerts:', error);
      return [];
    }
  }

  async generateTestMedicationAlerts(userId) {
    try {
      const user = await User.findById(userId);
      if (!user?.medicalInfo?.medications || user.medicalInfo.medications.length === 0) {
        return { success: false, message: 'No medications found' };
      }

      const schedule = this.generateMedicationSchedule(user.medicalInfo.medications);
      const createdAlerts = [];

      // Create a test overdue alert
      if (schedule.length > 0) {
        const testOverdue = {
          ...schedule[0],
          scheduledTime: '08:00' // Make it seem overdue
        };
        const overdueAlert = await this.createMedicationAlert(userId, testOverdue, 'overdue');
        if (overdueAlert) createdAlerts.push(overdueAlert);
      }

      // Create a test reminder alert
      if (schedule.length > 1) {
        const testReminder = {
          ...schedule[1],
          scheduledTime: new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5) // 10 minutes from now
        };
        const reminderAlert = await this.createMedicationAlert(userId, testReminder, 'reminder');
        if (reminderAlert) createdAlerts.push(reminderAlert);
      } else if (schedule.length === 1) {
        // If only one medication, create a second reminder with different time
        const testReminder = {
          ...schedule[0],
          scheduledTime: new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5),
          doseNumber: 2
        };
        const reminderAlert = await this.createMedicationAlert(userId, testReminder, 'reminder');
        if (reminderAlert) createdAlerts.push(reminderAlert);
      }

      return {
        success: true,
        alertsCreated: createdAlerts.length,
        alerts: createdAlerts
      };
    } catch (error) {
      console.error('Error generating test medication alerts:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MedicationReminderService();
