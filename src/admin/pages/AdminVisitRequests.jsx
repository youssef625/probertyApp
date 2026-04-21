import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPropertyService } from '../services/adminPropertyService';
import { Calendar, User, Check, X } from 'lucide-react';

const AdminVisitRequests = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading } = useQuery({
    queryKey: ['visitRequests'],
    queryFn: () => adminPropertyService.getVisitRequests(),
  });

  const handleAccept = async (id) => {
    await adminPropertyService.acceptVisit(id);
    // Optimistic update
    queryClient.setQueryData(['visitRequests'], (old) =>
      old?.map(v => v.id === id ? { ...v, status: 'Accepted' } : v)
    );
  };

  const handleReject = async (id) => {
    await adminPropertyService.rejectVisit(id);
    queryClient.setQueryData(['visitRequests'], (old) =>
      old?.map(v => v.id === id ? { ...v, status: 'Rejected' } : v)
    );
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="page-title">
        <h1>Visit Requests</h1>
        <p>Review and schedule property viewings requested by tenants.</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>APPLICANT</div>
          <div>PROPERTY</div>
          <div>DATE & TIME</div>
          <div>ACTION</div>
        </div>

        {loading && <SkeletonRows count={3} />}

        {!loading && requests.length === 0 && (
           <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>No visit requests.</div>
        )}

        {!loading && requests.map(req => (
          <div key={req.id} className="admin-table-row">
            <div className="table-cell-landlord">
              <div className="table-avatar" style={{ backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568' }}>
                <User size={24} />
              </div>
              <div className="table-personal-info">
                <span className="table-name">{req.applicantName}</span>
                <span className="table-email">{req.applicantEmail}</span>
              </div>
            </div>

            <div style={{ fontWeight: 500, color: '#2d3748' }}>
              {req.propertyName}
            </div>

            <div className="table-cell-date">
              <span className="table-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {req.date}
              </span>
              <span className="table-time">{req.time}</span>
            </div>

            <div className="table-cell-status">
              {req.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleAccept(req.id)}
                    style={{ padding: '6px 12px', background: '#def6e9', color: '#0f9d58', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    style={{ padding: '6px 12px', background: '#fce8e8', color: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              ) : (
                <span className={`status-badge ${req.status === 'Accepted' ? 'verified' : 'pending'}`} style={req.status === 'Rejected' ? { backgroundColor: '#fce8e8', color: '#e53e3e' } : {}}>
                  {req.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkeletonRows = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="admin-table-row">
        <div className="table-cell-landlord">
          <div className="skeleton-avatar shimmer" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton-line shimmer" style={{ width: '120px', height: '14px' }} />
            <div className="skeleton-line shimmer" style={{ width: '160px', height: '10px' }} />
          </div>
        </div>
        <div><div className="skeleton-line shimmer" style={{ width: '130px', height: '14px' }} /></div>
        <div><div className="skeleton-line shimmer" style={{ width: '100px', height: '14px' }} /></div>
        <div><div className="skeleton-line shimmer" style={{ width: '80px', height: '28px', borderRadius: '6px' }} /></div>
      </div>
    ))}
  </>
);

export default AdminVisitRequests;
