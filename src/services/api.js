import { apiClient, getApiBaseUrl, USER_TOKEN_KEY } from '../utils/apiClient';

// Base URL for the RentVibe API
const API_ORIGIN = getApiBaseUrl();
export const AUTH_STATE_EVENT = 'auth-state-changed';
export { USER_TOKEN_KEY };

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  if (/^(https?:)?\/\//i.test(url) || /^data:|^blob:/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
};

export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);
export const hasUserSession = () => !!getUserToken();
const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  } catch {
    return '';
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;

  try {
    const payload = JSON.parse(decoded);
    
    // Normalize .NET claims to simpler properties if they exist
    const claimRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (claimRole && !payload.role) {
      payload.role = claimRole;
    }
    
    const claimId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (claimId && !payload.id) {
      payload.id = claimId;
    }
    
    const claimEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    if (claimEmail && !payload.email) {
      payload.email = claimEmail;
    }
    
    const claimName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    if (claimName && !payload.name) {
      payload.name = claimName;
    }

    return payload;
  } catch {
    return null;
  }
};

const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : '');

const extractRoleFromPayload = (payload) => {

  console.log('Decoded JWT Payload:', payload); // Debugging line
  if (!payload || typeof payload !== 'object') return '';

  const roleValue = payload.role || payload.roles || payload.permissions;
  console.log('Extracted Role Value:', roleValue); // Debugging line
  if (Array.isArray(roleValue)) {
    const roles = roleValue.map(normalizeRole).filter(Boolean);
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('landlord')) return 'landlord';
    return roles[0] || '';
  }

  return normalizeRole(roleValue);
};

export const getUserRole = () => extractRoleFromPayload(decodeJwtPayload(getUserToken()));
export const isAdminOrLandlordRole = (role = getUserRole()) => role === 'admin' || role === 'landlord';
export const isAdminRole = () => getUserRole() === 'admin';
export const isLandlordRole = () => getUserRole() === 'landlord';

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
};

// =====================================================
// Authentication
// =====================================================

export const login = async (email, password) => {
  try {
    const data = await apiClient.post('/api/Auth/login', { email, password });
    const token = data?.token || data?.jwt || data;

    if (typeof token === 'string') {
      localStorage.setItem(USER_TOKEN_KEY, token);
      notifyAuthChanged();
    }
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  notifyAuthChanged();
};

export const getCurrentUser = async () => {
  try {
    return await apiClient.get('/api/Auth/me');
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    return await apiClient.post('/api/Auth/register', userData);
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// =====================================================
// Properties
// =====================================================

export const getProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/api/Properties${params ? `?${params}` : ''}`;
    return await apiClient.get(endpoint);
  } catch (error) {
    console.error('getProperties error:', error);
    throw error;
  }
};

export const getPropertyById = async (id) => {
  try {
    return await apiClient.get(`/api/Properties/${id}`);
  } catch (error) {
    console.error('getPropertyById error:', error);
    throw error;
  }
};

export const createProperty = async (propertyData) => {
  try {
    return await apiClient.post('/api/Properties', propertyData);
  } catch (error) {
    console.error('createProperty error:', error);
    throw error;
  }
};

// =====================================================
// Favorites
// =====================================================

export const getFavorites = async () => {
  try {
    return await apiClient.get('/api/Favorites');
  } catch (error) {
    console.error('getFavorites error:', error);
    throw error;
  }
};

export const addToFavorites = async (propertyId) => {
  try {
    return await apiClient.post(`/api/Favorites/${propertyId}`);
  } catch (error) {
    console.error('addToFavorites error:', error);
    throw error;
  }
};

export const removeFromFavorites = async (propertyId) => {
  try {
    return await apiClient.delete(`/api/Favorites/${propertyId}`);
  } catch (error) {
    console.error('removeFromFavorites error:', error);
    throw error;
  }
};

// =====================================================
// Visits
// =====================================================

export const scheduleVisit = async (propertyId, requestedDate, message = '') => {
  try {
    return await apiClient.post('/api/Visits', {
      propertyId: parseInt(propertyId),
      requestedDate: requestedDate,
      message: message,
    });
  } catch (error) {
    console.error('scheduleVisit error:', error);
    throw error;
  }
};

export const getMyVisits = async () => {
  try {
    return await apiClient.get('/api/Visits/my');
  } catch (error) {
    console.error('getMyVisits error:', error);
    throw error;
  }
};

// =====================================================
// Reviews
// =====================================================

export const getPropertyReviews = async (propertyId) => {
  try {
    return await apiClient.get(`/api/Reviews/property/${propertyId}`);
  } catch (error) {
    console.error('getPropertyReviews error:', error);
    throw error;
  }
};

export const createReview = async (propertyId, rating, comment = '') => {
  try {
    return await apiClient.post('/api/Reviews', { propertyId, rating, comment });
  } catch (error) {
    console.error('createReview error:', error);
    throw error;
  }
};
