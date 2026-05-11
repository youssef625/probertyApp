import React, { useState, useEffect } from 'react';
import { Check, X, FileText, User, Calendar, MapPin } from 'lucide-react';
import { landlordService } from '../services/landlordService';
import ErrorBanner from '../../components/ErrorBanner';
import { getApiBaseUrl, getApiErrorMessages } from '../../utils/apiClient';

const API_BASE_URL = getApiBaseUrl();
const getDocumentUrl = (applicationId, documentId) => `${API_BASE_URL}/api/Applications/${applicationId}/documents/${documentId}`;

const RentalApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [actionErrors, setActionErrors] = useState([]);

  const formatDateRange = (start, end) => {
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const hasValidStart = startDate && !Number.isNaN(startDate.getTime());
    const hasValidEnd = endDate && !Number.isNaN(endDate.getTime());

    if (!hasValidStart && !hasValidEnd) return 'Not provided';

    const formatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const startLabel = hasValidStart ? startDate.toLocaleDateString(undefined, formatOptions) : 'N/A';
    const endLabel = hasValidEnd ? endDate.toLocaleDateString(undefined, formatOptions) : 'N/A';

    return `${startLabel} - ${endLabel}`;
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await landlordService.getApplications();
      setApplications(data || []);
      setErrorMessages([]);
    } catch (err) {
      console.error(err);
      setErrorMessages(getApiErrorMessages(err));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
      try {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        await landlordService.updateApplicationStatus(id, status);
        setActionErrors([]);
      } catch (err) {
        setActionErrors(getApiErrorMessages(err));
        fetchApplications(); // revert
      }
    }
  };

  if (loading) return <div className="p-8">Loading applications...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Rental Applications</h1>
        <p className="text-slate-500 mt-1">Review and manage tenant applications for your properties</p>
      </div>

      <ErrorBanner messages={errorMessages} className="mb-4" />
      <ErrorBanner messages={actionErrors} className="mb-6" />

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center border border-slate-200 shadow-sm text-slate-500">
            No rental applications received yet.
          </div>
        ) : (
          applications.map(app => {
            const tenantName = (app?.tenantName ?? app?.TenantName ?? '').toString().trim();
            return (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              {/* Left side: Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <User size={20} className="text-slate-400" />
                      {tenantName || 'Anonymous Applicant'}
                    </h2>
                    <div className={`badge ${
                      app.status === 'Approved' ? 'badge-success' : 
                      app.status === 'Rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {app.status || 'Pending'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-800">{app.propertyTitle || 'Property Name'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Applied: {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span>
                        Rental period: {formatDateRange(app.rentalStartDate ?? app.RentalStartDate, app.rentalEndDate ?? app.RentalEndDate)}
                      </span>
                    </div>
                    {app.message && (
                      <div className="col-span-full mt-2 bg-slate-50 p-3 rounded text-slate-700 italic border-l-4 border-indigo-200">
                        "{app.message}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents section */}
                {(() => {
                  const documents = app.documents || app.Documents || [];
                  if (documents.length === 0) return null;
                  return (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText size={16} /> Attached Documents
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {documents.map((doc, idx) => (
                        <a 
                          key={doc?.id || doc?.Id || idx} 
                          href={getDocumentUrl(app.id, doc?.id ?? doc?.Id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-outline btn-primary"
                        >
                          {doc?.fileName || doc?.FileName || `Document ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                  );
                })()}
              </div>

              {/* Right side: Actions */}
              <div className="bg-slate-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-center gap-3">
                {(!app.status || app.status === 'Pending') ? (
                  <>
                    <p className="text-xs text-center text-slate-500 mb-2">
                      Approving an application will automatically set the property status to "Rented".
                    </p>
                    <button 
                      className="btn btn-success w-full text-white"
                      onClick={() => handleUpdateStatus(app.id, 'Approved')}
                    >
                      <Check size={18} className="mr-2" /> Approve
                    </button>
                    <button 
                      className="btn btn-outline btn-error w-full"
                      onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                    >
                      <X size={18} className="mr-2" /> Reject
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600 mb-2">Application is</p>
                    <div className={`text-lg font-bold ${app.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {app.status}
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RentalApplications;
