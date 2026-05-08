import React, { useState, useEffect } from 'react';
import { Check, X, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { landlordService } from '../services/landlordService';
import ErrorBanner from '../../components/ErrorBanner';
import { getApiErrorMessages } from '../../utils/apiClient';

const VisitRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [actionErrors, setActionErrors] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await landlordService.getVisitRequests();
      setRequests(data || []);
      setErrorMessages([]);
    } catch (err) {
      console.error(err);
      setErrorMessages(getApiErrorMessages(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      // Optimistic update
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
      await landlordService.updateVisitStatus(id, status);
      setActionErrors([]);
    } catch (err) {
      setActionErrors(getApiErrorMessages(err));
      fetchRequests(); // revert on failure
    }
  };

  if (loading) return <div className="p-8">Loading visit requests...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Visit Requests</h1>
        <p className="text-slate-500 mt-1">Manage showing appointments with prospective tenants</p>
      </div>

      <ErrorBanner messages={errorMessages} className="mb-4" />
      <ErrorBanner messages={actionErrors} className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl text-center border border-slate-200 shadow-sm text-slate-500">
            No visit requests pending at the moment.
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} className="card bg-white shadow-sm border border-slate-200">
              <div className="card-body p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-base font-bold truncate pr-4">{request.propertyTitle || 'Unknown Property'}</h2>
                  <div className={`badge badge-sm ${
                    request.status === 'Approved' ? 'badge-success' : 
                    request.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {request.status || 'Pending'}
                  </div>
                </div>
                
                <p className="text-sm font-medium text-slate-700 mb-4">By: {request.tenantName || 'Anonymous'}</p>

                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <CalendarIcon size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-medium">{new Date(request.requestedDate).toLocaleString()}</span>
                  </div>
                  {request.message && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                      <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="italic text-slate-600">"{request.message}"</span>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-end mt-auto">
                  {(!request.status || request.status === 'Pending') && (
                    <div className="flex gap-2 w-full">
                      <button 
                        className="btn btn-outline btn-error flex-1"
                        onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                      >
                        <X size={16} className="mr-1" /> Reject
                      </button>
                      <button 
                        className="btn btn-success text-white flex-1"
                        onClick={() => handleUpdateStatus(request.id, 'Approved')}
                      >
                        <Check size={16} className="mr-1" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisitRequests;
