import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BeakerIcon, PlusIcon, ClockIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MedicationReminders from '../components/dashboard/MedicationReminders';
import api from '../services/api';

const Medications = () => {
  const [medicationData, setMedicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMedications, setUserMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: ''
  });

  useEffect(() => {
    fetchMedicationData();
    fetchUserMedications();
  }, []);

  const fetchMedicationData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email-test/medication-schedule');
      setMedicationData(response.data);
    } catch (error) {
      console.error('Error fetching medication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMedications = async () => {
    try {
      const response = await api.get('/profile/me');
      setUserMedications(response.data.medicalInfo?.medications || []);
    } catch (error) {
      console.error('Error fetching user medications:', error);
    }
  };

  const handleAddMedication = async () => {
    try {
      const response = await api.put('/profile/me', {
        medicalInfo: {
          medications: [...userMedications, newMedication]
        }
      });

      setUserMedications(response.data.medicalInfo.medications);
      setNewMedication({ name: '', dosage: '', frequency: '' });
      setShowAddModal(false);

      // Refresh medication data
      fetchMedicationData();
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleEditMedication = async () => {
    try {
      const updatedMedications = userMedications.map((med, index) =>
        index === editingMedication.index ? editingMedication.data : med
      );

      const response = await api.put('/profile/me', {
        medicalInfo: {
          medications: updatedMedications
        }
      });

      setUserMedications(response.data.medicalInfo.medications);
      setShowEditModal(false);
      setEditingMedication(null);

      // Refresh medication data
      fetchMedicationData();
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const handleDeleteMedication = async (index) => {
    try {
      const updatedMedications = userMedications.filter((_, i) => i !== index);

      const response = await api.put('/profile/me', {
        medicalInfo: {
          medications: updatedMedications
        }
      });

      setUserMedications(response.data.medicalInfo.medications);

      // Refresh medication data
      fetchMedicationData();
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const openEditModal = (medication, index) => {
    setEditingMedication({
      data: { ...medication },
      index: index
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BeakerIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  Medications
                </h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  Manage your medication schedule and reminders
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Medication
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {medicationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BeakerIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Total Medications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {medicationData.totalMedications}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Daily Doses
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {medicationData.totalDailyDoses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                    Reminders Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {medicationData.totalMedications > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medication Schedule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <MedicationReminders />
          </motion.div>

          {/* Insights and Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Medication Insights */}
            {medicationData?.insights && medicationData.insights.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  💡 Insights
                </h3>
                <div className="space-y-3">
                  {medicationData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg"
                    >
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Medications */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  My Medications
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  + Add
                </button>
              </div>

              {userMedications.length === 0 ? (
                <div className="text-center py-6">
                  <BeakerIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    No medications added yet
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Add your first medication
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userMedications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-slate-100">
                          {medication.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {medication.dosage} • {medication.frequency}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(medication, index)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </motion.div>
        </div>

        {/* Add Medication Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Add New Medication
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="e.g., Lisinopril"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="e.g., 10mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="Every 4 hours">Every 4 hours</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="Every 12 hours">Every 12 hours</option>
                    <option value="Once weekly">Once weekly</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedication}
                  disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Medication
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Medication Modal */}
        {showEditModal && editingMedication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Edit Medication
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={editingMedication.data.name}
                    onChange={(e) => setEditingMedication({
                      ...editingMedication,
                      data: {...editingMedication.data, name: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={editingMedication.data.dosage}
                    onChange={(e) => setEditingMedication({
                      ...editingMedication,
                      data: {...editingMedication.data, dosage: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={editingMedication.data.frequency}
                    onChange={(e) => setEditingMedication({
                      ...editingMedication,
                      data: {...editingMedication.data, frequency: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="Every 4 hours">Every 4 hours</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="Every 12 hours">Every 12 hours</option>
                    <option value="Once weekly">Once weekly</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMedication}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;
