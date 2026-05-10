import { apiClient } from '../../utils/apiClient';
import { createPropertyGql, updatePropertyGql, deletePropertyGql } from '../../services/graphqlApi';

export const landlordService = {
  // Properties — READ via REST (landlord's own properties aren't in the GraphQL public query)
  getMyProperties: async () => {
    return await apiClient.get('/api/Properties/my');
  },

  // Properties — CREATE via GraphQL mutation
  createProperty: async (data) => {
    return await createPropertyGql(data);
  },

  // Properties — UPDATE via GraphQL mutation
  updateProperty: async (id, data) => {
    return await updatePropertyGql(id, data);
  },

  // Properties — DELETE via GraphQL mutation
  deleteProperty: async (id) => {
    return await deletePropertyGql(id);
  },

  // Visit Requests — REST (no GraphQL schema for visits)
  getVisitRequests: async () => {
    return await apiClient.get('/api/Visits/landlord');
  },

  updateVisitStatus: async (visitId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Visits/${visitId}/${endpoint}`);
  },

  // Rental Applications — REST (no GraphQL schema for applications)
  getApplications: async () => {
    return await apiClient.get('/api/Applications/landlord');
  },

  updateApplicationStatus: async (applicationId, status) => {
    const endpoint = status === 'Approved' ? 'accept' : 'reject';
    return await apiClient.post(`/api/Applications/${applicationId}/${endpoint}`);
  }
};
