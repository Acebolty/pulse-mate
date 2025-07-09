/**
 * Medical specializations relevant for remote health monitoring and telemedicine
 * Focused on conditions that can be monitored and managed remotely
 */

export const MEDICAL_SPECIALIZATIONS = [
  // Primary Care & General Medicine
  "Family Medicine",
  "Internal Medicine", 
  "General Practice",
  "Preventive Medicine",
  "Geriatric Medicine",
  "Adolescent Medicine",

  // Chronic Disease Management (Remote Monitoring Focus)
  "Endocrinology", // Diabetes, thyroid, hormonal disorders
  "Cardiology", // Heart conditions, hypertension monitoring
  "Pulmonology", // Respiratory conditions, COPD, asthma
  "Nephrology", // Kidney disease, dialysis monitoring
  "Rheumatology", // Arthritis, autoimmune conditions
  "Hematology", // Blood disorders, anticoagulation monitoring

  // Mental Health & Behavioral (Telehealth Focus)
  "Psychiatry",
  "Psychology", 
  "Behavioral Health",
  "Addiction Medicine",
  "Sleep Medicine",

  // Chronic Pain & Rehabilitation
  "Pain Management",
  "Physical Medicine & Rehabilitation",
  "Sports Medicine",

  // Women's Health (Remote Monitoring)
  "Obstetrics & Gynecology",
  "Maternal-Fetal Medicine",
  "Reproductive Endocrinology",

  // Dermatology (Teledermatology)
  "Dermatology",
  "Dermatopathology",

  // Nutrition & Lifestyle
  "Clinical Nutrition",
  "Obesity Medicine",
  "Lifestyle Medicine",

  // Infectious Disease (Remote Consultation)
  "Infectious Disease",
  "Travel Medicine",

  // Oncology (Remote Monitoring & Support)
  "Medical Oncology",
  "Hematology-Oncology",
  "Palliative Care",

  // Neurology (Remote Monitoring)
  "Neurology",
  "Epilepsy",
  "Movement Disorders",

  // Pediatrics (Telehealth)
  "Pediatrics",
  "Pediatric Endocrinology",
  "Pediatric Cardiology",
  "Pediatric Pulmonology",

  // Allergy & Immunology
  "Allergy & Immunology",
  "Clinical Immunology",

  // Gastroenterology (Remote Monitoring)
  "Gastroenterology",
  "Hepatology",

  // Telemedicine Specialties
  "Telemedicine",
  "Digital Health",
  "Remote Patient Monitoring",
  "Chronic Care Management",
  "Population Health",

  // Other Relevant Specialties
  "Occupational Medicine",
  "Public Health",
  "Health Informatics"
];

/**
 * Filter specializations based on search query
 * @param {string} query - Search query
 * @returns {Array} Filtered specializations
 */
export const filterSpecializations = (query) => {
  if (!query || query.trim() === '') {
    return MEDICAL_SPECIALIZATIONS;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return MEDICAL_SPECIALIZATIONS.filter(specialization =>
    specialization.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize exact matches and matches at the beginning
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) {
      return -1;
    }
    if (!aLower.startsWith(searchTerm) && bLower.startsWith(searchTerm)) {
      return 1;
    }
    
    return a.localeCompare(b);
  });
};

/**
 * Get popular specializations for remote health monitoring
 * @returns {Array} Most common specializations
 */
export const getPopularSpecializations = () => {
  return [
    "Family Medicine",
    "Internal Medicine",
    "Cardiology",
    "Endocrinology",
    "Psychiatry",
    "Dermatology",
    "Pulmonology",
    "Telemedicine"
  ];
};

/**
 * Sub-specialties organized by main specialization
 */
export const SUB_SPECIALTIES = {
  "Cardiology": [
    "Interventional Cardiology",
    "Electrophysiology",
    "Heart Failure",
    "Preventive Cardiology",
    "Cardiac Rehabilitation",
    "Hypertension Management"
  ],
  "Endocrinology": [
    "Diabetes Management",
    "Thyroid Disorders",
    "Reproductive Endocrinology",
    "Pediatric Endocrinology",
    "Obesity Medicine",
    "Metabolic Disorders"
  ],
  "Psychiatry": [
    "Adult Psychiatry",
    "Child & Adolescent Psychiatry",
    "Geriatric Psychiatry",
    "Addiction Psychiatry",
    "Consultation-Liaison Psychiatry",
    "Telepsychiatry"
  ],
  "Dermatology": [
    "Teledermatology",
    "Pediatric Dermatology",
    "Dermatopathology",
    "Cosmetic Dermatology",
    "Skin Cancer Screening",
    "Chronic Skin Conditions"
  ],
  "Pulmonology": [
    "Asthma Management",
    "COPD Management",
    "Sleep Medicine",
    "Pulmonary Rehabilitation",
    "Respiratory Monitoring",
    "Critical Care Medicine"
  ],
  "Internal Medicine": [
    "Hospitalist Medicine",
    "Geriatric Medicine",
    "Preventive Medicine",
    "Chronic Disease Management",
    "Primary Care",
    "Telemedicine"
  ],
  "Family Medicine": [
    "Primary Care",
    "Preventive Medicine",
    "Chronic Care Management",
    "Pediatric Care",
    "Geriatric Care",
    "Women's Health"
  ],
  "Neurology": [
    "Epilepsy",
    "Movement Disorders",
    "Stroke Management",
    "Headache Medicine",
    "Neuromuscular Disorders",
    "Teleneurology"
  ],
  "Gastroenterology": [
    "Inflammatory Bowel Disease",
    "Liver Disease",
    "Digestive Health",
    "Nutrition Counseling",
    "Chronic GI Conditions"
  ],
  "Obstetrics & Gynecology": [
    "Women's Health",
    "Reproductive Health",
    "Prenatal Care",
    "Menopause Management",
    "Contraceptive Counseling",
    "Telehealth for Women"
  ]
};

/**
 * Get sub-specialties for a given specialization
 * @param {string} specialization - Main specialization
 * @returns {Array} Sub-specialties for the specialization
 */
export const getSubSpecialties = (specialization) => {
  return SUB_SPECIALTIES[specialization] || [];
};

/**
 * Filter sub-specialties based on search query and main specialization
 * @param {string} query - Search query
 * @param {string} specialization - Main specialization
 * @returns {Array} Filtered sub-specialties
 */
export const filterSubSpecialties = (query, specialization) => {
  const subSpecialties = getSubSpecialties(specialization);

  if (!query || query.trim() === '') {
    return subSpecialties;
  }

  const searchTerm = query.toLowerCase().trim();

  return subSpecialties.filter(subSpecialty =>
    subSpecialty.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) {
      return -1;
    }
    if (!aLower.startsWith(searchTerm) && bLower.startsWith(searchTerm)) {
      return 1;
    }

    return a.localeCompare(b);
  });
};

export default {
  MEDICAL_SPECIALIZATIONS,
  filterSpecializations,
  getPopularSpecializations,
  SUB_SPECIALTIES,
  getSubSpecialties,
  filterSubSpecialties
};
