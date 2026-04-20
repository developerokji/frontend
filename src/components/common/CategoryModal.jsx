import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';

const categoryValidationSchema = yup.object().shape({
  categoryName: yup.string().required('Category name is required'),
  status: yup.string().required('Status is required')
});

const CategoryModal = ({ show, handleClose, handleSave, editMode = false, categoryData = null, setSelectedFile, selectedFile }) => {
  const [fileError, setFileError] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(categoryValidationSchema),
    defaultValues: {
      categoryName: '',
      status: 'active'
    }
  });

  // Reset form when modal opens or categoryData changes
  useEffect(() => {
    if (show) {
      if (editMode && categoryData) {
        reset({
          categoryName: categoryData.name || '',
          status: categoryData.status || 'active'
        });
      } else {
        reset({
          categoryName: '',
          status: 'active'
        });
      }
      setSelectedFile(null);
      setFileError('');
    }
  }, [show, editMode, categoryData, reset, setSelectedFile]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation
      if (!editMode && !selectedFile) {
        // Create mode - image is required
        setFileError('Category image is required');
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold">
              {editMode ? 'Edit Category' : 'Add Category'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              <CustomInput
                label="Category Name"
                type="text"
                id="categoryName"
                name="categoryName"
                placeholder="Enter category name"
                register={register}
                error={errors.categoryName?.message}
                required
                icon="bi-tags"
              />

              <div className="mb-4">
                <label htmlFor="categoryImage" className="form-label fw-medium">
                  <i className="bi bi-image me-2"></i>
                  Category Image {!editMode && <span className="text-danger">*</span>}
                </label>
                
                {/* Show existing image in edit mode */}
                {editMode && categoryData?.image_path && !selectedFile && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <img
                        src={categoryData.image_path}
                        alt="Current category image"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #dee2e6'
                        }}
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
                        alt="New category image"
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
                  id="categoryImage" 
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
                  Supported formats: JPG, PNG, GIF (Max size: 5MB)
                  {editMode && " - Upload new image to replace existing one"}
                </small>
              </div>

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
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                required
              />
            </div>
            <div className="modal-footer border-top">
              <CustomButton variant="secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </CustomButton>
              <CustomButton variant="primary" type="submit" loading={isSubmitting}>
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Category' : 'Submit'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
