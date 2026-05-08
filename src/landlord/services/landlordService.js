import { apiClient } from '../../utils/apiClient';

export const landlordService = {
  // Properties CRUD
  getMyProperties: async () => {
    return await apiClient.get('/api/Properties/my');
  },

  createProperty: async (data) => {
    return await apiClient.post('/api/Properties', data);
  },

  updateProperty: async (id, data) => {
    return await apiClient.put(`/api/Properties/${id}`, data);
  },

  deleteProperty: async (id) => {
    return await apiClient.delete(`/api/Properties/${id}`);
  },

  // Visit Requests
  getVisitRequests: async () => {
    return await apiClient.get('/api/Visits/landlord');
  },

  updateVisitStatus: async (visitId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Visits/${visitId}/${endpoint}`);
  },

  // Rental Applications
  getApplications: async () => {
    return await apiClient.get('/api/Applications/landlord');
  },

  updateApplicationStatus: async (applicationId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Applications/${applicationId}/${endpoint}`);
  }
};
