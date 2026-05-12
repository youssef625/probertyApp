import { apiClient, getApiBaseUrl, USER_TOKEN_KEY } from '../utils/apiClient';


const API_ORIGIN = getApiBaseUrl();
export const AUTH_STATE_EVENT = 'auth-state-changed';
export { USER_TOKEN_KEY };

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  if (/^(https?:)?\/\//.test(url)) {
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

  console.log('Decoded JWT Payload:', payload); 
  if (!payload || typeof payload !== 'object') return '';

  const roleValue = payload.role || payload.roles || payload.permissions;
  console.log('Extracted Role Value:', roleValue); 
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





export const getMyNotifications = async (limit = 5) => {
  try {
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(50, limit)) : 5;
    return await apiClient.get(`/api/Notifications?limit=${safeLimit}`);
  } catch (error) {
    console.error('getMyNotifications error:', error);
    throw error;
  }
};





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





export const getMyApplications = async () => {
  try {
    return await apiClient.get('/api/Applications/my');
  } catch (error) {
    console.error('getMyApplications error:', error);
    throw error;
  }
};

export const createApplication = async (propertyId, rentalStartDate, rentalEndDate, message = '') => {
  try {
    return await apiClient.post('/api/Applications', {
      propertyId: parseInt(propertyId),
      rentalStartDate,
      rentalEndDate,
      message,
    });
  } catch (error) {
    console.error('createApplication error:', error);
    throw error;
  }
};

export const uploadApplicationDocuments = async (applicationId, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const token = getUserToken();
  const response = await fetch(`${API_ORIGIN}/api/Applications/${applicationId}/documents`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    let message = `HTTP Error: ${response.status}`;
    try {
      const data = await response.json();
      message = data?.message || data?.title || data?.error || message;
    } catch {
      
    }
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    return true;
  }
};





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
