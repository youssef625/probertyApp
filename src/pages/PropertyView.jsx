

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiHeart,
  FiHome,
  FiMapPin,
  FiPhone,
  FiStar,
  FiTruck,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { addToFavorites, removeFromFavorites, scheduleVisit, getFavorites, getMyVisits, getMyApplications, hasUserSession, getPropertyReviews, createReview, createApplication, uploadApplicationDocuments, resolveMediaUrl } from '../services/api';
import { getPropertyByIdGql } from '../services/graphqlApi';
import { getApiErrorMessages } from '../utils/apiClient';
import TenantNavbar from '../components/TenantNavbar';
import notAvailableImage from '../assets/not-available.svg';

const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasVisitRequest, setHasVisitRequest] = useState(false);
  const [userMetaLoading, setUserMetaLoading] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewErrors, setReviewErrors] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [hasAcceptedApplication, setHasAcceptedApplication] = useState(false);
  const [appStartDate, setAppStartDate] = useState('');
  const [appEndDate, setAppEndDate] = useState('');
  const [appMessage, setAppMessage] = useState('');
  const [appFiles, setAppFiles] = useState([]);
  const [appSubmitting, setAppSubmitting] = useState(false);

  
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyByIdGql(id);
        setProperty(data);
      } catch (err) {
        setError('Unable to load property details. This property may not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (!id || !hasUserSession()) {
      setIsFavorite(false);
      setHasVisitRequest(false);
      setCanReview(false);
      return;
    }

    let isActive = true;
    const propertyId = Number(id);

    const fetchUserMeta = async () => {
      setUserMetaLoading(true);
      try {
        const [favorites, visits, applications] = await Promise.all([
          getFavorites(),
          getMyVisits(),
          getMyApplications(),
        ]);

        if (!isActive) return;

        const favoriteList = Array.isArray(favorites) ? favorites : [];
        const favoriteMatch = favoriteList.some((fav) => {
          const favId = fav?.propertyId ?? fav?.property?.id ?? fav?.PropertyId;
          return Number(favId) === propertyId;
        });

        const visitList = Array.isArray(visits) ? visits : [];
        const visitMatch = visitList.some((visit) => {
          const visitPropertyId = Number(visit?.propertyId ?? visit?.PropertyId);
          const statusValue = (visit?.status ?? visit?.Status ?? '').toString().toLowerCase();
          return visitPropertyId === propertyId && statusValue === 'pending';
        });

        const appList = Array.isArray(applications) ? applications : [];
        const acceptedApp = appList.some((app) => {
          const appPropertyId = Number(app?.propertyId ?? app?.PropertyId);
          const statusValue = (app?.status ?? app?.Status ?? '').toString().toLowerCase();
          const rentalEnd = app?.rentalEndDate ?? app?.RentalEndDate;
          const endDate = rentalEnd ? new Date(rentalEnd) : null;
          const rentalEnded = endDate && !Number.isNaN(endDate.getTime()) && endDate <= new Date();
          return appPropertyId === propertyId && statusValue === 'accepted' && rentalEnded;
        });

        const pendingApp = appList.some((app) => {
          const appPropertyId = Number(app?.propertyId ?? app?.PropertyId);
          const statusValue = (app?.status ?? app?.Status ?? '').toString().toLowerCase();
          return appPropertyId === propertyId && statusValue === 'pending';
        });

        const acceptedAny = appList.some((app) => {
          const appPropertyId = Number(app?.propertyId ?? app?.PropertyId);
          const statusValue = (app?.status ?? app?.Status ?? '').toString().toLowerCase();
          return appPropertyId === propertyId && statusValue === 'accepted';
        });

        setIsFavorite(favoriteMatch);
        setHasVisitRequest(visitMatch);
        setCanReview(acceptedApp);
        setHasPendingApplication(pendingApp);
        setHasAcceptedApplication(acceptedAny);
      } catch (err) {
      } finally {
        if (isActive) {
          setUserMetaLoading(false);
        }
      }
    };

    fetchUserMeta();

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getPropertyReviews(id);
        setReviews(Array.isArray(data) ? data : []);
        setReviewErrors([]);
      } catch (err) {
        setReviewErrors(getApiErrorMessages(err));
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  
  const handleFavoriteToggle = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to add to favorites' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        setActionMessage({ type: 'success', text: 'Removed from favorites' });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        setActionMessage({ type: 'success', text: 'Added to favorites successfully' });
      }
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || 'Failed to update favorites' });
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  
  const handleScheduleVisit = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to schedule a visit' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (hasVisitRequest) {
      setActionMessage({ type: 'warning', text: 'You already have a pending visit request for this property' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (!visitDate) {
      setActionMessage({ type: 'warning', text: 'Please choose a visit date and time' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      const scheduledAt = new Date(visitDate);
      if (Number.isNaN(scheduledAt.getTime())) {
        setActionMessage({ type: 'warning', text: 'Invalid visit date. Please select a valid date.' });
        setTimeout(() => setActionMessage(null), 3000);
        return;
      }

      await scheduleVisit(id, scheduledAt.toISOString(), 'I would like to schedule a property viewing');
      setHasVisitRequest(true);
      setActionMessage({ type: 'success', text: 'Visit request sent successfully' });
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || 'Failed to schedule visit' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSubmitReview = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to leave a review' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (!canReview) {
      setActionMessage({ type: 'warning', text: 'You can review after your rental is accepted.' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      setReviewSubmitting(true);
      await createReview(id, Number(reviewRating), reviewComment.trim());
      setReviewComment('');
      setReviewRating('5');
      const data = await getPropertyReviews(id);
      setReviews(Array.isArray(data) ? data : []);
      setReviewErrors([]);
      setActionMessage({ type: 'success', text: 'Review submitted successfully' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setReviewErrors(getApiErrorMessages(err));
    } finally {
      setReviewSubmitting(false);
    }
  };

  
  const handleSubmitApplication = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to apply for rental' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (!appStartDate || !appEndDate) {
      setActionMessage({ type: 'warning', text: 'Please select both start and end dates' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (new Date(appEndDate) <= new Date(appStartDate)) {
      setActionMessage({ type: 'warning', text: 'End date must be after the start date' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      setAppSubmitting(true);
      const result = await createApplication(
        id,
        new Date(appStartDate).toISOString(),
        new Date(appEndDate).toISOString(),
        appMessage.trim()
      );

      
      if (appFiles.length > 0 && result?.id) {
        await uploadApplicationDocuments(result.id, Array.from(appFiles));
      }

      setHasPendingApplication(true);
      setAppStartDate('');
      setAppEndDate('');
      setAppMessage('');
      setAppFiles([]);
      setActionMessage({ type: 'success', text: 'Rental application submitted successfully!' });
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || 'Failed to submit application' });
    } finally {
      setAppSubmitting(false);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  
  if (loading) {
    return (
      <>
        <TenantNavbar />
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-4 text-lg">Loading property details...</p>
        </div>
      </>
    );
  }

  
  if (error || !property) {
    return (
      <>
        <TenantNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
          <div className="alert alert-error shadow-lg max-w-md mb-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-error/10 text-error p-2">
                <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <span className="font-bold">Sorry!</span>
                <span className="block">{error || 'Property not found'}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/')}
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </button>
        </div>
      </>
    );
  }

  
  const imageList = property.images?.length > 0 ? property.images : (property.imageUrls || []);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <TenantNavbar />
      {}
      {actionMessage && (
        <div
          className={`alert shadow-lg fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md ${actionMessage.type === 'success' ? 'alert-success' :
            actionMessage.type === 'error' ? 'alert-error' : 'alert-warning'
            }`}
        >
          <span className="inline-flex items-center justify-center rounded-full bg-base-100/60 p-2">
            {actionMessage.type === 'success' ? (
              <FiCheckCircle className="h-5 w-5" aria-hidden="true" />
            ) : actionMessage.type === 'error' ? (
              <FiXCircle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {}
      <div className="carousel w-full h-[400px] md:h-[550px] bg-base-300">
        {imageList.length > 0 ? (
          imageList.map((img, index) => (
            <div key={index} className="carousel-item w-full relative">
              <img
                src={resolveMediaUrl(img)}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = notAvailableImage;
                }}
              />
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-10">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                    {property.title}
                  </h1>
                  <p className="text-2xl md:text-4xl font-extrabold text-primary">
                    {property.price?.toLocaleString()} EGP
                    <span className="text-lg md:text-2xl font-normal text-white/90"> / month</span>
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="carousel-item w-full">
            <img
              src={notAvailableImage}
              alt="Image not available"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6">
          <button className="btn btn-outline gap-2" onClick={() => navigate('/')}
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">

          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`badge ${property.status === 'Available' ? 'badge-success' : 'badge-warning'} badge-lg text-lg`}>
                  {property.status || 'Available'}
                </span>
                {property.propertyType && (
                  <span className="badge badge-outline badge-lg text-lg">
                    {property.propertyType}
                  </span>
                )}
              </div>
              <p className="text-lg text-base-content/70 flex items-center gap-2">
                <FiMapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                {property.location}
              </p>
            </div>

            <div className="stats stats-horizontal md:stats-vertical shadow bg-base-100 w-full">
              <div className="stat">
                <div className="stat-title">Area</div>
                <div className="stat-value text-3xl md:text-4xl">{property.areaSqFt || property.area} m²</div>
              </div>
              <div className="stat">
                <div className="stat-title">Bedrooms</div>
                <div className="stat-value text-3xl md:text-4xl">{property.bedrooms}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Bathrooms</div>
                <div className="stat-value text-3xl md:text-4xl">{property.bathrooms}</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
                <FiFileText className="h-6 w-6 text-primary" aria-hidden="true" />
                Property Description
              </h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-base-content/90">
                {property.description || 'No description available for this property.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
                <FiStar className="h-6 w-6 text-primary" aria-hidden="true" />
                Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {property.hasParking && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiTruck className="h-4 w-4" aria-hidden="true" />
                    Parking
                  </div>
                )}
                {property.hasElevator && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiArrowUp className="h-4 w-4" aria-hidden="true" />
                    Elevator
                  </div>
                )}
                {property.isFurnished && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiHome className="h-4 w-4" aria-hidden="true" />
                    Furnished
                  </div>
                )}

                {property.amenities?.map((item, idx) => (
                  <div key={idx} className="badge badge-outline text-base px-5 py-3">{item}</div>
                ))}

                {!property.hasParking && !property.hasElevator && !property.isFurnished && !property.amenities?.length && (
                  <p className="text-base-content/60">No amenities listed</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
                <FiStar className="h-6 w-6 text-primary" aria-hidden="true" />
                Reviews
              </h2>

              {reviewsLoading ? (
                <div className="text-base-content/60">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-base-content/60">No reviews yet.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-base-200 bg-base-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{review.tenantName}</div>
                        <div className="text-sm text-base-content/60">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-primary">Rating: {review.rating}/5</div>
                      {review.comment && (
                        <p className="mt-2 text-base-content/80">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reviewErrors.length > 0 && (
                <div className="mt-4">
                  <div className="alert alert-warning">
                    <span>{reviewErrors[0]}</span>
                  </div>
                </div>
              )}

              {canReview && (
                <div className="mt-6 rounded-2xl border border-base-200 bg-base-100 p-6">
                  <h3 className="text-lg font-semibold mb-3">Leave a review</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="form-control md:col-span-1">
                      <span className="label-text">Rating</span>
                      <select
                        className="select select-bordered w-full"
                        value={reviewRating}
                        onChange={(event) => setReviewRating(event.target.value)}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Bad</option>
                      </select>
                    </label>
                    <label className="form-control md:col-span-2">
                      <span className="label-text">Comment</span>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        rows="3"
                        placeholder="Share your experience"
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    className="btn btn-primary mt-4"
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-2xl sticky top-6">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2 flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-primary" aria-hidden="true" />
                  Landlord Information
                </h2>

                {property.landlord ? (
                  <>
                    <p className="text-xl font-medium">{property.landlord.name || property.landlord}</p>
                    {property.landlord.phone && (
                      <p className="text-base text-base-content/70 flex items-center gap-2">
                        <FiPhone className="h-4 w-4" aria-hidden="true" />
                        {property.landlord.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base-content/70">Landlord information not available</p>
                )}

                {hasUserSession() ? (
                  <>
                    <div className="card-actions flex flex-col gap-3 mt-6">
                      <label className="text-sm font-medium text-base-content/70">
                        Choose a visit time
                      </label>
                      <input
                        type="datetime-local"
                        className="input input-bordered w-full"
                        value={visitDate}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(event) => setVisitDate(event.target.value)}
                        disabled={hasVisitRequest || userMetaLoading}
                      />
                      <button
                        className="btn btn-primary btn-lg w-full"
                        onClick={handleScheduleVisit}
                        disabled={hasVisitRequest || userMetaLoading}
                      >
                        {hasVisitRequest ? (
                          <>
                            <FiClock className="h-5 w-5" aria-hidden="true" />
                            Pending Visit Request
                          </>
                        ) : (
                          <>
                            <FiCalendar className="h-5 w-5" aria-hidden="true" />
                            Schedule Visit
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline btn-lg w-full"
                        onClick={handleFavoriteToggle}
                        disabled={userMetaLoading}
                      >
                        {isFavorite ? (
                          <>
                            <FiX className="h-5 w-5" aria-hidden="true" />
                            Remove from Favorites
                          </>
                        ) : (
                          <>
                            <FiHeart className="h-5 w-5" aria-hidden="true" />
                            Add to Favorites
                          </>
                        )}
                      </button>
                    </div>

                    {}
                    <div className="divider">Apply for Rental</div>
                    {hasPendingApplication ? (
                      <div className="alert alert-info">
                        <FiClock className="h-5 w-5" aria-hidden="true" />
                        <span>You have a pending application for this property.</span>
                      </div>
                    ) : hasAcceptedApplication ? (
                      <div className="alert alert-success">
                        <FiCheckCircle className="h-5 w-5" aria-hidden="true" />
                        <span>Your application for this property was accepted!</span>
                      </div>
                    ) : property.rentalStatus === 'Rented' || property.status === 'Rented' ? (
                      <div className="alert alert-warning">
                        <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
                        <span>This property is currently rented.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="label text-sm font-medium">Rental Start Date</label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={appStartDate}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setAppStartDate(e.target.value)}
                            disabled={appSubmitting || userMetaLoading}
                          />
                        </div>
                        <div>
                          <label className="label text-sm font-medium">Rental End Date</label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={appEndDate}
                            min={appStartDate || new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setAppEndDate(e.target.value)}
                            disabled={appSubmitting || userMetaLoading}
                          />
                        </div>
                        <div>
                          <label className="label text-sm font-medium">Message (optional)</label>
                          <textarea
                            className="textarea textarea-bordered w-full"
                            rows="2"
                            placeholder="Why are you interested in this property?"
                            value={appMessage}
                            onChange={(e) => setAppMessage(e.target.value)}
                            disabled={appSubmitting || userMetaLoading}
                          />
                        </div>
                        <div>
                          <label className="label text-sm font-medium">Documents (PDF, JPG, PNG, DOC)</label>
                          <input
                            type="file"
                            className="file-input file-input-bordered w-full"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setAppFiles(e.target.files)}
                            disabled={appSubmitting || userMetaLoading}
                          />
                          {appFiles.length > 0 && (
                            <p className="text-xs text-base-content/60 mt-1">
                              {appFiles.length} file{appFiles.length > 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                        <button
                          className="btn btn-secondary btn-lg w-full"
                          onClick={handleSubmitApplication}
                          disabled={appSubmitting || userMetaLoading}
                        >
                          {appSubmitting ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FiFileText className="h-5 w-5" aria-hidden="true" />
                              Apply for Rental
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-6 space-y-3">
                    <div className="alert alert-info">
                      <FiUser className="h-5 w-5" aria-hidden="true" />
                      <span>Sign in to schedule visits, apply for rental, and add to favorites.</span>
                    </div>
                    <a href="/login" className="btn btn-primary btn-lg w-full">
                      Sign in to Interact
                    </a>
                    <a href="/register" className="btn btn-outline btn-lg w-full">
                      Create an Account
                    </a>
                  </div>
                )}

                <div className="divider"></div>
                <div className="text-sm text-base-content/70 space-y-2">
                  {property.postedAt && (
                    <p className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" aria-hidden="true" />
                      Posted: {property.postedAt}
                    </p>
                  )}
                  {property.views && (
                    <p className="flex items-center gap-2">
                      <FiEye className="h-4 w-4" aria-hidden="true" />
                      Views: {property.views}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyView;