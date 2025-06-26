import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, BeakerIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const MedicationReminders = () => {
  const [medicationData, setMedicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicationSchedule();
  }, []);

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

  const upcomingMedications = medicationData.schedule.filter(med => isUpcoming(med.scheduledTime));
  const overdueMedications = medicationData.schedule.filter(med => isOverdue(med.scheduledTime));
  const todaysMedications = medicationData.schedule.slice(0, 3); // Show first 3 for today

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
        <div className="text-sm text-gray-500 dark:text-slate-400">
          {medicationData.totalMedications} medication{medicationData.totalMedications > 1 ? 's' : ''}
        </div>
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
                  <div>
                    <h5 className="font-medium text-red-900 dark:text-red-100">
                      {medication.medicationName}
                    </h5>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {medication.dosage} • {getTimeUntil(medication.scheduledTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {medication.scheduledTime}
                    </span>
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
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">
                      {medication.medicationName}
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {medication.dosage} • {getTimeUntil(medication.scheduledTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {medication.scheduledTime}
                    </span>
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
            
            return (
              <motion.div
                key={`today-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  overdue 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
                    : upcoming 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
                    : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-slate-100">
                      {medication.medicationName}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {medication.dosage}
                      {medication.totalDoses > 1 && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded">
                          Dose {medication.doseNumber} of {medication.totalDoses}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      overdue ? 'text-red-600 dark:text-red-400' :
                      upcoming ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-600 dark:text-slate-400'
                    }`}>
                      {medication.scheduledTime}
                    </span>
                    {(upcoming || overdue) && (
                      <p className={`text-xs ${
                        overdue ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {getTimeUntil(medication.scheduledTime)}
                      </p>
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

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <a
          href="/profile"
          className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Manage Medications
        </a>
        <button
          onClick={fetchMedicationSchedule}
          className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default MedicationReminders;
