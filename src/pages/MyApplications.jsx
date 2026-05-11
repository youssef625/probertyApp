import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiFileText, FiMapPin, FiUpload, FiSend } from 'react-icons/fi';
import TenantNavbar from '../components/TenantNavbar';
import {
  createApplication,
  getMyApplications,
  getMyVisits,
  uploadApplicationDocuments,
} from '../services/api';
import { getApiBaseUrl, getApiErrorMessages } from '../utils/apiClient';
import ErrorBanner from '../components/ErrorBanner';

const API_BASE_URL = getApiBaseUrl();

const normalizeStatus = (value) => (value || '').toString().toLowerCase();

const getVisitPropertyId = (visit) => visit?.propertyId ?? visit?.PropertyId;
const getVisitPropertyTitle = (visit) => visit?.propertyTitle ?? visit?.PropertyTitle;
const getVisitDate = (visit) => visit?.requestedDate ?? visit?.RequestedDate;

const getApplicationPropertyTitle = (app) => app?.propertyTitle ?? app?.PropertyTitle;
const getApplicationDocuments = (app) => app?.documents ?? app?.Documents ?? [];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageErrors, setPageErrors] = useState([]);
  const [actionErrors, setActionErrors] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({});
  const [creating, setCreating] = useState({});
  const [uploading, setUploading] = useState({});
  const [messages, setMessages] = useState({});
  const [rentalPeriods, setRentalPeriods] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsData, visitsData] = await Promise.all([
        getMyApplications(),
        getMyVisits(),
      ]);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setVisits(Array.isArray(visitsData) ? visitsData : []);
      setPageErrors([]);
    } catch (err) {
      setPageErrors(getApiErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applicationsByProperty = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      const propertyId = app?.propertyId ?? app?.PropertyId;
      if (propertyId) {
        map.set(Number(propertyId), app);
      }
    });
    return map;
  }, [applications]);

  const eligibleVisits = useMemo(() => {
    const now = new Date();
    return visits.filter((visit) => {
      const propertyId = Number(getVisitPropertyId(visit));
      if (!propertyId) return false;
      if (applicationsByProperty.has(propertyId)) return false;
      const statusValue = normalizeStatus(visit?.status ?? visit?.Status);
      if (statusValue !== 'accepted') return false;
      const visitDate = new Date(getVisitDate(visit));
      return !Number.isNaN(visitDate.getTime()) && visitDate <= now;
    });
  }, [visits, applicationsByProperty]);

  const handleCreateApplication = async (visit) => {
    const propertyId = Number(getVisitPropertyId(visit));
    if (!propertyId) return;

    const period = rentalPeriods[propertyId] || {};
    if (!period.start || !period.end) {
      setActionErrors(['Please choose a rental start and end date.']);
      return;
    }

    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setActionErrors(['Please choose valid rental dates.']);
      return;
    }

    if (endDate <= startDate) {
      setActionErrors(['Rental end date must be after the start date.']);
      return;
    }

    try {
      setCreating((prev) => ({ ...prev, [propertyId]: true }));
      await createApplication(
        propertyId,
        startDate.toISOString(),
        endDate.toISOString(),
        messages[propertyId] || ''
      );
      setMessages((prev) => ({ ...prev, [propertyId]: '' }));
      setActionErrors([]);
      await fetchData();
    } catch (err) {
      setActionErrors(getApiErrorMessages(err));
    } finally {
      setCreating((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const canUploadDocuments = (app) => {
    const propertyId = Number(app?.propertyId ?? app?.PropertyId);
    if (!propertyId) return false;

    const visit = visits.find((item) => Number(getVisitPropertyId(item)) === propertyId);
    if (!visit) return false;

    const statusValue = normalizeStatus(visit?.status ?? visit?.Status);
    if (statusValue !== 'accepted') return false;

    const visitDate = new Date(getVisitDate(visit));
    if (Number.isNaN(visitDate.getTime())) return false;

    return visitDate <= new Date();
  };

  const handleUploadDocuments = async (app) => {
    const appId = app?.id ?? app?.Id;
    const files = uploadFiles[appId] || [];

    if (!appId || files.length === 0) {
      setActionErrors(['Please choose at least one document to upload.']);
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [appId]: true }));
      await uploadApplicationDocuments(appId, files);
      setUploadFiles((prev) => ({ ...prev, [appId]: [] }));
      setActionErrors([]);
      await fetchData();
    } catch (err) {
      setActionErrors(getApiErrorMessages(err));
    } finally {
      setUploading((prev) => ({ ...prev, [appId]: false }));
    }
  };

  if (loading) {
    return (
      <>
        <TenantNavbar />
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <TenantNavbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-base-content">My Applications</h1>
          <p className="text-base-content/70">Track your rental applications and upload required documents after your visit.</p>
        </div>

        <ErrorBanner messages={pageErrors} className="mb-4" />
        <ErrorBanner messages={actionErrors} className="mb-6" />

        {eligibleVisits.length > 0 && (
          <div className="mb-10 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Visits ready for application</h2>
            <div className="space-y-4">
              {eligibleVisits.map((visit) => {
                const propertyId = Number(getVisitPropertyId(visit));
                const title = getVisitPropertyTitle(visit) || 'Property';
                const visitDate = getVisitDate(visit);
                return (
                  <div key={`${propertyId}-${visitDate}`} className="rounded-xl border border-base-200 p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-base-content/70 flex items-center gap-2">
                          <FiCalendar />
                          Visit date: {visitDate ? new Date(visitDate).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm gap-2"
                        onClick={() => handleCreateApplication(visit)}
                        disabled={creating[propertyId]}
                      >
                        <FiSend />
                        {creating[propertyId] ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <label className="text-sm text-base-content/70">
                          Rental start date
                          <input
                            type="date"
                            className="input input-bordered w-full mt-1"
                            value={rentalPeriods[propertyId]?.start || ''}
                            onChange={(event) => setRentalPeriods((prev) => ({
                              ...prev,
                              [propertyId]: {
                                ...prev[propertyId],
                                start: event.target.value,
                              },
                            }))}
                          />
                        </label>
                        <label className="text-sm text-base-content/70">
                          Rental end date
                          <input
                            type="date"
                            className="input input-bordered w-full mt-1"
                            value={rentalPeriods[propertyId]?.end || ''}
                            onChange={(event) => setRentalPeriods((prev) => ({
                              ...prev,
                              [propertyId]: {
                                ...prev[propertyId],
                                end: event.target.value,
                              },
                            }))}
                          />
                        </label>
                      </div>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        rows="2"
                        placeholder="Add a message for the landlord (optional)"
                        value={messages[propertyId] || ''}
                        onChange={(event) => setMessages((prev) => ({
                          ...prev,
                          [propertyId]: event.target.value,
                        }))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-base-200 bg-base-100 p-10 text-center text-base-content/70">
            No applications yet. After your visit, you can submit an application and upload documents here.
            <div className="mt-4">
              <Link to="/" className="btn btn-outline btn-sm">Browse properties</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const documents = getApplicationDocuments(app);
              const appId = app?.id ?? app?.Id;
              const status = app?.status ?? app?.Status ?? 'Pending';
              const propertyTitle = getApplicationPropertyTitle(app) || 'Property';
              const createdAt = app?.createdAt ?? app?.CreatedAt;
              const rentalStart = app?.rentalStartDate ?? app?.RentalStartDate;
              const rentalEnd = app?.rentalEndDate ?? app?.RentalEndDate;
              const propertyId = app?.propertyId ?? app?.PropertyId;

              return (
                <div key={appId || `${propertyTitle}-${createdAt}`} className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{propertyTitle}</h3>
                      <p className="text-sm text-base-content/70 flex items-center gap-2">
                        <FiMapPin />
                        Application status: {status}
                      </p>
                      {createdAt && (
                        <p className="text-sm text-base-content/60 flex items-center gap-2 mt-1">
                          <FiCalendar />
                          Submitted: {new Date(createdAt).toLocaleDateString()}
                        </p>
                      )}
                      {rentalStart && rentalEnd && (
                        <p className="text-sm text-base-content/60 flex items-center gap-2 mt-1">
                          <FiCalendar />
                          Rental period: {new Date(rentalStart).toLocaleDateString()} - {new Date(rentalEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Property ID: {propertyId}
                    </div>
                  </div>

                  {app?.message && (
                    <div className="mt-4 rounded-lg bg-base-200/60 p-4 text-sm">
                      {app.message}
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <FiFileText /> Documents
                    </h4>
                    {documents.length === 0 ? (
                      <p className="text-sm text-base-content/60">No documents uploaded yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {documents.map((doc) => {
                          const docId = doc?.id ?? doc?.Id;
                          const fileName = doc?.fileName ?? doc?.FileName ?? `Document ${docId}`;
                          return (
                            <a
                              key={docId}
                              className="btn btn-xs btn-outline"
                              href={`${API_BASE_URL}/api/Applications/${appId}/documents/${docId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {fileName}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {canUploadDocuments(app) && (
                    <div className="mt-6 rounded-xl border border-base-200 bg-base-200/40 p-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <FiUpload /> Upload documents
                      </h4>
                      <input
                        type="file"
                        multiple
                        className="file-input file-input-bordered w-full"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(event) => setUploadFiles((prev) => ({
                          ...prev,
                          [appId]: Array.from(event.target.files || []),
                        }))}
                      />
                      <button
                        className="btn btn-primary btn-sm mt-3"
                        onClick={() => handleUploadDocuments(app)}
                        disabled={uploading[appId]}
                      >
                        {uploading[appId] ? 'Uploading...' : 'Upload Documents'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
