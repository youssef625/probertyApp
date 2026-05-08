export const USER_TOKEN_KEY = 'user_token';
const API_BASE_URL = window.location.origin.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, status, data, messages = []) {
    super(message);
    this.status = status;
    this.data = data;
    this.messages = messages;
  }
}

const normalizeErrorMessages = (errorData, fallbackMessage) => {
  const messages = [];

  if (typeof errorData === 'string') {
    messages.push(errorData);
  } else if (Array.isArray(errorData)) {
    messages.push(...errorData.filter((value) => typeof value === 'string'));
  } else if (errorData && typeof errorData === 'object') {
    const { errors, message, title, detail, error } = errorData;

    if (Array.isArray(errors)) {
      messages.push(...errors.filter((value) => typeof value === 'string'));
    } else if (errors && typeof errors === 'object') {
      Object.values(errors).forEach((value) => {
        if (Array.isArray(value)) {
          messages.push(...value.filter((item) => typeof item === 'string'));
        } else if (typeof value === 'string') {
          messages.push(value);
        }
      });
    }

    [message, title, detail, error].forEach((value) => {
      if (typeof value === 'string') {
        messages.push(value);
      }
    });
  }

  const unique = Array.from(new Set(messages.map((value) => value.trim()).filter(Boolean)));
  if (unique.length === 0 && fallbackMessage) {
    unique.push(fallbackMessage);
  }

  return unique;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(USER_TOKEN_KEY);
      window.dispatchEvent(new Event('auth-state-changed'));
      const message = 'Unauthorized access';
      throw new ApiError(message, 401, null, [message]);
    }
    
    let errorMsg = `HTTP Error: ${response.status}`;
    let errorData = null;
    let errorMessages = [];
    try {
      errorData = await response.json();
      errorMsg = errorData.message || errorData.title || errorData.error || errorMsg;
      errorMessages = normalizeErrorMessages(errorData, errorMsg);
    } catch {
      // Ignored if parsing fails
    }
    if (errorMessages.length === 0) {
      errorMessages = [errorMsg];
    }
    throw new ApiError(errorMsg, response.status, errorData, errorMessages);
  }
  
  if (response.status === 204) {
    return true;
  }

  try {
    return await response.json();
  } catch {
    return true;
  }
};

const request = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export const getApiErrorMessages = (error) => {
  if (!error) return ['Something went wrong. Please try again.'];
  if (Array.isArray(error.messages) && error.messages.length > 0) {
    return error.messages;
  }
  if (typeof error.message === 'string' && error.message.trim()) {
    return [error.message];
  }
  return ['Something went wrong. Please try again.'];
};
