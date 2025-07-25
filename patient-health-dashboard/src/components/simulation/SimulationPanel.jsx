import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import ManualDataEntry from './ManualDataEntry';

const SimulationPanel = ({ onClose, onDataGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);



  const generateHistoricalData = async (days, scenarioMix = []) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await api.post('/simulation/generate-historical', {
        days: days,
        scenarios: scenarioMix
      });

      setResult(response.data);

      // Notify other components about new health data (AlertContext will generate alerts)
      window.dispatchEvent(new CustomEvent('healthDataGenerated', {
        detail: { source: 'historicalGeneration', days: days }
      }));

      if (onDataGenerated) onDataGenerated();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate historical data');
    } finally {
      setLoading(false);
    }
  };

  const generateRealtimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('Generating real-time data...');
      const response = await api.post('/simulation/generate-realtime', {
        dataTypes: ['heartRate', 'bloodPressure', 'bodyTemperature', 'glucoseLevel']
      });

      console.log('Real-time data generated:', response.data);
      setResult(response.data);

      // Notify other components about new health data (AlertContext will generate alerts)
      window.dispatchEvent(new CustomEvent('healthDataGenerated', {
        detail: { source: 'realtimeGeneration', entriesCount: response.data.data?.entriesCreated || 0 }
      }));

      // Call the callback to refresh dashboard data
      if (onDataGenerated) {
        console.log('Calling onDataGenerated callback...');
        onDataGenerated();
      }

    } catch (err) {
      console.error('Error generating real-time data:', err);
      setError(err.response?.data?.message || 'Failed to generate real-time data');
    } finally {
      setLoading(false);
    }
  };



  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all health data and alerts? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Clear localStorage first
      localStorage.removeItem('readAlerts');
      localStorage.removeItem('alertReadStatus');
      localStorage.removeItem('lastProcessedTime');

      // Clear any other alert-related localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('alert') || key.includes('Alert')) {
          localStorage.removeItem(key);
        }
      });

      const response = await api.delete('/simulation/clear-data');
      setResult({
        ...response.data,
        message: response.data.message + ' (including localStorage)'
      });

      // Clear AlertContext state immediately to prevent regeneration
      window.dispatchEvent(new CustomEvent('clearAllAlerts'));

      // Small delay before calling onDataGenerated to ensure alerts are cleared first
      setTimeout(() => {
        if (onDataGenerated) onDataGenerated();
      }, 100);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Health Data Simulation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Simulation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateRealtimeData}
            disabled={loading}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Generate Current Readings</div>
            <div className="text-xs opacity-90">Add recent health data</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowManualEntry(true)}
            disabled={loading}
            className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PencilSquareIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Manual Data Entry</div>
            <div className="text-xs opacity-90">Test critical readings</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearAllData}
            disabled={loading}
            className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Clear All Data</div>
            <div className="text-xs opacity-90">Reset everything</div>
          </motion.button>
        </div>

        {/* Historical Data Generation */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Generate Historical Data
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[7, 14, 30, 90].map((days) => (
              <motion.button
                key={days}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateHistoricalData(days)}
                disabled={loading}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClockIcon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">{days} Days</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Scenarios */}
        {/* <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Available Scenarios
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(scenarios).map(([key, scenario]) => {
              const IconComponent = scenario.icon;
              return (
                <div
                  key={key}
                  className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 ${scenario.color}`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {scenario.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        {scenario.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-slate-400">
              Generating health data...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-medium text-green-800 dark:text-green-200">
                {result.message}
              </span>
            </div>
            
            {result.data && (
              <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                {result.data.entriesCreated && (
                  <div>Created {result.data.entriesCreated} health data entries</div>
                )}
                {result.data.daysGenerated && (
                  <div>Generated data for {result.data.daysGenerated} days</div>
                )}
                {result.data.deletedCount !== undefined && (
                  <div>Deleted {result.data.deletedCount} entries</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Simulation Features
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Realistic health patterns based on time of day</li>
            <li>• Correlated data (exercise affects heart rate & calories)</li>
            <li>• Multiple scenarios for different health conditions</li>
            <li>• Gradual trends over time (weight loss, fitness improvement)</li>
          </ul>
        </div>
      </motion.div>

      {/* Manual Data Entry Modal */}
      {showManualEntry && (
        <ManualDataEntry
          onClose={() => setShowManualEntry(false)}
          onDataAdded={() => {
            setShowManualEntry(false);
            if (onDataGenerated) onDataGenerated();
          }}
        />
      )}
    </motion.div>
  );
};

export default SimulationPanel;
