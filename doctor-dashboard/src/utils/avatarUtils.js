/**
 * Avatar utility functions for generating consistent placeholder avatars
 */

/**
 * Generate a placeholder avatar URL using ui-avatars.com
 * @param {string} name - The name to display in the avatar
 * @param {Object} options - Configuration options
 * @param {number} options.size - Size of the avatar (default: 150)
 * @param {string} options.background - Background color hex (without #, default: '3b82f6')
 * @param {string} options.color - Text color hex (without #, default: 'ffffff')
 * @param {boolean} options.rounded - Whether to make the avatar rounded (default: true)
 * @returns {string} The avatar URL
 */
export const generateAvatarUrl = (name, options = {}) => {
  const {
    size = 150,
    background = '3b82f6', // Blue color
    color = 'ffffff', // White text
    rounded = true
  } = options;

  const encodedName = encodeURIComponent(name || 'User');
  const roundedParam = rounded ? '&rounded=true' : '';
  
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${background}&color=${color}&size=${size}${roundedParam}`;
};

/**
 * Generate a doctor avatar with blue background
 * @param {string} firstName - Doctor's first name
 * @param {string} lastName - Doctor's last name
 * @param {number} size - Size of the avatar (default: 150)
 * @returns {string} The avatar URL
 */
export const generateDoctorAvatar = (firstName, lastName, size = 150) => {
  const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Doctor';
  return generateAvatarUrl(name, {
    size,
    background: '3b82f6', // Blue for doctors
    color: 'ffffff'
  });
};

/**
 * Generate a patient avatar with green background
 * @param {string} firstName - Patient's first name
 * @param {string} lastName - Patient's last name
 * @param {number} size - Size of the avatar (default: 150)
 * @returns {string} The avatar URL
 */
export const generatePatientAvatar = (firstName, lastName, size = 150) => {
  const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Patient';
  return generateAvatarUrl(name, {
    size,
    background: '10b981', // Green for patients
    color: 'ffffff'
  });
};

/**
 * Generate an avatar from a full name string
 * @param {string} fullName - The full name
 * @param {string} type - Type of user ('doctor', 'patient', or 'user')
 * @param {number} size - Size of the avatar (default: 150)
 * @returns {string} The avatar URL
 */
export const generateAvatarFromName = (fullName, type = 'user', size = 150) => {
  const backgroundColors = {
    doctor: '3b82f6', // Blue
    patient: '10b981', // Green
    user: '6b7280' // Gray
  };

  return generateAvatarUrl(fullName, {
    size,
    background: backgroundColors[type] || backgroundColors.user,
    color: 'ffffff'
  });
};

/**
 * Get a safe avatar URL with fallback
 * @param {string} profilePictureUrl - The user's profile picture URL
 * @param {string} fallbackName - Name to use for fallback avatar
 * @param {string} type - Type of user ('doctor', 'patient', or 'user')
 * @param {number} size - Size of the avatar (default: 150)
 * @returns {string} The avatar URL (either the profile picture or generated fallback)
 */
export const getSafeAvatarUrl = (profilePictureUrl, fallbackName, type = 'user', size = 150) => {
  if (profilePictureUrl && profilePictureUrl.trim() !== '') {
    return profilePictureUrl;
  }
  
  return generateAvatarFromName(fallbackName, type, size);
};

export default {
  generateAvatarUrl,
  generateDoctorAvatar,
  generatePatientAvatar,
  generateAvatarFromName,
  getSafeAvatarUrl
};
