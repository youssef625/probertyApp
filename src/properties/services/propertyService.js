import { authService } from '../../admin/services/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app-260407103838.azurewebsites.net'; 

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const propertyService = {
  getProperties: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Properties`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || data?.items || []);
  },
  
  getMyProperties: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Properties/my`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch my properties');
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || data?.items || []);
  },

  getProperty: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/Properties/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch property');
    return await response.json();
  },

  createProperty: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/Properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errText = 'Failed to create property';
      const rawText = await response.text();
      try {
        const errorData = JSON.parse(rawText);
        if (errorData.errors) {
          errText = JSON.stringify(errorData.errors);
        } else {
          errText = errorData.message || errorData.title || JSON.stringify(errorData);
        }
      } catch (e) {
        errText = rawText || `Status ${response.status}`;
      }
      throw new Error(`Error ${response.status}: ${errText}`);
    }
    return await response.json();
  },

  updateProperty: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/Properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update property');
    return true;
  },

  deleteProperty: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/Properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete property');
    return true;
  },

  uploadImages: async (id, formData) => {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/api/Properties/${id}/images`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload images');
    return await response.json();
  },

  deleteImage: async (propertyId, imageUrl) => {
    const response = await fetch(`${API_BASE_URL}/api/Properties/${propertyId}/images?imageUrl=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const rawText = await response.text();
      throw new Error(`Failed to delete image: ${rawText || response.status}`);
    }
    return true;
  }
};
