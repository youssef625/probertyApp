import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import '../../admin/admin.css';

const ManageProperties = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['myProperties'],
    queryFn: () => propertyService.getMyProperties(),
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(id);
        queryClient.setQueryData(['myProperties'], (old) => {
          const newProperties = old?.filter(p => p.id !== id);
          // If the last item on the page is deleted, go back a page
          if (newProperties && newProperties.length <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
          return newProperties;
        });
      } catch (err) {
        alert('Failed to delete property.');
      }
    }
  };

  // Pagination Logic
  const totalItems = properties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to top when changing page
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Properties</h1>
          <p>Create, update, and manage your property listings.</p>
        </div>
        <button
          onClick={() => navigate('/properties/add')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#0f9d58', color: 'white',
            padding: '10px 16px', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: '600'
          }}
        >
          <Plus size={18} />
          Add Property
        </button>
      </div>

      <div className="property-grid">
        {loading && <SkeletonCards count={3} />}

        {!loading && properties.length === 0 && (
          <div style={{ padding: '40px', color: '#718096', gridColumn: '1 / -1', textAlign: 'center' }}>
            No properties found. Click "Add Property" to create one.
          </div>
        )}

        {!loading && currentProperties.map(property => (
          <div key={property.id} className="property-card">
            <div className="property-image-wrapper">
              <img
                src={property.imageUrls && property.imageUrls[0] && property.imageUrls[0] !== 'string' 
                  ? (property.imageUrls[0].startsWith('http') ? property.imageUrls[0] : `https://app-260407103838.azurewebsites.net${property.imageUrls[0]}`) 
                  : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23718096%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'}
                alt={property.title}
                className="property-image"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23718096%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
              />
              <span className={`property-badge ${(property.approvalStatus || 'Pending') === 'Approved' ? 'verified' : 'urgent'}`}>
                {property.approvalStatus || 'Pending'}
              </span>
              <span className="property-price">{property.price ? `$${property.price}/mo` : '$0/mo'}</span>
            </div>

            <div className="property-details">
              <h3 className="property-title">{property.title || 'Untitled'}</h3>
              <div className="property-location">
                {property.location || 'No Location'}
              </div>

              <div className="property-actions" style={{ marginTop: 'auto', gap: '8px' }}>
                <button
                  className="btn-accept"
                  style={{ backgroundColor: '#edf2f7', color: '#4a5568', flex: 1 }}
                  onClick={() => navigate(`/properties/edit/${property.id}`)}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleDelete(property.id)}
                  style={{ flex: 1 }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {!loading && properties.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginTop: '32px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e4ea'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} PROPERTIES
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e4ea', borderRadius: '6px', background: currentPage === 1 ? '#f7f8fc' : '#fff', color: currentPage === 1 ? '#cbd5e1' : '#718096', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;
              return (
                <button 
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page)}
                  style={{ 
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    border: isActive ? 'none' : '1px solid #e2e4ea', 
                    borderRadius: '6px', 
                    background: isActive ? '#384050' : '#fff', 
                    color: isActive ? '#fff' : '#718096', 
                    cursor: 'pointer', 
                    fontWeight: isActive ? 'bold' : 'normal' 
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e4ea', borderRadius: '6px', background: currentPage === totalPages ? '#f7f8fc' : '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#718096', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton loading cards for a polished loading experience
const SkeletonCards = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="property-card skeleton-card">
        <div className="skeleton-image shimmer" />
        <div style={{ padding: '20px' }}>
          <div className="skeleton-line shimmer" style={{ width: '70%', height: '16px', marginBottom: '8px' }} />
          <div className="skeleton-line shimmer" style={{ width: '50%', height: '12px', marginBottom: '20px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skeleton-line shimmer" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
            <div className="skeleton-line shimmer" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    ))}
  </>
);

export default ManageProperties;
