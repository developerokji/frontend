import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { bannerValidationSchema } from '../../utils/validation';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const BannerModal = ({ show, handleClose, handleSave, editMode = false, bannerData = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(bannerValidationSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Active'
    }
  });

  // Reset form when modal opens or bannerData changes
  useEffect(() => {
    if (show) {
      if (editMode && bannerData) {
        reset({
          title: bannerData.title || '',
          description: bannerData.description || '',
          status: bannerData.status || 'Active'
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'Active'
        });
      }
    }
  }, [show, editMode, bannerData, reset]);

  const onSubmit = async (data) => {
    try {
      await handleSave(data);
      reset();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold">
              {editMode ? 'Edit Banner' : 'Add Banner'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              <CustomInput
                label="Title"
                type="text"
                id="title"
                name="title"
                placeholder="Enter banner title..."
                register={register}
                error={errors.title?.message}
                required
                icon="bi-type"
              />

              <CustomInput
                label="Description"
                type="textarea"
                id="description"
                name="description"
                placeholder="Enter banner description..."
                rows="3"
                register={register}
                error={errors.description?.message}
                helperText="Provide a brief description for the banner"
                required
                icon="bi-text-paragraph"
              />

              <CustomInput
                label="Status"
                type="select"
                id="status"
                name="status"
                register={register}
                error={errors.status?.message}
                icon="bi-list-check"
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                required
              />
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Banner' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
