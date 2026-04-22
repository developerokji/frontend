import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { storyValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { useState } from 'react';
const StoryModal = ({ show, handleClose, handleSave, editMode = false, storyData = null,setSelectedFile, selectedFile,editData }) => {
  const [fileError, setFileError] = useState('');
  
  console.log('StoryModal received storyData:', storyData);
  console.log('StoryModal editMode:', editMode);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(storyValidationSchema),
    defaultValues: {
      status: 'on'
    }
  });

  // Reset form when modal opens or storyData changes
  React.useEffect(() => {
    if (show) {
      if (editMode && editData) {
        reset({
          status: editData.status || 'on'
        });
      } else {
        reset({
          status: 'on'
        });
      }
      setSelectedFile(null);
      setFileError('');
    }
  }, [show, editMode, editData, reset]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation - only require image for new stories
      if (!editMode && !selectedFile) {
        setFileError('Story image is required');
        return;
      }
      
      // Check file type only if a new file is selected
      if (selectedFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(selectedFile.type)) {
          setFileError('Please upload a valid image file (JPG, PNG, GIF)');
          return;
        }
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
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold">
              {editMode ? 'Edit Story' : 'Add Story'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              <div className="mb-4">
                <label htmlFor="storyImage" className="form-label fw-medium">
                  <i className="bi bi-image me-2"></i>
                  Upload Story <span className="text-danger">*</span>
                </label>
                
                {/* Show existing image in edit mode */}
                {editMode && editData?.image_path && !selectedFile && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <img
                        src={editData.image_path}
                        alt="Current story image"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #dee2e6'
                        }}
                        onLoad={() => console.log('Story image loaded successfully:', editData.image_path)}
                        onError={() => console.log('Story image failed to load:', editData.image_path)}
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
                        alt="New story image"
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
                  id="storyImage" 
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
                  {editMode ? " - Optional: Upload new image to replace existing one" : " - Required for new stories"}
                </small>
              </div>
              
              {!editMode && (
                <input type="hidden" {...register('status')} value="on" />
              )}
              
              {editMode && (
                <CustomInput
                  label="Status"
                  type="select"
                  id="status"
                  name="status"
                  register={register}
                  error={errors.status?.message}
                  options={[
                    { value: 'on', label: 'Active' },
                    { value: 'off', label: 'Inactive' }
                  ]}
                  required
                />
              )}
            </div>
            <div className="modal-footer border-top">
              <CustomButton variant="secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </CustomButton>
              <CustomButton variant="primary" type="submit" loading={isSubmitting}>
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Story' : 'Save Story'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
