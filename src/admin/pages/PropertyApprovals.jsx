import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import ErrorBanner from '../../components/ErrorBanner';
import { getApiBaseUrl, getApiErrorMessages } from '../../utils/apiClient';
import { adminService } from '../services/adminService';
import notAvailableImage from '../../assets/not-available.svg';
import '../admin.css';

const API_BASE_URL = getApiBaseUrl();

const PropertyApprovals = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All Requests');
  const [actionErrors, setActionErrors] = useState([]);

  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['pendingProperties'],
    queryFn: async () => {
      const data = await adminService.getPendingProperties();
      const rawArray = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      
      return rawArray.map(item => ({
        id: item.id,
        title: item.title,
        location: item.location,
        price: item.price ? `$${item.price.toLocaleString()}/mo` : '$0/mo',
        image: item.imageUrls && item.imageUrls.length > 0 
          ? `${API_BASE_URL}${item.imageUrls[0]}` 
          : notAvailableImage,
        status: item.approvalStatus === 'Pending' ? 'NEW SUBMISSION' : (item.approvalStatus || 'NEW SUBMISSION'),
        landlord: {
          name: item.landlordName || 'Unknown Landlord',
          verified: true 
        }
      }));
    },
    staleTime: 5 * 60 * 1000, 
  });

  const handleAccept = async (id) => {
    try {
      await adminService.approveProperty(id);
      
      queryClient.setQueryData(['pendingProperties'], (old) => old?.filter(p => (p.id || p.propertyId) !== id));
      setActionErrors([]);
    } catch (err) {
      setActionErrors(getApiErrorMessages(err));
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectProperty(id);
      
      queryClient.setQueryData(['pendingProperties'], (old) => old?.filter(p => (p.id || p.propertyId) !== id));
      setActionErrors([]);
    } catch (err) {
      setActionErrors(getApiErrorMessages(err));
    }
  };

  const filteredProperties = properties;

  return (
    <div className="page-wrapper">
      <div className="page-title">
        <h1>Property Approvals</h1>
        <p>Review and manage pending property listings for RentVibe.</p>
      </div>

      <ErrorBanner messages={actionErrors} className="mb-6" />

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'All Requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('All Requests')}
        >
          All Requests
        </button>
      </div>

      <div className="property-grid">
        {loading && (
          <div style={{ textAlign: 'center', color: '#718096', gridColumn: '1 / -1', padding: '40px' }}>Loading properties...</div>
        )}
        {!loading && filteredProperties.length === 0 && (
          <div style={{ textAlign: 'center', color: '#718096', gridColumn: '1 / -1', padding: '40px' }}>No pending properties found.</div>
        )}
        
        {filteredProperties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
        
      </div>

      <div className="table-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#718096', fontSize: '0.85rem' }}>Showing {filteredProperties.length} pending {filteredProperties.length === 1 ? 'property' : 'properties'}</div>
      </div>
    </div>
  );
};

export default PropertyApprovals;
