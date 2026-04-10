import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app-260407103838.azurewebsites.net';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const token = data.token || data.jwt || data;
      
      if (typeof token === 'string') {
        Cookies.set('token', token, { expires: 1 }); // expires in 1 day
      } else {
        console.warn('Login response did not contain a clear token string', data);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('token');
  },

  getToken: () => {
    return Cookies.get('token');
  },

  isAuthenticated: () => {
    return !!Cookies.get('token');
  }
};
