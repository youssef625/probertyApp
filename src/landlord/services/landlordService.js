import { apiClient } from '../../utils/apiClient';
import { createPropertyGql, updatePropertyGql, deletePropertyGql } from '../../services/graphqlApi';
import { uploadPropertyImages } from '../../services/api';

export const landlordService = {
  
  getMyProperties: async () => {
    return await apiClient.get('/api/Properties/my');
  },

  
  createProperty: async (data) => {
    return await createPropertyGql(data);
  },

  
  updateProperty: async (id, data) => {
    return await updatePropertyGql(id, data);
  },

  
  deleteProperty: async (id) => {
    return await deletePropertyGql(id);
  },

  uploadPropertyImages: async (propertyId, files = []) => {
    return await uploadPropertyImages(propertyId, files);
  },

  
  getVisitRequests: async () => {
    return await apiClient.get('/api/Visits/landlord');
  },

  updateVisitStatus: async (visitId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Visits/${visitId}/${endpoint}`);
  },

  
  getApplications: async () => {
    return await apiClient.get('/api/Applications/landlord');
  },

  updateApplicationStatus: async (applicationId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Applications/${applicationId}/${endpoint}`);
  }
};
