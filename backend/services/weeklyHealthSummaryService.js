const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const User = require('../models/User');
const emailService = require('./emailService');

class WeeklyHealthSummaryService {
  constructor() {
    this.dataTypes = ['heartRate', 'bloodPressure', 'glucoseLevel', 'bodyTemperature'];
  }

  async generateWeeklySummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get date ranges for this week and last week
      const now = new Date();
      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const lastWeekEnd = thisWeekStart;

      // Get health data for both weeks
      const thisWeekData = await this.getWeekData(userId, thisWeekStart, now);
      const lastWeekData = await this.getWeekData(userId, lastWeekStart, lastWeekEnd);

      // Get alerts for this week
      const thisWeekAlerts = await Alert.find({
        userId: userId,
        createdAt: { $gte: thisWeekStart, $lte: now }
      }).sort({ createdAt: -1 });

      // Calculate summary statistics
      const summary = {
        user: {
          name: user.firstName || 'User',
          email: user.email
        },
        period: {
          start: thisWeekStart.toLocaleDateString(),
          end: now.toLocaleDateString()
        },
        metrics: this.calculateMetricsSummary(thisWeekData, lastWeekData),
        alerts: this.summarizeAlerts(thisWeekAlerts),
        insights: this.generateInsights(thisWeekData, lastWeekData, thisWeekAlerts),
        totalReadings: thisWeekData.length,
        readingsComparison: this.compareReadingCounts(thisWeekData, lastWeekData)
      };

      return summary;
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      throw error;
    }
  }

  async getWeekData(userId, startDate, endDate) {
    return await HealthData.find({
      userId: userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
  }

  calculateMetricsSummary(thisWeekData, lastWeekData) {
    const summary = {};

    for (const dataType of this.dataTypes) {
      const thisWeekValues = thisWeekData
        .filter(d => d.dataType === dataType)
        .map(d => this.extractValue(d.value, dataType));

      const lastWeekValues = lastWeekData
        .filter(d => d.dataType === dataType)
        .map(d => this.extractValue(d.value, dataType));

      if (thisWeekValues.length > 0) {
        const thisWeekAvg = this.calculateAverage(thisWeekValues);
        const lastWeekAvg = lastWeekValues.length > 0 ? this.calculateAverage(lastWeekValues) : null;
        
        summary[dataType] = {
          count: thisWeekValues.length,
          average: thisWeekAvg,
          min: Math.min(...thisWeekValues),
          max: Math.max(...thisWeekValues),
          trend: lastWeekAvg ? this.calculateTrend(thisWeekAvg, lastWeekAvg) : null,
          status: this.getHealthStatus(dataType, thisWeekAvg)
        };
      }
    }

    return summary;
  }

  extractValue(value, dataType) {
    if (dataType === 'bloodPressure' && typeof value === 'object') {
      // For blood pressure, use systolic for trend analysis
      return value.systolic || 0;
    }
    return typeof value === 'number' ? value : 0;
  }

  calculateAverage(values) {
    return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
  }

  calculateTrend(thisWeek, lastWeek) {
    const change = thisWeek - lastWeek;
    const percentChange = Math.round((change / lastWeek) * 100);
    
    return {
      change: Math.round(change),
      percentChange: percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      description: this.getTrendDescription(change, percentChange)
    };
  }

  getTrendDescription(change, percentChange) {
    const absPercent = Math.abs(percentChange);
    if (absPercent < 5) return 'stable';
    if (absPercent < 15) return change > 0 ? 'slightly up' : 'slightly down';
    if (absPercent < 25) return change > 0 ? 'moderately up' : 'moderately down';
    return change > 0 ? 'significantly up' : 'significantly down';
  }

  getHealthStatus(dataType, average) {
    const ranges = {
      heartRate: { good: [60, 100], warning: [50, 120] },
      bloodPressure: { good: [90, 140], warning: [80, 160] }, // Using systolic
      glucoseLevel: { good: [80, 140], warning: [70, 180] },
      bodyTemperature: { good: [97, 99], warning: [95, 101] }
    };

    const range = ranges[dataType];
    if (!range) return 'unknown';

    if (average >= range.good[0] && average <= range.good[1]) return 'good';
    if (average >= range.warning[0] && average <= range.warning[1]) return 'fair';
    return 'needs attention';
  }

  summarizeAlerts(alerts) {
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length,
      recent: alerts.slice(0, 3).map(a => ({
        type: a.type,
        title: a.title,
        date: a.createdAt.toLocaleDateString()
      }))
    };

    return summary;
  }

  generateInsights(thisWeekData, lastWeekData, alerts) {
    const insights = [];

    // Reading frequency insight
    if (thisWeekData.length > lastWeekData.length) {
      insights.push("📈 Great job! You logged more health readings this week than last week.");
    } else if (thisWeekData.length < lastWeekData.length) {
      insights.push("📊 Consider logging health readings more consistently for better tracking.");
    }

    // Alert insights
    if (alerts.length === 0) {
      insights.push("✅ Excellent! No health alerts were generated this week.");
    } else if (alerts.filter(a => a.type === 'critical').length > 0) {
      insights.push("⚠️ You had some critical health alerts this week. Consider consulting your healthcare provider.");
    }

    // Data consistency insight
    const dataTypesCovered = [...new Set(thisWeekData.map(d => d.dataType))];
    if (dataTypesCovered.length >= 3) {
      insights.push("🎯 You're tracking multiple health metrics consistently. Keep it up!");
    }

    return insights;
  }

  compareReadingCounts(thisWeekData, lastWeekData) {
    const thisWeekCount = thisWeekData.length;
    const lastWeekCount = lastWeekData.length;
    const change = thisWeekCount - lastWeekCount;

    return {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      change: change,
      trend: change > 0 ? 'increased' : change < 0 ? 'decreased' : 'same'
    };
  }

  async sendWeeklySummaryEmail(userId) {
    try {
      const user = await User.findById(userId);
      
      // Check if user has weekly summary emails enabled
      if (!user?.settings?.notifications?.emailNotifications || 
          !user?.settings?.notifications?.weeklyHealthSummary) {
        console.log(`Weekly summary email disabled for user ${userId}`);
        return { success: false, reason: 'disabled' };
      }

      const summary = await this.generateWeeklySummary(userId);
      
      const emailResult = await emailService.sendWeeklyHealthSummary(
        user.email,
        user.firstName || 'User',
        summary
      );

      if (emailResult.success) {
        console.log(`Weekly health summary email sent to: ${user.email}`);
      }

      return emailResult;
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWeeklySummariesToAllUsers() {
    try {
      const users = await User.find({
        'settings.notifications.emailNotifications': true,
        'settings.notifications.weeklyHealthSummary': true
      });

      console.log(`Sending weekly summaries to ${users.length} users...`);

      const results = [];
      for (const user of users) {
        const result = await this.sendWeeklySummaryEmail(user._id);
        results.push({ userId: user._id, email: user.email, ...result });
        
        // Add delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return results;
    } catch (error) {
      console.error('Error sending weekly summaries to all users:', error);
      throw error;
    }
  }
}

module.exports = new WeeklyHealthSummaryService();
