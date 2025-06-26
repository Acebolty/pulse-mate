const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if email is disabled
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('Email service disabled by environment variable');
      this.setupMockEmailService();
      return;
    }

    // Configure email transporter based on environment
    if (process.env.NODE_ENV === 'production' || (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)) {
      // Production or development with real Gmail credentials
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER?.replace(/['"]/g, ''), // Remove quotes if present
          pass: process.env.EMAIL_PASSWORD?.replace(/['"]/g, '') // Remove quotes if present
        }
      });
      console.log('Gmail email service configured');
      console.log('Email user:', process.env.EMAIL_USER?.replace(/['"]/g, ''));
    } else {
      // Development: Use Ethereal Email for testing
      this.setupEtherealEmail();
    }
  }

  async setupEtherealEmail() {
    try {
      // Create test account for development with timeout
      const testAccount = await Promise.race([
        nodemailer.createTestAccount(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Ethereal Email timeout')), 5000)
        )
      ]);

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('Ethereal Email configured for development');
      console.log('Test account:', testAccount.user);
    } catch (error) {
      console.error('Failed to setup Ethereal Email:', error);
      console.log('Falling back to mock email service for development...');
      this.setupMockEmailService();
    }
  }

  setupMockEmailService() {
    // Create a mock transporter that simulates email sending
    this.transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 MOCK EMAIL SERVICE - Email would be sent:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Content preview:', mailOptions.text?.substring(0, 100) + '...');

        return {
          messageId: 'mock-' + Date.now(),
          response: 'Mock email sent successfully'
        };
      }
    };

    console.log('Mock email service configured - emails will be logged to console');
  }

  async sendHealthAlert(userEmail, userName, alertData) {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const emailTemplate = this.generateAlertEmailTemplate(userName, alertData);
      
      // Create urgency-based subject line
      const getSubjectLine = (alertType, title) => {
        switch (alertType) {
          case 'critical':
            return `🚨 URGENT Health Alert: ${title}`;
          case 'warning':
            return `⚠️ Important Health Alert: ${title}`;
          case 'info':
            return `ℹ️ Health Notification: ${title}`;
          default:
            return `📊 Health Alert: ${title}`;
        }
      };

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PulseMate Health Monitor <noreply@pulsemate.com>',
        to: userEmail,
        subject: getSubjectLine(alertData.type, alertData.title),
        html: emailTemplate,
        text: this.generatePlainTextAlert(userName, alertData)
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent successfully!');
        // Only try to get preview URL if it's a real Ethereal transporter
        if (info.messageId && !info.messageId.startsWith('mock-')) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' && info.messageId && !info.messageId.startsWith('mock-')
          ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send health alert email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateAlertEmailTemplate(userName, alertData) {
    const alertTypeColors = {
      critical: '#dc2626', // red-600
      warning: '#d97706',  // amber-600
      info: '#2563eb',     // blue-600
      success: '#16a34a'   // green-600
    };

    const alertTypeIcons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };

    const color = alertTypeColors[alertData.type] || '#6b7280';
    const icon = alertTypeIcons[alertData.type] || '📊';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Alert - PulseMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                    PulseMate Health Monitor
                </h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                    Your Health, Our Priority
                </p>
            </div>

            <!-- Alert Content -->
            <div style="padding: 32px 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
                    <h2 style="color: ${color}; margin: 0; font-size: 20px; font-weight: bold;">
                        ${alertData.title}
                    </h2>
                </div>

                <div style="background-color: #f9fafb; border-left: 4px solid ${color}; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.5;">
                        Hello ${userName},
                    </p>
                    <p style="margin: 16px 0 0 0; color: #374151; font-size: 16px; line-height: 1.5;">
                        ${alertData.message}
                    </p>
                </div>

                <!-- Alert Details -->
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Alert Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280; font-size: 14px; width: 30%;">Type:</td>
                            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-transform: capitalize;">${alertData.type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Time:</td>
                            <td style="padding: 4px 0; color: #1f2937; font-size: 14px;">${new Date(alertData.timestamp || alertData.createdAt).toLocaleString()}</td>
                        </tr>
                        ${alertData.source ? `
                        <tr>
                            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Source:</td>
                            <td style="padding: 4px 0; color: #1f2937; font-size: 14px;">${alertData.source}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <!-- Action Buttons -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                       style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View Dashboard
                    </a>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
                       style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View All Alerts
                    </a>
                </div>

                <!-- Recommendations -->
                ${this.getRecommendations(alertData.type, alertData.relatedDataType)}
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This is an automated health alert from PulseMate Health Monitor.
                </p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
                    To manage your notification preferences, visit your 
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #10b981;">Settings</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePlainTextAlert(userName, alertData) {
    return `
PulseMate Health Alert

Hello ${userName},

${alertData.title}

${alertData.message}

Alert Details:
- Type: ${alertData.type}
- Time: ${new Date(alertData.timestamp || alertData.createdAt).toLocaleString()}
${alertData.source ? `- Source: ${alertData.source}` : ''}

View your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard
View all alerts: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts

To manage your notification preferences, visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings

This is an automated health alert from PulseMate Health Monitor.
    `.trim();
  }

  getRecommendations(alertType, dataType) {
    const recommendations = {
      critical: {
        heartRate: "Seek immediate medical attention. Contact your doctor or emergency services.",
        bloodPressure: "Monitor closely and contact your healthcare provider immediately.",
        glucoseLevel: "Take appropriate action as advised by your doctor. Monitor frequently.",
        bodyTemperature: "Seek medical attention if fever persists or worsens."
      },
      warning: {
        heartRate: "Monitor your heart rate and consider contacting your healthcare provider.",
        bloodPressure: "Monitor your blood pressure regularly and consult your doctor.",
        glucoseLevel: "Check your diet and medication adherence. Contact your doctor if needed.",
        bodyTemperature: "Rest and stay hydrated. Monitor temperature regularly."
      }
    };

    const typeRecs = recommendations[alertType];
    if (!typeRecs) return '';

    const recommendation = typeRecs[dataType] || "Monitor your health closely and consult your healthcare provider if needed.";

    return `
    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: bold;">💡 Recommendation:</h3>
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
            ${recommendation}
        </p>
    </div>
    `;
  }

  async sendWeeklyHealthSummary(userEmail, userName, summaryData) {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const emailTemplate = this.generateWeeklySummaryEmailTemplate(userName, summaryData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PulseMate Health Monitor <noreply@pulsemate.com>',
        to: userEmail,
        subject: `📊 Your Weekly Health Summary - ${summaryData.period.start} to ${summaryData.period.end}`,
        html: emailTemplate,
        text: this.generatePlainTextWeeklySummary(userName, summaryData)
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Weekly summary email sent successfully!');
        if (info.messageId && !info.messageId.startsWith('mock-')) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' && info.messageId && !info.messageId.startsWith('mock-')
          ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send weekly health summary email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    // Implementation for welcome emails
    // This can be expanded later
  }

  async sendMedicationReminder(userEmail, userName, medicationData) {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const emailTemplate = this.generateMedicationReminderEmailTemplate(userName, medicationData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PulseMate Health Monitor <noreply@pulsemate.com>',
        to: userEmail,
        subject: `💊 Medication Reminder: ${medicationData.medicationName}`,
        html: emailTemplate,
        text: this.generatePlainTextMedicationReminder(userName, medicationData)
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Medication reminder email sent successfully!');
        if (info.messageId && !info.messageId.startsWith('mock-')) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' && info.messageId && !info.messageId.startsWith('mock-')
          ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send medication reminder email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendDailyMedicationSummary(userEmail, userName, summaryData) {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const emailTemplate = this.generateDailyMedicationSummaryTemplate(userName, summaryData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PulseMate Health Monitor <noreply@pulsemate.com>',
        to: userEmail,
        subject: `💊 Today's Medication Schedule - ${summaryData.date}`,
        html: emailTemplate,
        text: this.generatePlainTextDailyMedicationSummary(userName, summaryData)
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Daily medication summary email sent successfully!');
        if (info.messageId && !info.messageId.startsWith('mock-')) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' && info.messageId && !info.messageId.startsWith('mock-')
          ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send daily medication summary email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendAppointmentReminder(userEmail, userName, appointmentData) {
    // Implementation for appointment reminders
    // This can be expanded later
  }

  generateWeeklySummaryEmailTemplate(userName, summaryData) {
    const getMetricIcon = (dataType) => {
      const icons = {
        heartRate: '❤️',
        bloodPressure: '🩸',
        glucoseLevel: '🍯',
        bodyTemperature: '🌡️'
      };
      return icons[dataType] || '📊';
    };

    const getStatusColor = (status) => {
      const colors = {
        good: '#16a34a',
        fair: '#d97706',
        'needs attention': '#dc2626'
      };
      return colors[status] || '#6b7280';
    };

    const getTrendIcon = (direction) => {
      const icons = {
        up: '📈',
        down: '📉',
        stable: '➡️'
      };
      return icons[direction] || '➡️';
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Health Summary - PulseMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                    📊 Weekly Health Summary
                </h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                    ${summaryData.period.start} - ${summaryData.period.end}
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
                    Hello ${userName}! 👋
                </h2>
                <p style="color: #374151; margin: 0 0 24px 0; line-height: 1.5;">
                    Here's your weekly health summary. You logged <strong>${summaryData.totalReadings} readings</strong> this week.
                </p>

                <!-- Metrics Summary -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: bold;">📈 Health Metrics</h3>
                    ${Object.entries(summaryData.metrics).map(([dataType, data]) => `
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h4 style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                                ${getMetricIcon(dataType)} ${this.getMetricDisplayName(dataType)}
                            </h4>
                            <span style="background-color: ${getStatusColor(data.status)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                ${data.status}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #6b7280;">
                            <span>Average: <strong style="color: #1f2937;">${data.average}${this.getMetricUnit(dataType)}</strong></span>
                            <span>Readings: <strong style="color: #1f2937;">${data.count}</strong></span>
                        </div>
                        ${data.trend ? `
                        <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">
                            ${getTrendIcon(data.trend.direction)} ${data.trend.description} vs last week (${data.trend.change > 0 ? '+' : ''}${data.trend.change}${this.getMetricUnit(dataType)})
                        </div>
                        ` : ''}
                    </div>
                    `).join('')}
                </div>

                <!-- Alerts Summary -->
                ${summaryData.alerts.total > 0 ? `
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: bold;">🚨 Alerts This Week</h3>
                    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px;">
                        <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">
                            <strong>${summaryData.alerts.total} alerts</strong> were generated this week:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                            ${summaryData.alerts.critical > 0 ? `<li>${summaryData.alerts.critical} critical alerts</li>` : ''}
                            ${summaryData.alerts.warning > 0 ? `<li>${summaryData.alerts.warning} warning alerts</li>` : ''}
                            ${summaryData.alerts.info > 0 ? `<li>${summaryData.alerts.info} info alerts</li>` : ''}
                        </ul>
                    </div>
                </div>
                ` : `
                <div style="margin-bottom: 24px;">
                    <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center;">
                        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 500;">
                            ✅ Great news! No health alerts were generated this week.
                        </p>
                    </div>
                </div>
                `}

                <!-- Insights -->
                ${summaryData.insights.length > 0 ? `
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: bold;">💡 Insights</h3>
                    ${summaryData.insights.map(insight => `
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">${insight}</p>
                    </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Action Buttons -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
                       style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View Dashboard
                    </a>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/health-metrics"
                       style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View Detailed Metrics
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This is your automated weekly health summary from PulseMate.
                </p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
                    To manage your notification preferences, visit your
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #10b981;">Settings</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getMetricDisplayName(dataType) {
    const names = {
      heartRate: 'Heart Rate',
      bloodPressure: 'Blood Pressure',
      glucoseLevel: 'Blood Glucose',
      bodyTemperature: 'Body Temperature'
    };
    return names[dataType] || dataType;
  }

  getMetricUnit(dataType) {
    const units = {
      heartRate: ' bpm',
      bloodPressure: ' mmHg',
      glucoseLevel: ' mg/dL',
      bodyTemperature: '°F'
    };
    return units[dataType] || '';
  }

  generatePlainTextWeeklySummary(userName, summaryData) {
    return `
PulseMate Weekly Health Summary
${summaryData.period.start} - ${summaryData.period.end}

Hello ${userName}!

This week you logged ${summaryData.totalReadings} health readings.

HEALTH METRICS:
${Object.entries(summaryData.metrics).map(([dataType, data]) => `
${this.getMetricDisplayName(dataType)}:
- Average: ${data.average}${this.getMetricUnit(dataType)}
- Status: ${data.status}
- Readings: ${data.count}
${data.trend ? `- Trend: ${data.trend.description} vs last week` : ''}
`).join('')}

${summaryData.alerts.total > 0 ? `
ALERTS THIS WEEK: ${summaryData.alerts.total}
- Critical: ${summaryData.alerts.critical}
- Warning: ${summaryData.alerts.warning}
- Info: ${summaryData.alerts.info}
` : 'ALERTS: No alerts generated this week! ✅'}

${summaryData.insights.length > 0 ? `
INSIGHTS:
${summaryData.insights.map(insight => `- ${insight.replace(/[📈📉➡️📊🎯✅⚠️]/g, '')}`).join('\n')}
` : ''}

View your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

To manage your notification preferences, visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings

This is your automated weekly health summary from PulseMate.
    `.trim();
  }

  generateMedicationReminderEmailTemplate(userName, medicationData) {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medication Reminder - PulseMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                    💊 Medication Reminder
                </h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                    Time to take your medication
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
                    Hello ${userName}! 👋
                </h2>
                <p style="color: #374151; margin: 0 0 24px 0; line-height: 1.5;">
                    It's time to take your medication. Here are the details:
                </p>

                <!-- Medication Details -->
                <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <div style="text-align: center;">
                        <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 20px; font-weight: bold;">
                            ${medicationData.medicationName}
                        </h3>
                        <div style="background-color: white; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
                            <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                Dosage: ${medicationData.dosage}
                            </p>
                        </div>
                        <div style="display: flex; justify-content: space-between; text-align: left; font-size: 14px; color: #6b7280;">
                            <div>
                                <strong style="color: #1f2937;">Scheduled Time:</strong><br>
                                ${medicationData.scheduledTime}
                            </div>
                            <div>
                                <strong style="color: #1f2937;">Frequency:</strong><br>
                                ${medicationData.frequency}
                            </div>
                            ${medicationData.totalDoses > 1 ? `
                            <div>
                                <strong style="color: #1f2937;">Dose:</strong><br>
                                ${medicationData.doseNumber} of ${medicationData.totalDoses} today
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Important Reminders -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
                        📋 Important Reminders:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.5;">
                        <li>Take with food if recommended by your doctor</li>
                        <li>Don't skip doses unless advised by your healthcare provider</li>
                        <li>Contact your doctor if you experience any side effects</li>
                        <li>Keep track of when you take your medication</li>
                    </ul>
                </div>

                <!-- Action Buttons -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile"
                       style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View My Medications
                    </a>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings"
                       style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        Reminder Settings
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This is an automated medication reminder from PulseMate.
                </p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
                    To manage your medication reminders, visit your
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #3b82f6;">Settings</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePlainTextMedicationReminder(userName, medicationData) {
    return `
PulseMate Medication Reminder

Hello ${userName}!

It's time to take your medication:

MEDICATION: ${medicationData.medicationName}
DOSAGE: ${medicationData.dosage}
SCHEDULED TIME: ${medicationData.scheduledTime}
FREQUENCY: ${medicationData.frequency}
${medicationData.totalDoses > 1 ? `DOSE: ${medicationData.doseNumber} of ${medicationData.totalDoses} today` : ''}

IMPORTANT REMINDERS:
- Take with food if recommended by your doctor
- Don't skip doses unless advised by your healthcare provider
- Contact your doctor if you experience any side effects
- Keep track of when you take your medication

View your medications: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile
Manage reminder settings: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings

This is an automated medication reminder from PulseMate.
    `.trim();
  }

  generateDailyMedicationSummaryTemplate(userName, summaryData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Medication Schedule - PulseMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                    💊 Today's Medication Schedule
                </h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                    ${summaryData.date}
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
                    Good morning, ${userName}! 🌅
                </h2>
                <p style="color: #374151; margin: 0 0 24px 0; line-height: 1.5;">
                    Here's your medication schedule for today. You have <strong>${summaryData.totalDoses} doses</strong>
                    from <strong>${summaryData.totalMedications} medication${summaryData.totalMedications > 1 ? 's' : ''}</strong> scheduled.
                </p>

                <!-- Medication Schedule -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: bold;">📅 Today's Schedule</h3>
                    ${summaryData.medications.map(med => `
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    ${med.medicationName}
                                </h4>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    ${med.dosage} • ${med.frequency}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background-color: #8b5cf6; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">
                                    ${med.scheduledTime}
                                </span>
                                ${med.totalDoses > 1 ? `
                                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">
                                    Dose ${med.doseNumber} of ${med.totalDoses}
                                </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>

                <!-- Tips -->
                <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <h4 style="color: #065f46; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
                        💡 Daily Tips:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px; line-height: 1.5;">
                        <li>Set alarms for each medication time</li>
                        <li>Keep medications in a visible place</li>
                        <li>Use a pill organizer for complex schedules</li>
                        <li>Take medications at the same times each day</li>
                    </ul>
                </div>

                <!-- Action Buttons -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile"
                       style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        View My Medications
                    </a>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
                       style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
                        Go to Dashboard
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This is your daily medication schedule from PulseMate.
                </p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
                    To manage your medication reminders, visit your
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #8b5cf6;">Settings</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePlainTextDailyMedicationSummary(userName, summaryData) {
    return `
PulseMate Daily Medication Schedule
${summaryData.date}

Good morning, ${userName}!

Today you have ${summaryData.totalDoses} doses from ${summaryData.totalMedications} medication${summaryData.totalMedications > 1 ? 's' : ''} scheduled.

TODAY'S SCHEDULE:
${summaryData.medications.map(med => `
${med.scheduledTime} - ${med.medicationName}
  Dosage: ${med.dosage}
  Frequency: ${med.frequency}
  ${med.totalDoses > 1 ? `Dose ${med.doseNumber} of ${med.totalDoses}` : ''}
`).join('')}

DAILY TIPS:
- Set alarms for each medication time
- Keep medications in a visible place
- Use a pill organizer for complex schedules
- Take medications at the same times each day

View your medications: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile
Go to dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

This is your daily medication schedule from PulseMate.
    `.trim();
  }
}

module.exports = new EmailService();
