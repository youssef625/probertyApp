import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, MapPin, Image as ImageIcon, UploadCloud, Link as LinkIcon, X } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import '../properties.css';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch initial data
  const { data: initialData, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id)
  });

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  
  // Media State
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate data when loaded
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPrice(initialData.price ? initialData.price.toString() : '');
      setDescription(initialData.description || '');
      
      if (initialData.location) {
        const parts = initialData.location.split(',');
        if (parts.length >= 2) {
          setStreetAddress(parts[0].trim());
          setCity(parts[1].trim());
        } else {
          setStreetAddress(initialData.location);
        }
      }

      if (initialData.imageUrls && initialData.imageUrls.length > 0 && initialData.imageUrls[0] !== 'string') {
        const validUrls = initialData.imageUrls.filter(url => url !== 'string');
        setExistingImages(validUrls);
      }
    }
  }, [initialData]);

  const removeExistingImage = async (index) => {
    const imageUrl = existingImages[index];
    // Optimistic UI update
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    
    try {
      await propertyService.deleteImage(id, imageUrl);
      // Invalidate cache behind the scenes
      queryClient.invalidateQueries(['property', id]);
      queryClient.invalidateQueries(['myProperties']);
    } catch (err) {
      alert('Failed to delete image from server: ' + err.message);
      // Revert on failure
      setExistingImages(prev => {
        const newArr = [...prev];
        newArr.splice(index, 0, imageUrl);
        return newArr;
      });
    }
  };

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
      // 1. Update Property
      const propertyData = {
        id: id,
        title,
        price: Number(price.replace(/,/g, '')),
        description,
        location: `${streetAddress}, ${city}`,
        imageUrls: existingImages // send the remaining old images to the API
      };

      await propertyService.updateProperty(id, propertyData);

      // 2. Upload Images if any new ones exist
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('file', file);
          formData.append('files', file);
        });
        
        try {
          await propertyService.uploadImages(id, formData);
        } catch (imgError) {
          alert('Property updated but Image upload failed: ' + imgError.message);
        }
      }

      // Invalidate cache and redirect
      queryClient.invalidateQueries(['myProperties']);
      queryClient.invalidateQueries(['property', id]);
      navigate('/properties');

    } catch (err) {
      setError(err.message || 'Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px' }}>Loading property details...</div>;
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Edit Property</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="add-property-container">
        {/* Left Column: Form Info */}
        <div className="add-property-col-main">
          
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input 
                type="text" 
                className="form-input" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

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
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Media and Actions */}
        <div className="add-property-col-side">
          
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-icon-circle"><ImageIcon size={18} /></div>
              <h3 className="form-card-title">Media</h3>
            </div>

            <div className="media-upload-zone" onClick={handleFileClick}>
              <UploadCloud size={32} className="media-icon" />
              <div>
                <p className="media-upload-text">Upload new images</p>
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

            {(previews.length > 0 || existingImages.length > 0) && (
              <div className="media-preview-grid">
                {/* Existing Images */}
                {existingImages.map((src, index) => {
                  const displaySrc = src.startsWith('http') ? src : `https://app-260407103838.azurewebsites.net${src}`;
                  return (
                    <div key={`exist-${index}`} style={{ position: 'relative' }}>
                      <img src={displaySrc} alt="existing" className="media-preview-item" style={{ opacity: 0.9 }} />
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeExistingImage(index); }}
                        style={{ position: 'absolute', top: 4, right: 4, background: '#e53e3e', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', zIndex: 10, display: 'flex' }}
                        title="Remove existing image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* New Previews */}
                {previews.map((src, index) => (
                  <div key={`new-${index}`} style={{ position: 'relative' }}>
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
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>Note: Uploading new images will add to existing ones.</p>
          </div>

          <div className="finalize-card">
            <h3 className="finalize-title">Update Listing</h3>
            <p className="finalize-text">
              Save the changes to instantly update your property details on the platform.
            </p>
            
            <button 
              className="btn-save-listing" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Property'}
            </button>
            <button 
              className="btn-cancel-listing"
              onClick={() => navigate('/properties')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditProperty;
