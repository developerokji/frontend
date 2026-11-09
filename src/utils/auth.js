/**
 * Decode a JWT token payload safely without external dependencies.
 */
export const decodeTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to decode JWT payload:', error);
    return null;
  }
};

/**
 * Get the currently logged-in user object from localStorage + JWT payload.
 */
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('authToken');
    const tokenPayload = decodeTokenPayload(token);

    const rawUserData = localStorage.getItem('userData');
    const userData = rawUserData ? JSON.parse(rawUserData) : null;

    const rawPrefs = localStorage.getItem('userPreferences');
    const userPrefs = rawPrefs ? JSON.parse(rawPrefs) : null;

    const role = tokenPayload?.role || userData?.role || userPrefs?.role || null;

    return {
      ...(userData || {}),
      id: tokenPayload?.id || userData?.id || null,
      name: userData?.name || userPrefs?.name || null,
      email: userData?.email || userPrefs?.email || null,
      role: role ? String(role).toLowerCase() : null,
    };
  } catch (error) {
    console.warn('Failed to read current user:', error);
    return null;
  }
};

/**
 * Check if the currently logged-in user has the 'admin' role.
 */
export const isAdminUser = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};
