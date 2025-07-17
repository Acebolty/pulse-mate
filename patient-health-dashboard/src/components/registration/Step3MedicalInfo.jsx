import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Height options in both feet/inches and centimeters
const heightOptions = [
  { value: "4'0\" (122 cm)", label: "4'0\" (122 cm)" },
  { value: "4'1\" (124 cm)", label: "4'1\" (124 cm)" },
  { value: "4'2\" (127 cm)", label: "4'2\" (127 cm)" },
  { value: "4'3\" (130 cm)", label: "4'3\" (130 cm)" },
  { value: "4'4\" (132 cm)", label: "4'4\" (132 cm)" },
  { value: "4'5\" (135 cm)", label: "4'5\" (135 cm)" },
  { value: "4'6\" (137 cm)", label: "4'6\" (137 cm)" },
  { value: "4'7\" (140 cm)", label: "4'7\" (140 cm)" },
  { value: "4'8\" (142 cm)", label: "4'8\" (142 cm)" },
  { value: "4'9\" (145 cm)", label: "4'9\" (145 cm)" },
  { value: "4'10\" (147 cm)", label: "4'10\" (147 cm)" },
  { value: "4'11\" (150 cm)", label: "4'11\" (150 cm)" },
  { value: "5'0\" (152 cm)", label: "5'0\" (152 cm)" },
  { value: "5'1\" (155 cm)", label: "5'1\" (155 cm)" },
  { value: "5'2\" (157 cm)", label: "5'2\" (157 cm)" },
  { value: "5'3\" (160 cm)", label: "5'3\" (160 cm)" },
  { value: "5'4\" (163 cm)", label: "5'4\" (163 cm)" },
  { value: "5'5\" (165 cm)", label: "5'5\" (165 cm)" },
  { value: "5'6\" (168 cm)", label: "5'6\" (168 cm)" },
  { value: "5'7\" (170 cm)", label: "5'7\" (170 cm)" },
  { value: "5'8\" (173 cm)", label: "5'8\" (173 cm)" },
  { value: "5'9\" (175 cm)", label: "5'9\" (175 cm)" },
  { value: "5'10\" (178 cm)", label: "5'10\" (178 cm)" },
  { value: "5'11\" (180 cm)", label: "5'11\" (180 cm)" },
  { value: "6'0\" (183 cm)", label: "6'0\" (183 cm)" },
  { value: "6'1\" (185 cm)", label: "6'1\" (185 cm)" },
  { value: "6'2\" (188 cm)", label: "6'2\" (188 cm)" },
  { value: "6'3\" (191 cm)", label: "6'3\" (191 cm)" },
  { value: "6'4\" (193 cm)", label: "6'4\" (193 cm)" },
  { value: "6'5\" (196 cm)", label: "6'5\" (196 cm)" },
  { value: "6'6\" (198 cm)", label: "6'6\" (198 cm)" },
  { value: "6'7\" (201 cm)", label: "6'7\" (201 cm)" },
  { value: "6'8\" (203 cm)", label: "6'8\" (203 cm)" },
  { value: "6'9\" (206 cm)", label: "6'9\" (206 cm)" },
  { value: "6'10\" (208 cm)", label: "6'10\" (208 cm)" },
  { value: "6'11\" (211 cm)", label: "6'11\" (211 cm)" },
  { value: "7'0\" (213 cm)", label: "7'0\" (213 cm)" }
];

// Weight options in both pounds and kilograms
const weightOptions = [
  { value: "80 lbs (36 kg)", label: "80 lbs (36 kg)" },
  { value: "90 lbs (41 kg)", label: "90 lbs (41 kg)" },
  { value: "100 lbs (45 kg)", label: "100 lbs (45 kg)" },
  { value: "110 lbs (50 kg)", label: "110 lbs (50 kg)" },
  { value: "120 lbs (54 kg)", label: "120 lbs (54 kg)" },
  { value: "130 lbs (59 kg)", label: "130 lbs (59 kg)" },
  { value: "140 lbs (64 kg)", label: "140 lbs (64 kg)" },
  { value: "150 lbs (68 kg)", label: "150 lbs (68 kg)" },
  { value: "160 lbs (73 kg)", label: "160 lbs (73 kg)" },
  { value: "170 lbs (77 kg)", label: "170 lbs (77 kg)" },
  { value: "180 lbs (82 kg)", label: "180 lbs (82 kg)" },
  { value: "190 lbs (86 kg)", label: "190 lbs (86 kg)" },
  { value: "200 lbs (91 kg)", label: "200 lbs (91 kg)" },
  { value: "210 lbs (95 kg)", label: "210 lbs (95 kg)" },
  { value: "220 lbs (100 kg)", label: "220 lbs (100 kg)" },
  { value: "230 lbs (104 kg)", label: "230 lbs (104 kg)" },
  { value: "240 lbs (109 kg)", label: "240 lbs (109 kg)" },
  { value: "250 lbs (113 kg)", label: "250 lbs (113 kg)" },
  { value: "260 lbs (118 kg)", label: "260 lbs (118 kg)" },
  { value: "270 lbs (122 kg)", label: "270 lbs (122 kg)" },
  { value: "280 lbs (127 kg)", label: "280 lbs (127 kg)" },
  { value: "290 lbs (132 kg)", label: "290 lbs (132 kg)" },
  { value: "300 lbs (136 kg)", label: "300 lbs (136 kg)" },
  { value: "310 lbs (141 kg)", label: "310 lbs (141 kg)" },
  { value: "320 lbs (145 kg)", label: "320 lbs (145 kg)" },
  { value: "330 lbs (150 kg)", label: "330 lbs (150 kg)" },
  { value: "340 lbs (154 kg)", label: "340 lbs (154 kg)" },
  { value: "350 lbs (159 kg)", label: "350 lbs (159 kg)" }
];

const Step3MedicalInfo = ({ formData, handleChange, error }) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const addAllergy = () => {
    if (newAllergy.trim()) {
      const currentAllergies = formData.medicalInfo?.allergies || [];
      handleChange('medicalInfo', {
        ...formData.medicalInfo,
        allergies: [...currentAllergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    const currentAllergies = formData.medicalInfo?.allergies || [];
    const updatedAllergies = currentAllergies.filter((_, i) => i !== index);
    handleChange('medicalInfo', {
      ...formData.medicalInfo,
      allergies: updatedAllergies
    });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      const currentConditions = formData.medicalInfo?.chronicConditions || [];
      handleChange('medicalInfo', {
        ...formData.medicalInfo,
        chronicConditions: [...currentConditions, newCondition.trim()]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index) => {
    const currentConditions = formData.medicalInfo?.chronicConditions || [];
    const updatedConditions = currentConditions.filter((_, i) => i !== index);
    handleChange('medicalInfo', {
      ...formData.medicalInfo,
      chronicConditions: updatedConditions
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Basic Medical Information
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          This information helps healthcare providers understand your medical background. All fields are optional and can be updated later in your profile.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Medical Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Blood Type
            </label>
            <select
              name="bloodType"
              value={formData.medicalInfo?.bloodType || ''}
              onChange={(e) => handleChange('medicalInfo', { ...formData.medicalInfo, bloodType: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Height
            </label>
            <select
              name="height"
              value={formData.medicalInfo?.height || ''}
              onChange={(e) => handleChange('medicalInfo', { ...formData.medicalInfo, height: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select height</option>
              {heightOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Weight
            </label>
            <select
              name="weight"
              value={formData.medicalInfo?.weight || ''}
              onChange={(e) => handleChange('medicalInfo', { ...formData.medicalInfo, weight: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select weight</option>
              {weightOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Allergies</h3>
        
        <div className="space-y-3">
          {/* Current Allergies */}
          {(formData.medicalInfo?.allergies || []).map((allergy, index) => (
            <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 dark:text-slate-300">{allergy}</span>
              <button
                type="button"
                onClick={() => removeAllergy(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Allergy */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              className="flex-1 p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter an allergy (e.g., Penicillin, Peanuts)"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {(formData.medicalInfo?.allergies || []).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">No allergies added yet</p>
          )}
        </div>
      </div>

      {/* Chronic Conditions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Chronic Conditions</h3>
        
        <div className="space-y-3">
          {/* Current Conditions */}
          {(formData.medicalInfo?.chronicConditions || []).map((condition, index) => (
            <div key={index} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 dark:text-slate-300">{condition}</span>
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Condition */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCondition()}
              className="flex-1 p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter a chronic condition (e.g., Diabetes, Hypertension)"
            />
            <button
              type="button"
              onClick={addCondition}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {(formData.medicalInfo?.chronicConditions || []).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">No chronic conditions added yet</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Optional Information:</strong> All medical information on this page is optional. You can skip this step and add this information later in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3MedicalInfo;
