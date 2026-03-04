// Local Storage utility functions

export const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Auth token management
export const setAuthToken = (token) => {
  setLocalStorageItem('authToken', token);
};

export const getAuthToken = () => {
  return getLocalStorageItem('authToken');
};

export const removeAuthToken = () => {
  removeLocalStorageItem('authToken');
};

// User preferences
export const setUserPreferences = (preferences) => {
  setLocalStorageItem('userPreferences', preferences);
};

export const getUserPreferences = () => {
  return getLocalStorageItem('userPreferences', {
    theme: 'light',
    language: 'en',
    itemsPerPage: 10
  });
};
