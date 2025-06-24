import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  HeartIcon,
  BeakerIcon,
  SunIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const ManualDataEntry = ({ onClose, onDataAdded }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    glucose: '',
    temperature: ''
  });

  const presetScenarios = {
    normal: {
      name: 'Normal Readings',
      description: 'All values within healthy ranges',
      values: { heartRate: '72', systolic: '118', diastolic: '78', glucose: '90', temperature: '98.6' }
    },
    hypertensive: {
      name: 'High Blood Pressure Crisis',
      description: 'Dangerous BP levels requiring immediate attention',
      values: { heartRate: '95', systolic: '185', diastolic: '115', glucose: '95', temperature: '98.8' }
    },
    diabetic: {
      name: 'Diabetic Emergency',
      description: 'Critically high blood glucose',
      values: { heartRate: '88', systolic: '135', diastolic: '85', glucose: '220', temperature: '99.2' }
    },
    fever: {
      name: 'High Fever',
      description: 'Significant fever with elevated vitals',
      values: { heartRate: '110', systolic: '125', diastolic: '82', glucose: '105', temperature: '102.8' }
    },
    bradycardia: {
      name: 'Low Heart Rate',
      description: 'Dangerously low heart rate',
      values: { heartRate: '42', systolic: '105', diastolic: '68', glucose: '85', temperature: '98.1' }
    },
    tachycardia: {
      name: 'High Heart Rate',
      description: 'Dangerously high heart rate',
      values: { heartRate: '135', systolic: '145', diastolic: '92', glucose: '110', temperature: '99.8' }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadPreset = (preset) => {
    setFormData(preset.values);
    setError(null);
    setResult(null);
  };

  const submitManualData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Validate inputs
      const errors = [];
      if (!formData.heartRate || formData.heartRate < 30 || formData.heartRate > 200) {
        errors.push('Heart rate must be between 30-200 bpm');
      }
      if (!formData.systolic || formData.systolic < 70 || formData.systolic > 250) {
        errors.push('Systolic BP must be between 70-250 mmHg');
      }
      if (!formData.diastolic || formData.diastolic < 40 || formData.diastolic > 150) {
        errors.push('Diastolic BP must be between 40-150 mmHg');
      }
      if (!formData.glucose || formData.glucose < 40 || formData.glucose > 400) {
        errors.push('Glucose must be between 40-400 mg/dL');
      }
      if (!formData.temperature || formData.temperature < 95 || formData.temperature > 110) {
        errors.push('Temperature must be between 95-110°F');
      }

      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      // Create health data entries
      const currentTime = new Date();
      const healthDataEntries = [];

      // Heart Rate
      if (formData.heartRate) {
        healthDataEntries.push({
          dataType: 'heartRate',
          value: parseInt(formData.heartRate),
          unit: 'bpm',
          timestamp: new Date(), // Current time for immediate display
          source: 'Manual Entry'
        });
      }

      // Blood Pressure
      if (formData.systolic && formData.diastolic) {
        healthDataEntries.push({
          dataType: 'bloodPressure',
          value: {
            systolic: parseInt(formData.systolic),
            diastolic: parseInt(formData.diastolic)
          },
          unit: 'mmHg',
          timestamp: new Date(), // Current time for immediate display
          source: 'Manual Entry'
        });
      }

      // Glucose
      if (formData.glucose) {
        healthDataEntries.push({
          dataType: 'glucoseLevel',
          value: parseInt(formData.glucose),
          unit: 'mg/dL',
          timestamp: new Date(), // Current time for immediate display
          source: 'Manual Entry'
        });
      }

      // Temperature
      if (formData.temperature) {
        healthDataEntries.push({
          dataType: 'bodyTemperature',
          value: parseFloat(formData.temperature),
          unit: '°F',
          timestamp: new Date(), // Current time for immediate display
          source: 'Manual Entry'
        });
      }

      // Submit each entry
      const promises = healthDataEntries.map(entry => 
        api.post('/health-data', entry)
      );

      await Promise.all(promises);

      // Generate alerts based on the new data
      await api.post('/simulation/generate-alerts');

      setResult({
        success: true,
        message: `Successfully added ${healthDataEntries.length} manual health readings`,
        data: {
          entriesCreated: healthDataEntries.length,
          readings: healthDataEntries.map(entry => ({
            type: entry.dataType,
            value: entry.value,
            unit: entry.unit
          }))
        }
      });

      // Immediate callback to refresh dashboard
      if (onDataAdded) onDataAdded();

    } catch (err) {
      console.error('Error submitting manual data:', err);
      setError(err.response?.data?.message || 'Failed to submit manual data');
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
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Manual Health Data Entry
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Preset Scenarios */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Quick Test Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(presetScenarios).map(([key, preset]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadPreset(preset)}
                className="p-3 text-left bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-600"
              >
                <div className="font-medium text-gray-900 dark:text-slate-100 text-sm">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  {preset.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Manual Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Heart Rate */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>Heart Rate (bpm)</span>
            </label>
            <input
              type="number"
              value={formData.heartRate}
              onChange={(e) => handleInputChange('heartRate', e.target.value)}
              placeholder="e.g., 72"
              min="30"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">Normal: 60-100 bpm</p>
          </div>

          {/* Blood Pressure */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />
              <span>Blood Pressure (mmHg)</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={formData.systolic}
                onChange={(e) => handleInputChange('systolic', e.target.value)}
                placeholder="Systolic"
                min="70"
                max="250"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
              <span className="self-center text-gray-500">/</span>
              <input
                type="number"
                value={formData.diastolic}
                onChange={(e) => handleInputChange('diastolic', e.target.value)}
                placeholder="Diastolic"
                min="40"
                max="150"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Normal: &lt;120/80 mmHg</p>
          </div>

          {/* Blood Glucose */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <BeakerIcon className="w-4 h-4 text-green-500" />
              <span>Blood Glucose (mg/dL)</span>
            </label>
            <input
              type="number"
              value={formData.glucose}
              onChange={(e) => handleInputChange('glucose', e.target.value)}
              placeholder="e.g., 90"
              min="40"
              max="400"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">Normal: 70-100 mg/dL</p>
          </div>

          {/* Body Temperature */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <SunIcon className="w-4 h-4 text-orange-500" />
              <span>Body Temperature (°F)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="e.g., 98.6"
              min="95"
              max="110"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">Normal: 97.0-99.0°F</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitManualData}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <div className="flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>{loading ? 'Adding Data...' : 'Add Health Data'}</span>
            </div>
          </motion.button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-slate-400">
              Adding health data and analyzing for alerts...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
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
                <p>Added {result.data.entriesCreated} health readings</p>
                <p className="text-xs mt-1">Check Recent Alerts for any new notifications!</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Testing Critical Alerts
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use preset scenarios to test different alert types</li>
            <li>• Critical values will trigger immediate alerts</li>
            <li>• Check Recent Alerts section after submitting</li>
            <li>• Data appears in Recent Readings with "Manual Entry" source</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ManualDataEntry;
