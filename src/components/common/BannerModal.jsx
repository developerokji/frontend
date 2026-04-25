import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { bannerValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { categoriesAPI, subCategoriesAPI, servicesAPI } from '../../services/api';

const BannerModal = ({ show, handleClose, handleSave, editMode = false, bannerData = null, setSelectedFile, selectedFile }) => {
  const [fileError, setFileError] = useState('');
  
  console.log('BannerModal received bannerData:', bannerData);
  console.log('BannerModal editMode:', editMode);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(bannerValidationSchema),
    defaultValues: {
      category_id: '',
      sub_category_id: '',
      service_id: '',
      banner_title: '',
      banner_desc: '',
      status: 'on'
    }
  });

  const selectedCategory = watch('category_id');
  const selectedSubCategory = watch('sub_category_id');

  // Reset form when modal opens or bannerData changes
  useEffect(() => {
    if (show) {
      if (editMode && bannerData) {
        console.log('BannerModal resetting with bannerData:', bannerData);
        // Reset form first
        reset({
          category_id: '',
          sub_category_id: '',
          service_id: '',
          banner_title: '',
          banner_desc: '',
          status: 'on'
        });
      } else {
        reset({
          category_id: '',
          sub_category_id: '',
          service_id: '',
          banner_title: '',
          banner_desc: '',
          status: 'on'
        });
      }
      setSelectedFile(null);
      setFileError('');
    }
  }, [show, editMode, bannerData, reset, setSelectedFile]);

  // Set form values after categories are loaded (for edit mode)
  useEffect(() => {
    if (show && editMode && bannerData && categories.length > 0) {
      console.log('Setting form values after categories loaded:', bannerData);
      
      // Set other form values immediately
      setValue('banner_title', bannerData.bannerTitle || bannerData.banner_title || '');
      setValue('banner_desc', bannerData.bannerDesc || bannerData.banner_desc || '');
      setValue('status', bannerData.status || 'on');
      
      // Set category value
      const categoryId = bannerData.categoryId || bannerData.category_id || '';
      console.log('Setting category value:', categoryId);
      setValue('category_id', categoryId);
      
      // If category exists, load and set subcategory
      if (categoryId) {
        const loadSubCategoriesAndSetValue = async () => {
          try {
            console.log('Loading subcategories for categoryId:', categoryId);
            const response = await subCategoriesAPI.getByCategory(categoryId);
            console.log('Subcategories response:', response);
            
            if (response && response.items) {
              setSubCategories(response.items);
              
              // Wait a tick for the dropdown to update before setting value
              setTimeout(() => {
                // Set subcategory value
                const subCategoryId = bannerData.subCategoryId || bannerData.sub_category_id || '';
                console.log('Setting subcategory value:', subCategoryId);
                setValue('sub_category_id', subCategoryId);
                
                // If subcategory exists, load and set service
                if (subCategoryId) {
                  const loadServices = async () => {
                    try {
                      console.log('Loading services for subCategoryId:', subCategoryId);
                      const serviceResponse = await servicesAPI.getBySubCategory(subCategoryId);
                      console.log('Services response:', serviceResponse);
                      
                      if (serviceResponse) {
                        setServices(serviceResponse);
                        
                        // Wait another tick for services dropdown to update
                        setTimeout(() => {
                          const serviceId = bannerData.serviceId || bannerData.service_id || '';
                          console.log('Setting service value:', serviceId);
                          setValue('service_id', serviceId);
                        }, 100);
                      } else {
                        console.log('No services response received');
                      }
                    } catch (error) {
                      console.error('Error loading services:', error);
                    }
                  };
                  
                  loadServices();
                } else {
                  console.log('No subCategoryId found in bannerData');
                }
              }, 100);
            } else {
              console.log('No subcategories found in response');
            }
          } catch (error) {
            console.error('Error loading dependent data:', error);
          }
        };
        
        loadSubCategoriesAndSetValue();
      } else {
        console.log('No categoryId found in bannerData');
      }
    }
  }, [show, editMode, bannerData, categories.length, setValue]);

  // Load categories when modal opens
  useEffect(() => {
    const loadCategories = async () => {
      if (show) {
        setCategoriesLoading(true);
        try {
          const response = await categoriesAPI.getAll(1, 30, ''); // page 1, limit 30, no search
          if (response.items) {
            setCategories(response.items);
          } else if (response.data) {
            // Handle different response format
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
          console.log(response)
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
        setValue('service_id', '');
      }
    };

    loadSubCategories();
  }, [selectedCategory, setValue]);

  // Load services when subcategory changes
  useEffect(() => {
    const loadServices = async () => {
      if (selectedSubCategory && selectedSubCategory !== '') {
        setServicesLoading(true);
        try {
          const response = await servicesAPI.getBySubCategory(selectedSubCategory);
          console.log(response)
          if (response) {
            setServices(response);
          } else {
            setServices([]);
          }
        } catch (error) {
          console.error('Failed to load services:', error);
          setServices([]);
        } finally {
          setServicesLoading(false);
        }
      } else {
        setServices([]);
        setValue('service_id', '');
      }
    };

    loadServices();
  }, [selectedSubCategory, setValue]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation
      if (!selectedFile) {
        setFileError('Banner image is required');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }
      
      const dataWithFile = {
        ...data,
        image: selectedFile
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom bg-light">
            <h5 className="modal-title fw-semibold text-primary">
              <i className="bi bi-image me-2"></i>
              {editMode ? 'Edit Banner' : 'Add Banner'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              {/* First Row: Category and Sub Category */}
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

              {/* Second Row: Service and Title */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Service"
                    type="select"
                    id="service_id"
                    name="service_id"
                    placeholder={servicesLoading ? "Loading..." : "Select Service"}
                    register={register}
                    error={errors.service_id?.message}
                    required
                    icon="bi-gear"
                    disabled={!selectedSubCategory || servicesLoading}
                    options={[
                      { value: '', label: 'Select Service' },
                      ...services.map(service => ({
                        value: service.id?.toString() || service.value,
                        label: service.service_name || service.name || service.label || `Service ${service.id || service.value}`
                      }))
                    ]}
                  />
                </div>
                <div className="col-md-6">
                  <CustomInput
                    label="Title"
                    type="text"
                    id="banner_title"
                    name="banner_title"
                    placeholder="Enter title"
                    register={register}
                    error={errors.banner_title?.message}
                    required
                    icon="bi-type"
                  />
                </div>
              </div>

              {/* Third Row: Description and Image */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Description"
                    type="textarea"
                    id="banner_desc"
                    name="banner_desc"
                    placeholder="Enter description"
                    rows="3"
                    register={register}
                    error={errors.banner_desc?.message}
                    required
                    icon="bi-text-paragraph"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="bannerImage" className="form-label fw-medium">
                    <i className="bi bi-image me-2 text-primary"></i>
                    Banner Image <span className="text-danger">*</span>
                  </label>
                  
                  {/* Show existing image in edit mode */}
                  {editMode && bannerData?.banner_img_path && !selectedFile && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                        <img
                          src={`${bannerData.banner_img_path}`}
                          alt="Current banner image"
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #dee2e6'
                          }}
                          onLoad={() => console.log('Banner image loaded successfully:', `${bannerData.banner_img_path}`)}
                          onError={() => console.log('Banner image failed to load:', `${bannerData.banner_img_path}`)}
                        />
                        <div>
                          <small className="text-muted d-block">Current image</small>
                          <small className="text-success d-block">
                            <i className="bi bi-check-circle me-1"></i>
                            Existing image will be kept if no new image is selected
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show new image preview if selected */}
                  {selectedFile && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="New banner image"
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #0d6efd'
                          }}
                        />
                        <div>
                          <small className="text-muted d-block">New image selected</small>
                          <small className="text-primary d-block">
                            <i className="bi bi-arrow-repeat me-1"></i>
                            This will replace the existing image
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    className={`form-control ${fileError ? 'is-invalid' : ''}`}
                    id="bannerImage" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    required={!editMode}
                  />
                  {fileError && (
                    <div className="invalid-feedback d-block">
                      {fileError}
                    </div>
                  )}
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Supported: JPG, PNG, GIF (Max: 5MB)
                    {editMode && " - Upload new image to replace existing one"}
                  </small>
                </div>
              </div>

              {/* Fourth Row: Status */}
              <div className="row g-3">
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
                  {/* Empty space for balance */}
                </div>
              </div>
            </div>
            <div className="modal-footer border-top">
              <CustomButton variant="secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </CustomButton>
              <CustomButton variant="primary" type="submit" loading={isSubmitting}>
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Banner' : 'Submit'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
