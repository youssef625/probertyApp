import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { adminService } from '../services/adminService';
import '../admin.css';

const PropertyApprovals = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All Requests');

  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['pendingProperties'],
    queryFn: async () => {
      const data = await adminService.getPendingProperties();
      const rawArray = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      // Map the backend schema to what the PropertyCard component expects
      return rawArray.map(item => ({
        id: item.id,
        title: item.title,
        location: item.location,
        price: item.price ? `$${item.price.toLocaleString()}/mo` : '$0/mo',
        image: item.imageUrls && item.imageUrls.length > 0 
          ? `https://app-260407103838.azurewebsites.net${item.imageUrls[0]}` 
          : 'https://via.placeholder.com/400x300?text=No+Image',
        status: item.approvalStatus === 'Pending' ? 'NEW SUBMISSION' : (item.approvalStatus || 'NEW SUBMISSION'),
        landlord: {
          name: item.landlordName || 'Unknown Landlord',
          verified: true // adjust if backend provides a verified flag later
        }
      }));
    },
    staleTime: 5 * 60 * 1000, // keep cache fresh for 5 minutes
  });

  const handleAccept = async (id) => {
    try {
      await adminService.approveProperty(id);
      // Remove from Cache instantly
      queryClient.setQueryData(['pendingProperties'], (old) => old?.filter(p => (p.id || p.propertyId) !== id));
    } catch {
      alert("Failed to approve property.");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectProperty(id);
      // Remove from Cache instantly
      queryClient.setQueryData(['pendingProperties'], (old) => old?.filter(p => (p.id || p.propertyId) !== id));
    } catch {
      alert("Failed to reject property.");
    }
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'All Requests') return true;
    if (activeTab === 'Urgent') return p.status === 'URGENT REVIEW' || p.isUrgent;
    if (activeTab === 'Flagged') return p.status === 'RE-SUBMISSION' || p.isFlagged;
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="page-title">
        <h1>Property Approvals</h1>
        <p>Review and manage pending property listings for RentVibe.</p>
      </div>

      <div className="tabs-container">
        {['All Requests', 'Urgent', 'Flagged'].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
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
        
        {/* Placeholder Card for "Pending Integration" as in UI */}
        <div className="property-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px', border: '2px dashed #e2e4ea', boxShadow: 'none' }}>
          <div style={{ textAlign: 'center', color: '#718096' }}>
            <div style={{ background: '#f7f8fc', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: '#2d3748' }}>Pending Integration</h3>
            <p style={{ fontSize: '0.85rem' }}>New listings will automatically<br/>appear here for verification.</p>
          </div>
        </div>
      </div>

      <div className="table-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#718096', fontSize: '0.85rem' }}>Showing {filteredProperties.length > 0 ? filteredProperties.length : 0} of 24 pending properties</div>
        <div className="table-pagination" style={{ display: 'flex', gap: '8px' }}>
          <button className="pagination-btn" style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}><ChevronLeft size={16} /></button>
          <button className="pagination-btn active" style={{ padding: '4px 12px', border: 'none', borderRadius: '8px', background: '#374151', color: 'white' }}>1</button>
          <button className="pagination-btn" style={{ padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>2</button>
          <button className="pagination-btn" style={{ padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>3</button>
          <button className="pagination-btn" style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default PropertyApprovals;
