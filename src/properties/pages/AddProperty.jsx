import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Info, MapPin, Image as ImageIcon, UploadCloud, Link as LinkIcon, X } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import '../properties.css';

const AddProperty = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  
  // Media State
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);

    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim() || !streetAddress.trim() || !city.trim()) {
      setError('Please fill in all required fields (Title, Price, Street Address, City).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create Property
      const propertyData = {
        title,
        price: Number(price.replace(/,/g, '')),
        description,
        location: `${streetAddress}, ${city}`
      };

      const newProp = await propertyService.createProperty(propertyData);

      // 2. Upload Images if any exist
      if (files.length > 0 && newProp && (newProp.id || newProp.propertyId)) {
        const idToUse = newProp.id || newProp.propertyId;
        const formData = new FormData();
        files.forEach(file => {
          formData.append('file', file);
          formData.append('files', file);
        });
        
        try {
          await propertyService.uploadImages(idToUse, formData);
        } catch (imgError) {
          alert('Property created but Image upload failed: ' + imgError.message);
        }
      }

      // Invalidate cache and redirect
      queryClient.invalidateQueries(['myProperties']);
      navigate('/properties');

    } catch (err) {
      setError(err.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Add New Property</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="add-property-container">
        
        {/* Left Column: Form Info */}
        <div className="add-property-col-main">
          
          {/* Basic Info Card */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-icon-circle"><Info size={18} /></div>
              <h3 className="form-card-title">Basic Info</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Modern Minimalist Penthouse"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="2,500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                placeholder="Detailed property description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Location Card */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-icon-circle"><MapPin size={18} /></div>
              <h3 className="form-card-title">Location</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="123 Luxury Lane"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Media and Actions */}
        <div className="add-property-col-side">
          
          {/* Media Card */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-icon-circle"><ImageIcon size={18} /></div>
              <h3 className="form-card-title">Media</h3>
            </div>

            <div className="media-upload-zone" onClick={handleFileClick}>
              <UploadCloud size={32} className="media-icon" />
              <div>
                <p className="media-upload-text">Drop images here</p>
                <p className="media-upload-sub">PNG, JPG up to 10MB</p>
              </div>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/jpg" 
              className="hidden-file-input" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {previews.length > 0 && (
              <div className="media-preview-grid">
                {previews.map((src, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={src} alt="preview" className="media-preview-item" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finalize Listing Card */}
          <div className="finalize-card">
            <h3 className="finalize-title">Finalize Listing</h3>
            <p className="finalize-text">
              Ensure all details are accurate. Once added, the property will be processed and published via the API.
            </p>
            
            <button 
              className="btn-save-listing" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Property'}
            </button>
            <button 
              className="btn-cancel-listing"
              onClick={() => navigate('/properties')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

          {/* API Sync Info */}
          <div className="api-sync-card">
            <LinkIcon size={16} className="api-sync-icon" />
            <div className="api-sync-content">
              <h4 className="api-sync-title">API Sync</h4>
              <p className="api-sync-text">
                This form directly maps to the Properties API schema. All fields are required for a successful listing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddProperty;
