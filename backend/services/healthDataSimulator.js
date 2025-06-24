const HealthData = require('../models/HealthData');

class HealthDataSimulator {
  constructor(userId) {
    this.userId = userId;
    this.baselineData = {
      heartRate: { min: 65, max: 85, resting: 72 },
      bloodPressure: { systolic: { min: 110, max: 130, normal: 120 }, diastolic: { min: 70, max: 85, normal: 80 } },
      glucoseLevel: { min: 80, max: 100, normal: 90 },
      weight: { baseline: 175, variance: 2 }, // lbs
      bodyTemperature: { min: 97.8, max: 99.2, normal: 98.6 },
      stepsTaken: { min: 6000, max: 12000, target: 10000 },
      sleepDuration: { min: 6.5, max: 9, optimal: 8 }
    };
  }

  // Generate realistic variation based on time of day and activity
  generateHeartRate(hour, activityLevel = 'normal') {
    const { min, max, resting } = this.baselineData.heartRate;
    let baseRate = resting;

    // Time of day variations
    if (hour >= 6 && hour <= 9) baseRate += 5; // Morning rise
    else if (hour >= 10 && hour <= 16) baseRate += 8; // Active day
    else if (hour >= 17 && hour <= 20) baseRate += 3; // Evening
    else baseRate -= 5; // Night/rest

    // Activity level adjustments
    const activityMultiplier = {
      'rest': 0.85,
      'normal': 1.0,
      'light_exercise': 1.3,
      'moderate_exercise': 1.6,
      'intense_exercise': 2.0
    };

    baseRate *= activityMultiplier[activityLevel] || 1.0;

    // Add realistic random variation
    const variation = (Math.random() - 0.5) * 10;
    const heartRate = Math.round(Math.max(min, Math.min(max * 1.2, baseRate + variation)));

    return heartRate;
  }

  generateBloodPressure(hour, stressLevel = 'normal') {
    const { systolic, diastolic } = this.baselineData.bloodPressure;
    
    // Stress level adjustments
    const stressMultiplier = {
      'low': 0.95,
      'normal': 1.0,
      'moderate': 1.1,
      'high': 1.25
    };

    const multiplier = stressMultiplier[stressLevel] || 1.0;
    
    // Time of day variations (higher in morning, lower at night)
    let timeAdjustment = 0;
    if (hour >= 6 && hour <= 10) timeAdjustment = 5; // Morning surge
    else if (hour >= 22 || hour <= 5) timeAdjustment = -8; // Night dip

    const systolicValue = Math.round(
      Math.max(90, Math.min(160, 
        (systolic.normal + timeAdjustment) * multiplier + (Math.random() - 0.5) * 15
      ))
    );

    const diastolicValue = Math.round(
      Math.max(60, Math.min(100, 
        (diastolic.normal + timeAdjustment * 0.6) * multiplier + (Math.random() - 0.5) * 10
      ))
    );

    return { systolic: systolicValue, diastolic: diastolicValue };
  }

  generateGlucoseLevel(hour, mealStatus = 'fasting') {
    const { min, max, normal } = this.baselineData.glucoseLevel;
    let baseLevel = normal;

    // Meal status adjustments
    const mealAdjustments = {
      'fasting': 0,
      'post_meal_1hr': 25,
      'post_meal_2hr': 15,
      'post_meal_3hr': 5
    };

    baseLevel += mealAdjustments[mealStatus] || 0;

    // Time of day variations (dawn phenomenon)
    if (hour >= 4 && hour <= 8) baseLevel += 5;

    // Random variation
    const variation = (Math.random() - 0.5) * 12;
    const glucoseLevel = Math.round(Math.max(70, Math.min(140, baseLevel + variation)));

    return glucoseLevel;
  }

  generateWeight(dayOffset = 0) {
    const { baseline, variance } = this.baselineData.weight;
    
    // Gradual weight trend (slight decrease over time for health improvement)
    const trendAdjustment = dayOffset * -0.02; // Lose ~0.14 lbs per week
    
    // Daily fluctuations
    const dailyVariation = (Math.random() - 0.5) * variance;
    
    const weight = baseline + trendAdjustment + dailyVariation;
    return Math.round(weight * 10) / 10; // Round to 1 decimal
  }

  generateBodyTemperature(hour, healthStatus = 'healthy') {
    const { min, max, normal } = this.baselineData.bodyTemperature;
    let baseTemp = normal;

    // Health status adjustments
    const healthAdjustments = {
      'healthy': 0,
      'slight_fever': 1.5,
      'fever': 2.8,
      'hypothermia': -1.2
    };

    baseTemp += healthAdjustments[healthStatus] || 0;

    // Circadian rhythm (lower at night, higher in evening)
    const circadianAdjustment = Math.sin((hour - 6) * Math.PI / 12) * 0.4;
    baseTemp += circadianAdjustment;

    // Random variation
    const variation = (Math.random() - 0.5) * 0.6;
    const temperature = Math.max(95, Math.min(104, baseTemp + variation));

    return Math.round(temperature * 10) / 10;
  }

  generateSteps(dayType = 'weekday') {
    const { min, max, target } = this.baselineData.stepsTaken;
    
    // Day type adjustments
    const dayMultipliers = {
      'weekday': 1.0,
      'weekend': 0.8,
      'active_day': 1.4,
      'rest_day': 0.6
    };

    const baseSteps = target * (dayMultipliers[dayType] || 1.0);
    const variation = (Math.random() - 0.3) * 3000; // Slight bias toward higher steps
    
    const steps = Math.round(Math.max(min, Math.min(max * 1.2, baseSteps + variation)));
    return steps;
  }



  generateSleepDuration(dayType = 'weekday', stressLevel = 'normal') {
    const { min, max, optimal } = this.baselineData.sleepDuration;

    // Day type adjustments (more realistic patterns)
    const sleepAdjustments = {
      'weekday': -0.4,        // Less sleep on work days
      'weekend': 0.8,         // More sleep on weekends
      'stressful_day': -1.2,  // Poor sleep when stressed
      'relaxed_day': 0.4,     // Good sleep when relaxed
      'sick_day': 1.0,        // More sleep when sick
      'active_day': -0.2      // Slightly less but better quality
    };

    // Stress level affects sleep quality
    const stressAdjustments = {
      'low': 0.3,
      'normal': 0,
      'moderate': -0.5,
      'high': -1.0
    };

    const baseSleep = optimal + (sleepAdjustments[dayType] || 0) + (stressAdjustments[stressLevel] || 0);
    const variation = (Math.random() - 0.5) * 1.2; // Reduced variation for more realistic patterns

    const sleepHours = Math.max(min, Math.min(max, baseSleep + variation));
    return Math.round(sleepHours * 10) / 10;
  }

  // Generate a full day's worth of realistic health data
  async generateDayData(date, scenario = 'normal') {
    const dayData = [];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType = isWeekend ? 'weekend' : 'weekday';

    // Scenario adjustments
    const scenarios = {
      'normal': { stress: 'normal', health: 'healthy', activity: dayType },
      'sick_day': { stress: 'normal', health: 'slight_fever', activity: 'rest_day' },
      'active_day': { stress: 'low', health: 'healthy', activity: 'active_day' },
      'stressful_day': { stress: 'high', health: 'healthy', activity: dayType }
    };

    const dayScenario = scenarios[scenario] || scenarios['normal'];
    const dayOffset = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));

    // Generate daily metrics
    const dailySteps = this.generateSteps(dayScenario.activity);
    const dailyWeight = this.generateWeight(dayOffset);
    const dailySleep = this.generateSleepDuration(dayScenario.activity, dayScenario.stress);

    // Morning readings (6-9 AM)
    const morningHour = 7 + Math.random() * 2;
    const morningTime = new Date(date);
    morningTime.setHours(Math.floor(morningHour), Math.floor((morningHour % 1) * 60), 0, 0);

    // Heart Rate (morning)
    const morningHR = this.generateHeartRate(morningHour, 'normal');
    dayData.push({
      userId: this.userId,
      dataType: 'heartRate',
      value: morningHR,
      unit: 'bpm',
      timestamp: new Date(morningTime),
      source: 'Apple Watch'
    });

    // Blood Pressure (morning)
    const morningBP = this.generateBloodPressure(morningHour, dayScenario.stress);
    dayData.push({
      userId: this.userId,
      dataType: 'bloodPressure',
      value: morningBP,
      unit: 'mmHg',
      timestamp: new Date(morningTime.getTime() + 5 * 60000), // 5 min later
      source: 'BP Monitor'
    });

    // Weight (morning)
    dayData.push({
      userId: this.userId,
      dataType: 'weight',
      value: dailyWeight,
      unit: 'lbs',
      timestamp: new Date(morningTime.getTime() + 10 * 60000), // 10 min later
      source: 'Smart Scale'
    });

    // Body Temperature (morning)
    const morningTemp = this.generateBodyTemperature(morningHour, dayScenario.health);
    dayData.push({
      userId: this.userId,
      dataType: 'bodyTemperature',
      value: morningTemp,
      unit: '°F',
      timestamp: new Date(morningTime.getTime() + 15 * 60000), // 15 min later
      source: 'Smart Thermometer'
    });

    // Glucose (fasting - morning)
    const fastingGlucose = this.generateGlucoseLevel(morningHour, 'fasting');
    dayData.push({
      userId: this.userId,
      dataType: 'glucoseLevel',
      value: fastingGlucose,
      unit: 'mg/dL',
      timestamp: new Date(morningTime.getTime() + 20 * 60000), // 20 min later
      source: 'Glucose Monitor',
      notes: 'Fasting'
    });

    // Evening readings (6-9 PM)
    const eveningHour = 19 + Math.random() * 2;
    const eveningTime = new Date(date);
    eveningTime.setHours(Math.floor(eveningHour), Math.floor((eveningHour % 1) * 60), 0, 0);

    // Steps (end of day)
    dayData.push({
      userId: this.userId,
      dataType: 'stepsTaken',
      value: dailySteps,
      unit: 'steps',
      timestamp: eveningTime,
      source: 'iPhone'
    });

    // Sleep (previous night - recorded in morning, only for past days)
    if (date < new Date()) { // Only add sleep for past days
      const sleepTime = new Date(morningTime.getTime() + 25 * 60000); // 25 min after morning routine
      dayData.push({
        userId: this.userId,
        dataType: 'sleepDuration',
        value: dailySleep,
        unit: 'hours',
        timestamp: sleepTime,
        source: 'Sleep Tracker',
        notes: `Sleep quality: ${dailySleep >= 8 ? 'Excellent' : dailySleep >= 7 ? 'Good' : dailySleep >= 6 ? 'Fair' : 'Poor'}`
      });
    }

    return dayData;
  }

  // Generate multiple days of data
  async generateMultipleDays(startDate, numberOfDays, scenarios = []) {
    const allData = [];
    
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Use provided scenario or default rotation
      const scenario = scenarios[i] || (i % 7 === 0 ? 'active_day' : 'normal');
      
      const dayData = await this.generateDayData(currentDate, scenario);
      allData.push(...dayData);
    }
    
    return allData;
  }

  // Save generated data to database
  async saveToDatabase(healthDataArray) {
    try {
      // Clear existing data for this user (optional)
      // await HealthData.deleteMany({ userId: this.userId });
      
      // Insert new data
      const savedData = await HealthData.insertMany(healthDataArray);
      return savedData;
    } catch (error) {
      console.error('Error saving simulated health data:', error);
      throw error;
    }
  }
}

module.exports = HealthDataSimulator;
