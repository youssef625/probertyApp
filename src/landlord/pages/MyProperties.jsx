import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { landlordService } from '../services/landlordService';
import { resolveMediaUrl } from '../../services/api';
import notAvailableImage from '../../assets/not-available.svg';
import ErrorBanner from '../../components/ErrorBanner';
import { getApiErrorMessages } from '../../utils/apiClient';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [actionErrors, setActionErrors] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState(null);
  
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: 'Apartment',
    areaSqFt: '',
    bedrooms: '',
    bathrooms: '',
    hasParking: false,
    hasElevator: false,
    isFurnished: false
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await landlordService.getMyProperties();
      setProperties(data || []);
      setErrorMessages([]);
    } catch (err) {
      console.error(err);
      setErrorMessages(getApiErrorMessages(err));
      
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    if (activeTab === 'rented') {
      const status = (property.rentalStatus || property.status || '').toString().toLowerCase();
      return status === 'rented';
    }
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentPropertyId(null);
    setFormErrors([]);
    setImageFiles([]);
    setFormData({
      title: '', description: '', price: '', location: '', propertyType: 'Apartment',
      areaSqFt: '', bedrooms: '', bathrooms: '',
      hasParking: false, hasElevator: false, isFurnished: false
    });
    setShowModal(true);
  };

  const openEditModal = (property) => {
    setIsEditing(true);
    setCurrentPropertyId(property.id);
    setFormErrors([]);
    setImageFiles([]);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      location: property.location || '',
      propertyType: property.propertyType || 'Apartment',
      areaSqFt: property.areaSqFt || property.area || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      hasParking: property.hasParking || false,
      hasElevator: property.hasElevator || false,
      isFurnished: property.isFurnished || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    
    const errors = [];
    const title = (formData.title || '').trim();
    const location = (formData.location || '').trim();
    const description = (formData.description || '').trim();
    const price = Number(formData.price);
    const bedrooms = Number(formData.bedrooms);
    const bathrooms = Number(formData.bathrooms);
    const area = Number(formData.areaSqFt);

    if (!title || title.length === 0) errors.push('Title is required.');
    if (title.length > 200) errors.push('Title must not exceed 200 characters.');

    if (!location || location.length === 0) errors.push('Location is required.');
    if (location.length > 300) errors.push('Location must not exceed 300 characters.');

    if (description.length > 2000) errors.push('Description must not exceed 2000 characters.');

    if (!price || price < 1) errors.push('Price must be at least 1 EGP.');
    if (price > 1_000_000_000) errors.push('Price must not exceed 1,000,000,000 EGP.');

    if (isNaN(bedrooms) || bedrooms < 0) errors.push('Bedrooms cannot be negative.');
    if (bedrooms > 100) errors.push('Bedrooms must not exceed 100.');

    if (isNaN(bathrooms) || bathrooms < 0) errors.push('Bathrooms cannot be negative.');
    if (bathrooms > 100) errors.push('Bathrooms must not exceed 100.');

    if (!area || area < 1) errors.push('Area must be at least 1 m².');
    if (area > 100_000) errors.push('Area must not exceed 100,000 m².');

    if (!formData.propertyType) errors.push('Property type is required.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let propertyId = currentPropertyId;
      if (isEditing) {
        await landlordService.updateProperty(currentPropertyId, formData);
      } else {
        const created = await landlordService.createProperty(formData);
        propertyId = created?.id || created?.propertyId || propertyId;
      }

      if (imageFiles.length > 0) {
        if (!propertyId) {
          throw new Error('Property id missing for image upload.');
        }
        await landlordService.uploadPropertyImages(propertyId, imageFiles);
        setImageFiles([]);
      }
      setFormErrors([]);
      setActionErrors([]);
      setShowModal(false);
      fetchProperties();
    } catch (err) {
      console.error(err);
      setFormErrors(getApiErrorMessages(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await landlordService.deleteProperty(id);
        setActionErrors([]);
        fetchProperties();
      } catch (err) {
        setActionErrors(getApiErrorMessages(err));
      }
    }
  };

  if (loading) return <div className="p-8">Loading properties...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Properties</h1>
          <p className="text-slate-500 mt-1">Manage your property listings</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} className="mr-2" /> Add Property
        </button>
      </div>

      <ErrorBanner messages={errorMessages} className="mb-4" />
      <ErrorBanner messages={actionErrors} className="mb-6" />

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All (Status)
        </button>
        <button
          className={`tab-btn ${activeTab === 'rented' ? 'active' : ''}`}
          onClick={() => setActiveTab('rented')}
        >
          Currently Rented
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th>Property</th>
                <th>Price</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    {activeTab === 'rented'
                      ? 'No properties are rented right now.'
                      : "You haven't listed any properties yet."}
                  </td>
                </tr>
              ) : (
                filteredProperties.map(property => (
                  <tr key={property.id} className="hover:bg-slate-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={resolveMediaUrl(property.images?.[0] || property.imageUrls?.[0]) || notAvailableImage} alt="Property" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{property.title}</div>
                          <div className="text-sm opacity-50">{property.propertyType || 'Apartment'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{property.price?.toLocaleString()} EGP</td>
                    <td>{property.location}</td>
                    <td>
                      <div className={`badge ${property.rentalStatus === 'Available' ? 'badge-success' : 'badge-ghost'}`}>
                        {property.rentalStatus || property.status || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost text-blue-600" onClick={() => openEditModal(property)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-ghost text-red-600" onClick={() => handleDelete(property.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-2xl mb-6">{isEditing ? 'Edit Property' : 'Add New Property'}</h3>
            <ErrorBanner messages={formErrors} className="mb-4" />
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Title</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input input-bordered" maxLength={200} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Price (EGP/month)</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="input input-bordered" min="1" max="1000000000" step="0.01" required />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Location</span></label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="input input-bordered" maxLength={300} required />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Description</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="textarea textarea-bordered h-24" maxLength={2000} required></textarea>
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Images</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => setImageFiles(Array.from(event.target.files || []))}
                    className="file-input file-input-bordered w-full"
                  />
                  <span className="text-xs text-slate-500 mt-1">
                    {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Optional. Add after saving if you prefer.'}
                  </span>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Property Type</span></label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="select select-bordered" required>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Studio">Studio</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Area (m²)</span></label>
                  <input type="number" name="areaSqFt" value={formData.areaSqFt} onChange={handleInputChange} className="input input-bordered" min="1" max="100000" step="0.1" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Bedrooms</span></label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="input input-bordered" min="0" max="100" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Bathrooms</span></label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className="input input-bordered" min="0" max="100" required />
                </div>
              </div>
              
              {}
              <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <h4 className="font-medium mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-6">
                  <label className="cursor-pointer label flex gap-2 justify-start">
                    <input type="checkbox" name="hasParking" checked={formData.hasParking} onChange={handleInputChange} className="checkbox checkbox-primary checkbox-sm" />
                    <span className="label-text">Parking</span>
                  </label>
                  <label className="cursor-pointer label flex gap-2 justify-start">
                    <input type="checkbox" name="hasElevator" checked={formData.hasElevator} onChange={handleInputChange} className="checkbox checkbox-primary checkbox-sm" />
                    <span className="label-text">Elevator</span>
                  </label>
                  <label className="cursor-pointer label flex gap-2 justify-start">
                    <input type="checkbox" name="isFurnished" checked={formData.isFurnished} onChange={handleInputChange} className="checkbox checkbox-primary checkbox-sm" />
                    <span className="label-text">Furnished</span>
                  </label>
                </div>
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Property')}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;
