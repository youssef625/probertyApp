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

  getUserRole: () => {
    const token = Cookies.get('token');
    if (!token) return null;
    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      // ASP.net standard role claim or short role name
      const roleField = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || payload.Role;
      if (Array.isArray(roleField)) return roleField[0].toLowerCase();
      return roleField ? roleField.toLowerCase() : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!Cookies.get('token');
  }
};
