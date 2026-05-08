import { apiClient } from '../../utils/apiClient';

export const adminService = {
  getPendingLandlords: async () => {
    return await apiClient.get('/api/Admin/landlords/pending');
  },

  approveLandlord: async (id) => {
    return await apiClient.post(`/api/Admin/landlords/${id}/approve`);
  },

  rejectLandlord: async (id) => {
    return await apiClient.post(`/api/Admin/landlords/${id}/reject`);
  },

  getPendingProperties: async () => {
    return await apiClient.get('/api/Admin/properties/pending');
  },

  approveProperty: async (id) => {
    return await apiClient.post(`/api/Admin/properties/${id}/approve`);
  },

  rejectProperty: async (id) => {
    return await apiClient.post(`/api/Admin/properties/${id}/reject`);
  }
};
