import React, { useState, useEffect } from 'react';
import { CalendarCheck, Users, CheckCircle2, Clock, ChevronLeft, ChevronRight, Hourglass } from 'lucide-react';
import { adminService } from '../services/adminService';
import '../admin.css';

const LandlordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingLandlords();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load landlords', err);
      // Optional fallback
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveLandlord(id);
      setRequests(requests.filter(r => (r.id || r.landlordId) !== id));
    } catch {
      alert("Failed to approve landlord.");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectLandlord(id);
      setRequests(requests.filter(r => (r.id || r.landlordId) !== id));
    } catch {
      alert("Failed to reject landlord.");
    }
  };

  return (
    <div className="page-wrapper">
      
      <div className="requests-header-top">
        <div className="page-title" style={{ marginBottom: 0 }}>
          <h1>Landlord Requests</h1>
          <p>Review and verify new landlord onboarding applications.</p>
        </div>
        
        <div className="pending-items-card">
          <div className="pending-icon">
            <CalendarCheck size={28} strokeWidth={1.5} />
          </div>
          <div className="pending-stats">
            <span className="pending-number">{requests.length} Pending Items</span>
            <span className="pending-label">Requires Attention</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>Landlord</div>
          <div>Registration Date</div>
          <div>Document Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        
        <div className="admin-table-body">
          {requests.length === 0 && !loading && (
             <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>No pending requests found.</div>
          )}
          {loading && (
             <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>Loading requests...</div>
          )}
          {requests.map((request, index) => {
            const id = request.id || request.landlordId || index;
            const name = request.name || 'Unknown Landlord';
            const email = request.email || 'No email provided';
            const avatar = request.avatar || `https://i.pravatar.cc/150?u=${id}`;
            const date = request.date || new Date(request.createdAt || Date.now()).toLocaleDateString();
            const time = request.time || '';
            const status = request.status || 'Pending Review';

            return (
              <div className="admin-table-row" key={id}>
                <div className="table-cell-landlord">
                  <img src={avatar} alt={name} className="table-avatar" />
                  <div className="table-personal-info">
                    <span className="table-name">{name}</span>
                    <span className="table-email">{email}</span>
                  </div>
                </div>
                
                <div className="table-cell-date">
                  <span className="table-date">{date}</span>
                  <span className="table-time">{time}</span>
                </div>
                
                <div className="table-cell-status">
                  <span className={`status-badge ${status === 'Verified' ? 'verified' : 'pending'}`}>
                    {status === 'Verified' ? (
                      <>
                        <CheckCircle2 size={14} />
                        Verified
                      </>
                    ) : (
                      <>
                        <Hourglass size={14} />
                        Pending Review
                      </>
                    )}
                  </span>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleApprove(id)} className="btn-accept" style={{ padding: '6px 16px' }}>APPROVE</button>
                  <button onClick={() => handleReject(id)} className="btn-reject" style={{ padding: '6px 16px' }}>REJECT</button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="table-footer">
          <div>SHOWING 1 TO {requests.length > 0 ? requests.length : 0} OF {requests.length} ENTRIES</div>
          <div className="table-pagination">
            <button className="pagination-btn"><ChevronLeft size={16} /></button>
            <button className="pagination-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LandlordRequests;
