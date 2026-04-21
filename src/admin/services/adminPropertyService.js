import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app-260407103838.azurewebsites.net'; 

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Simulated mock data
let mockProperties = [
  {
    id: 1,
    title: 'Modern Downtown Apartment',
    location: '123 Main St, New York, NY',
    price: 2500,
    imageUrls: ['https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg'],
    approvalStatus: 'Approved'
  },
  {
    id: 2,
    title: 'Cozy Suburb House',
    location: '456 Elm St, New York, NY',
    price: 3200,
    imageUrls: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    approvalStatus: 'Pending'
  }
];

let mockVisits = [
  {
    id: 101,
    propertyName: 'Modern Downtown Apartment',
    applicantName: 'John Doe',
    applicantEmail: 'john@example.com',
    date: 'Oct 24, 2023',
    time: '14:00',
    status: 'Pending'
  }
];

let mockApplications = [
  {
    id: 201,
    propertyName: 'Cozy Suburb House',
    applicantName: 'Sarah Smith',
    applicantEmail: 'sarah@example.com',
    date: 'Oct 25, 2023',
    status: 'Pending'
  }
];

export const adminPropertyService = {
  // --- PROPERTIES ---
  getProperties: async () => {
    return Promise.resolve(mockProperties);
  },
  
  createProperty: async (propertyData) => {
    const newProp = { id: Date.now(), ...propertyData, approvalStatus: 'Pending' };
    mockProperties.push(newProp);
    return Promise.resolve(newProp);
  },

  updateProperty: async (id, propertyData) => {
    mockProperties = mockProperties.map(p => p.id === id ? { ...p, ...propertyData } : p);
    return Promise.resolve(true);
  },

  deleteProperty: async (id) => {
    mockProperties = mockProperties.filter(p => p.id !== id);
    return Promise.resolve(true);
  },

  // --- VISITS ---
  getVisitRequests: async () => {
    return Promise.resolve(mockVisits);
  },

  acceptVisit: async (id) => {
    mockVisits = mockVisits.map(v => v.id === id ? { ...v, status: 'Accepted' } : v);
    return Promise.resolve(true);
  },

  rejectVisit: async (id) => {
    mockVisits = mockVisits.map(v => v.id === id ? { ...v, status: 'Rejected' } : v);
    return Promise.resolve(true);
  },

  // --- APPLICATIONS ---
  getApplications: async () => {
    return Promise.resolve(mockApplications);
  },

  acceptApplication: async (id) => {
    mockApplications = mockApplications.map(a => a.id === id ? { ...a, status: 'Accepted' } : a);
    return Promise.resolve(true);
  },

  rejectApplication: async (id) => {
    mockApplications = mockApplications.map(a => a.id === id ? { ...a, status: 'Rejected' } : a);
    return Promise.resolve(true);
  }
};
