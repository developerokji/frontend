import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { localityValidationSchema } from '../../utils/validation';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const LocalityModal = ({ show, handleClose, handleSave, editMode = false, localityData = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(localityValidationSchema),
    defaultValues: {
      name: '',
      state: '',
      city: ''
    }
  });

  // Reset form when modal opens or localityData changes
  useEffect(() => {
    if (show) {
      if (editMode && localityData) {
        reset({
          name: localityData.name || '',
          state: localityData.state || '',
          city: localityData.city || ''
        });
      } else {
        reset({
          name: '',
          state: '',
          city: ''
        });
      }
    }
  }, [show, editMode, localityData, reset]);

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
              {editMode ? 'Edit Locality' : 'Add Locality'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              <CustomInput
                label="Locality"
                type="text"
                id="name"
                name="name"
                placeholder="Enter locality..."
                register={register}
                error={errors.name?.message}
                required
                icon="bi-geo-alt"
              />

              <div className="row">
                <div className="col-md-6">
                  <CustomInput
                    label="State"
                    type="text"
                    id="state"
                    name="state"
                    placeholder="Enter state..."
                    register={register}
                    error={errors.state?.message}
                    required
                    icon="bi-map"
                  />
                </div>
                
                <div className="col-md-6">
                  <CustomInput
                    label="City"
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Enter city..."
                    register={register}
                    error={errors.city?.message}
                    required
                    icon="bi-building"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                <i className="bi bi-x-circle me-2"></i>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                {editMode ? 'Update Locality' : 'Save Locality'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocalityModal;
