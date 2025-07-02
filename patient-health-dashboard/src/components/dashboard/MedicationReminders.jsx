import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, BeakerIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import api from '../../services/api';

const MedicationReminders = () => {
  const [medicationData, setMedicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [takenMedications, setTakenMedications] = useState(new Set());

  // Load taken medications from localStorage on component mount
  useEffect(() => {
    loadTakenMedications();
    fetchMedicationSchedule();
  }, []);

  const loadTakenMedications = () => {
    try {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('takenMedications');

      if (storedData) {
        const parsed = JSON.parse(storedData);

        // Check if the stored data is from today
        if (parsed.date === today) {
          setTakenMedications(new Set(parsed.medications));
          console.log('Loaded taken medications from localStorage:', parsed.medications);
        } else {
          // Clear old data if it's from a previous day
          localStorage.removeItem('takenMedications');
          console.log('Cleared old taken medications data');
        }
      }
    } catch (error) {
      console.error('Error loading taken medications:', error);
      localStorage.removeItem('takenMedications');
    }
  };

  const saveTakenMedications = (medications) => {
    try {
      const today = new Date().toDateString();
      const dataToStore = {
        date: today,
        medications: Array.from(medications)
      };
      localStorage.setItem('takenMedications', JSON.stringify(dataToStore));
      console.log('Saved taken medications to localStorage');
    } catch (error) {
      console.error('Error saving taken medications:', error);
    }
  };

  const fetchMedicationSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email-test/medication-schedule');
      setMedicationData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medication schedule:', err);
      setError('Failed to load medication schedule');
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationName, scheduledTime) => {
    try {
      console.log(`Marking ${medicationName} as taken for ${scheduledTime}`);

      // Create a unique key for this medication dose
      const medicationKey = `${medicationName}-${scheduledTime}-${new Date().toDateString()}`;

      // Add to taken medications set and save to localStorage
      setTakenMedications(prev => {
        const newSet = new Set([...prev, medicationKey]);
        saveTakenMedications(newSet);
        return newSet;
      });

      // Try to mark any medication alerts as read
      try {
        const alertsResponse = await api.get('/alerts');
        const alerts = alertsResponse.data.data || [];

        // Find any unread medication alerts
        const medicationAlerts = alerts.filter(alert =>
          !alert.isRead &&
          (alert.title.toLowerCase().includes('medication') ||
           alert.source === 'Medication Reminder System')
        );

        console.log(`Found ${medicationAlerts.length} medication alerts to mark as read`);

        // Mark all medication alerts as read
        for (const alert of medicationAlerts) {
          try {
            await api.put(`/alerts/${alert._id}/read`);
            console.log(`Marked alert as read: ${alert.title}`);
          } catch (alertError) {
            console.error(`Failed to mark alert ${alert._id} as read:`, alertError);
          }
        }

        // Trigger alert refresh in sidebar
        window.dispatchEvent(new CustomEvent('alertUpdated'));

      } catch (alertError) {
        console.error('Error marking alerts as read:', alertError);
        // Continue even if alert marking fails
      }

      console.log(`Successfully marked ${medicationName} as taken`);
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  // Check if a medication has been marked as taken today
  const isMedicationTaken = (medicationName, scheduledTime) => {
    const medicationKey = `${medicationName}-${scheduledTime}-${new Date().toDateString()}`;
    return takenMedications.has(medicationKey);
  };

  // Clear all taken medications (useful for testing)
  const clearTakenMedications = () => {
    setTakenMedications(new Set());
    localStorage.removeItem('takenMedications');
    console.log('Cleared all taken medications');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const isUpcoming = (scheduledTime) => {
    const now = new Date();
    const [schedHour, schedMin] = scheduledTime.split(':').map(Number);
    const schedTime = schedHour * 60 + schedMin;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Consider upcoming if within next 2 hours
    return schedTime > currentTime && schedTime <= currentTime + 120;
  };

  const isOverdue = (scheduledTime) => {
    const now = new Date();
    const [schedHour, schedMin] = scheduledTime.split(':').map(Number);
    const schedTime = schedHour * 60 + schedMin;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Consider overdue if more than 30 minutes past
    return currentTime > schedTime + 30;
  };

  const getTimeUntil = (scheduledTime) => {
    const now = new Date();
    const [schedHour, schedMin] = scheduledTime.split(':').map(Number);
    const schedTime = schedHour * 60 + schedMin;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const diffMinutes = schedTime - currentTime;
    
    if (diffMinutes < 0) {
      const overdue = Math.abs(diffMinutes);
      if (overdue < 60) return `${overdue}m overdue`;
      return `${Math.floor(overdue / 60)}h ${overdue % 60}m overdue`;
    }
    
    if (diffMinutes < 60) return `in ${diffMinutes}m`;
    return `in ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchMedicationSchedule}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!medicationData || medicationData.totalMedications === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center mb-4">
          <BeakerIcon className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Medication Reminders
          </h3>
        </div>
        <div className="text-center py-8">
          <BeakerIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            No medications found in your profile.
          </p>
          <a
            href="/profile"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Medications
          </a>
        </div>
      </div>
    );
  }

  // Filter out taken medications
  const upcomingMedications = medicationData.schedule.filter(med =>
    isUpcoming(med.scheduledTime) && !isMedicationTaken(med.medicationName, med.scheduledTime)
  );
  const overdueMedications = medicationData.schedule.filter(med =>
    isOverdue(med.scheduledTime) && !isMedicationTaken(med.medicationName, med.scheduledTime)
  );
  const todaysMedications = medicationData.schedule.slice(0, 6); // Show more for today

  console.log('Widget - Upcoming medications:', upcomingMedications.length);
  console.log('Widget - Overdue medications:', overdueMedications.length);
  console.log('Widget - Today\'s medications:', todaysMedications.length);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BeakerIcon className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Medication Reminders
          </h3>
          {overdueMedications.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {overdueMedications.length}
            </span>
          )}
          {upcomingMedications.length > 0 && overdueMedications.length === 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {upcomingMedications.length}
            </span>
          )}
        </div>
        {/* <div className="text-sm text-gray-500 dark:text-slate-400">
          {medicationData.totalMedications} medication{medicationData.totalMedications > 1 ? 's' : ''}
        </div> */}
      </div>

      {/* Overdue Medications */}
      {overdueMedications.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            Overdue ({overdueMedications.length})
          </h4>
          <div className="space-y-2">
            {overdueMedications.map((medication, index) => (
              <motion.div
                key={`overdue-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-red-900 dark:text-red-100">
                      {medication.medicationName}
                    </h5>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {medication.dosage} • {getTimeUntil(medication.scheduledTime)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {medication.scheduledTime}
                    </span>
                    <button
                      onClick={() => markAsTaken(medication.medicationName, medication.scheduledTime)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      title="Mark as taken"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Medications */}
      {upcomingMedications.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Upcoming ({upcomingMedications.length})
          </h4>
          <div className="space-y-2">
            {upcomingMedications.map((medication, index) => (
              <motion.div
                key={`upcoming-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">
                      {medication.medicationName}
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {medication.dosage} • {getTimeUntil(medication.scheduledTime)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {medication.scheduledTime}
                    </span>
                    <button
                      onClick={() => markAsTaken(medication.medicationName, medication.scheduledTime)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      title="Mark as taken"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Today's Schedule
        </h4>
        <div className="space-y-2">
          {todaysMedications.map((medication, index) => {
            const upcoming = isUpcoming(medication.scheduledTime);
            const overdue = isOverdue(medication.scheduledTime);
            
            const isTaken = isMedicationTaken(medication.medicationName, medication.scheduledTime);

            return (
              <motion.div
                key={`today-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  isTaken
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 opacity-75'
                    : overdue
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
                    : upcoming
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
                    : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className={`font-medium ${
                      isTaken ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {medication.medicationName}
                      {isTaken && <span className="ml-2 text-xs text-green-600">✓ Taken</span>}
                    </h5>
                    <p className={`text-sm ${
                      isTaken ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-slate-400'
                    }`}>
                      {medication.dosage}
                      {medication.totalDoses > 1 && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded">
                          Dose {medication.doseNumber} of {medication.totalDoses}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        isTaken ? 'text-green-600 dark:text-green-400' :
                        overdue ? 'text-red-600 dark:text-red-400' :
                        upcoming ? 'text-blue-600 dark:text-blue-400' :
                        'text-gray-600 dark:text-slate-400'
                      }`}>
                        {medication.scheduledTime}
                      </span>
                      {(upcoming || overdue) && !isTaken && (
                        <p className={`text-xs ${
                          overdue ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {getTimeUntil(medication.scheduledTime)}
                        </p>
                      )}
                    </div>
                    {!isTaken ? (
                      <button
                        onClick={() => markAsTaken(medication.medicationName, medication.scheduledTime)}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        title="Mark as taken"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-2 bg-green-200 text-green-700 rounded-lg">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {medicationData.insights && medicationData.insights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="space-y-2">
            {medicationData.insights.slice(0, 2).map((insight, index) => (
              <p key={index} className="text-sm text-gray-600 dark:text-slate-400">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default MedicationReminders;
