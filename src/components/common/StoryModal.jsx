import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { storyValidationSchema } from '../../utils/validation';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import { useState } from 'react';
const StoryModal = ({ show, handleClose, handleSave, editMode = false, storyData = null,setSelectedFile, selectedFile }) => {
  const [fileError, setFileError] = useState('');
  
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
      if (editMode && storyData) {
        reset({
          status: storyData.status || 'on'
        });
      } else {
        reset({
          status: 'on'
        });
      }
      setSelectedFile(null);
      setFileError('');
    }
  }, [show, editMode, storyData, reset]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation
      if (!selectedFile) {
        setFileError('Story image is required');
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
                <input 
                  type="file" 
                  className={`form-control ${fileError ? 'is-invalid' : ''}`}
                  id="storyImage" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  required
                />
                {fileError && (
                  <div className="invalid-feedback d-block">
                    {fileError}
                  </div>
                )}
                <small className="text-muted d-block mt-2">
                  Supported formats: JPG, PNG, GIF (Max size: 5MB)
                </small>
              </div>
              

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
