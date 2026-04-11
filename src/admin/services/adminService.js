import { authService } from './authService';

// Service layer for Admin API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app-260407103838.azurewebsites.net'; 

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const adminService = {
  getPendingLandlords: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/landlords/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch pending landlords');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  approveLandlord: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/landlords/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to approve landlord');
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  rejectLandlord: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/landlords/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to reject landlord');
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPendingProperties: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/properties/pending`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch pending properties');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  approveProperty: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/properties/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to approve property');
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  rejectProperty: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/properties/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to reject property');
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
