import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { serviceValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import RichTextEditor from './RichTextEditor';
import { categoriesAPI, subCategoriesAPI } from '../../services/api';
import './ServiceStyles.css';

const ServiceModal = ({ show, handleClose, handleSave, editMode = false, serviceData = null, setSelectedFile, selectedFile }) => {
  const [fileError, setFileError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(serviceValidationSchema),
    defaultValues: {
      service_name: '',
      price: '',
      sale_price: '',
      category_id: '',
      sub_category_id: '',
      status: 'on',
      service_details: '',
      service_included: '',
      service_excluded: ''
    }
  });

  const selectedCategory = watch('category_id');

  // Reset form when modal opens or serviceData changes
  useEffect(() => {
    if (editMode && serviceData) {
      reset({
        service_name: serviceData.service_name || '',
        price: serviceData.price || '',
        sale_price: serviceData.sale_price || '',
        category_id: serviceData.category_id || '',
        sub_category_id: serviceData.sub_category_id || '',
        status: serviceData.status,
        service_details: serviceData.service_description || '',
        service_included: serviceData.service_included || '',
        service_excluded: serviceData.service_excluded || ''
      });
    } else {
      reset({
        service_name: '',
        price: '',
        sale_price: '',
        category_id: '',
        sub_category_id: '',
        status: 'on',
        service_details: '',
        service_included: '',
        service_excluded: ''
      });
    }
    setSelectedFile(null);
    setFileError('');
  }, [show, editMode, serviceData, reset, setSelectedFile]);

  // Load categories when modal opens
  useEffect(() => {
    const loadCategories = async () => {
      if (show) {
        setCategoriesLoading(true);
        try {
          const response = await categoriesAPI.getAll(1, 30, '');
          if (response.items) {
            setCategories(response.items);
          } else if (response.data) {
            setCategories(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
          setCategories([]);
        } finally {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();
  }, [show]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (selectedCategory && selectedCategory !== '') {
        setSubCategoriesLoading(true);
        try {
          const response = await subCategoriesAPI.getByCategory(selectedCategory);
          if (response && response.items) {
            setSubCategories(response.items);
          } else {
            setSubCategories([]);
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setSubCategories([]);
        } finally {
          setSubCategoriesLoading(false);
        }
      } else {
        setSubCategories([]);
        setValue('sub_category_id', '');
      }
    };

    loadSubCategories();
  }, [selectedCategory, setValue]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation
      if (!editMode && !selectedFile) {
        // Create mode - image is required
        setFileError('Service image is required');
        return;
      }
      
      // Check file type only if new file is selected
      if (selectedFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(selectedFile.type)) {
          setFileError('Please upload a valid image file (JPG, PNG, GIF)');
          return;
        }
      }
      
      const dataWithFile = {
        ...data,
        image: selectedFile // Will be File object if new file, undefined if no new file
      };
      
      await handleSave(dataWithFile);
      reset();
      setFileError('');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file);
    setFileError(''); // Clear error when file changes
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header border-bottom bg-light">
            <h5 className="modal-title fw-semibold text-primary">
              <i className="bi bi-gear me-2"></i>
              {editMode ? 'Edit Service' : 'Add New Service'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              {/* First Row: Service Name and Price */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Service Name"
                    type="text"
                    id="service_name"
                    name="service_name"
                    placeholder="Enter service name"
                    register={register}
                    error={errors.service_name?.message}
                    required
                    icon="bi-gear"
                  />
                </div>
                <div className="col-md-3">
                  <CustomInput
                    label="Price"
                    type="number"
                    id="price"
                    name="price"
                    placeholder="0.00"
                    register={register}
                    error={errors.price?.message}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-md-3">
                  <CustomInput
                    label="Sale Price"
                    type="number"
                    id="sale_price"
                    name="sale_price"
                    placeholder="0.00"
                    register={register}
                    error={errors.sale_price?.message}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Second Row: Category and Sub Category */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Category"
                    type="select"
                    id="category_id"
                    name="category_id"
                    placeholder={categoriesLoading ? "Loading..." : "Select Category"}
                    register={register}
                    error={errors.category_id?.message}
                    required
                    icon="bi-tags"
                    disabled={categoriesLoading}
                    options={[
                      { value: '', label: 'Select Category' },
                      ...categories.map(cat => ({
                        value: cat.id?.toString() || cat.value,
                        label: cat.name || cat.label || `Category ${cat.id || cat.value}`
                      }))
                    ]}
                  />
                </div>
                <div className="col-md-6">
                  <CustomInput
                    label="Sub Category"
                    type="select"
                    id="sub_category_id"
                    name="sub_category_id"
                    placeholder={subCategoriesLoading ? "Loading..." : "Select Sub Category"}
                    register={register}
                    error={errors.sub_category_id?.message}
                    required
                    icon="bi-layers"
                    disabled={!selectedCategory || subCategoriesLoading}
                    options={[
                      { value: '', label: 'Select Sub Category' },
                      ...subCategories.map(sub => ({
                        value: sub.id?.toString() || sub.value,
                        label: sub.name || sub.label || `Sub Category ${sub.id || sub.value}`
                      }))
                    ]}
                  />
                </div>
              </div>

              {/* Third Row: Status and Image */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Status"
                    type="select"
                    id="status"
                    name="status"
                    placeholder="Select Status"
                    register={register}
                    error={errors.status?.message}
                    icon="bi-list-check"
                    options={[
                      { value: 'on', label: 'Active' },
                      { value: 'off', label: 'Inactive' }
                    ]}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="serviceImage" className="form-label fw-medium">
                    <i className="bi bi-image me-2 text-primary"></i>
                    Service Image {!editMode && <span className="text-danger">*</span>}
                  </label>
                  <div className={`service-image-upload ${selectedFile || (editMode && serviceData?.service_image_path) ? 'has-image' : ''} ${fileError ? 'border-danger' : ''}`}>
                    <input 
                      type="file" 
                      id="serviceImage" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required={!editMode}
                      style={{ display: 'none' }}
                    />
                    
                    {selectedFile ? (
                      <div className="image-preview">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Service preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                        <div className="image-info">
                          <small className="text-muted">
                            {selectedFile.name} - {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </small>
                          <div className="mt-2">
                            <label htmlFor="serviceImage" className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil me-1"></i>
                              Change Image
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : editMode && serviceData?.service_image_path ? (
                      <div className="image-preview">
                        <img
                          src={serviceData.service_image_path}
                          alt="Current service image"
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                        <div className="image-info">
                          <small className="text-muted">
                            <i className="bi bi-image me-1"></i>
                            Current image
                          </small>
                          <div className="mt-2">
                            <label htmlFor="serviceImage" className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil me-1"></i>
                              Change Image
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder text-center p-4">
                        <i className="bi bi-cloud-upload display-4 text-muted mb-2"></i>
                        <p className="mb-1">Click to upload or drag and drop</p>
                        <small className="text-muted">JPG, PNG, GIF (Max: 5MB)</small>
                        <div className="mt-2">
                          <label htmlFor="serviceImage" className="btn btn-sm btn-primary">
                            <i className="bi bi-plus-circle me-1"></i>
                            Choose Image
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <div className="invalid-feedback d-block mt-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {fileError}
                    </div>
                  )}
                  {editMode && (
                    <small className="text-muted d-block mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Leave empty to keep existing image
                    </small>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-4">
                <RichTextEditor
                  value={watch('service_details')}
                  onChange={(value) => setValue('service_details', value)}
                  placeholder="Enter detailed description of your service..."
                  label="Service Details"
                  required
                  error={errors.service_details?.message}
                  icon="bi-text-paragraph"
                  height="150px"
                />
              </div>

              {/* Service Included */}
              <div className="mb-4">
                <RichTextEditor
                  value={watch('service_included')}
                  onChange={(value) => setValue('service_included', value)}
                  placeholder="List what's included in this service..."
                  label="Service Included"
                  required
                  error={errors.service_included?.message}
                  icon="bi-check-circle text-success"
                  height="120px"
                />
              </div>

              {/* Service Excluded */}
              <div className="mb-4">
                <RichTextEditor
                  value={watch('service_excluded')}
                  onChange={(value) => setValue('service_excluded', value)}
                  placeholder="List what's excluded from this service..."
                  label="Service Excluded"
                  required
                  error={errors.service_excluded?.message}
                  icon="bi-x-circle text-danger"
                  height="120px"
                />
              </div>
            </div>
            <div className="modal-footer border-top">
              <CustomButton variant="secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </CustomButton>
              <CustomButton variant="primary" type="submit" loading={isSubmitting}>
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Service' : 'Submit'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
