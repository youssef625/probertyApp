import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPropertyService } from '../services/adminPropertyService';
import { User, Check, X, FileText } from 'lucide-react';

const AdminRentalApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading: loading } = useQuery({
    queryKey: ['rentalApplications'],
    queryFn: () => adminPropertyService.getApplications(),
  });

  const handleAccept = async (id) => {
    await adminPropertyService.acceptApplication(id);
    queryClient.setQueryData(['rentalApplications'], (old) =>
      old?.map(a => a.id === id ? { ...a, status: 'Accepted' } : a)
    );
  };

  const handleReject = async (id) => {
    await adminPropertyService.rejectApplication(id);
    queryClient.setQueryData(['rentalApplications'], (old) =>
      old?.map(a => a.id === id ? { ...a, status: 'Rejected' } : a)
    );
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="page-title">
        <h1>Rental Applications</h1>
        <p>Review and decide on potential tenants for properties.</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>APPLICANT</div>
          <div>PROPERTY</div>
          <div>SUBMISSION DATE</div>
          <div>ACTION</div>
        </div>

        {loading && <SkeletonRows count={3} />}

        {!loading && applications.length === 0 && (
           <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>No rental applications found.</div>
        )}

        {!loading && applications.map(app => (
          <div key={app.id} className="admin-table-row">
            <div className="table-cell-landlord">
              <div className="table-avatar" style={{ backgroundColor: '#2b6cb0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <User size={24} />
              </div>
              <div className="table-personal-info">
                <span className="table-name">{app.applicantName}</span>
                <span className="table-email">{app.applicantEmail}</span>
              </div>
            </div>

            <div style={{ fontWeight: 500, color: '#2d3748' }}>
              {app.propertyName}
            </div>

            <div className="table-cell-date">
              <span className="table-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> {app.date}
              </span>
            </div>

            <div className="table-cell-status">
              {app.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleAccept(app.id)}
                    style={{ padding: '6px 12px', background: '#0f9d58', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(app.id)}
                    style={{ padding: '6px 12px', background: '#d93025', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              ) : (
                <span className={`status-badge ${app.status === 'Accepted' ? 'verified' : 'pending'}`} style={app.status === 'Rejected' ? { backgroundColor: '#fce8e8', color: '#e53e3e' } : {}}>
                  {app.status}
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

export default AdminRentalApplications;
