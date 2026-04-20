import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { localityValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { useStates, useCities } from '../../hooks/useApi';

const LocalityModal = ({ show, handleClose, handleSave, editMode = false, localityData = null }) => {
  const [selectedStateId, setSelectedStateId] = useState('');
  const [citiesDropdownOpen, setCitiesDropdownOpen] = useState(false);
  
  // Fetch states
  const { data: states, loading: statesLoading, error: statesError } = useStates();
  
  // Fetch cities only when state is selected
  const { data: cities, loading: citiesLoading, error: citiesError } = useCities(
    selectedStateId
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(localityValidationSchema),
    defaultValues: {
      name: '',
      state: '',
      city: ''
    }
  });

  // Watch state value to handle changes
  const watchedState = watch('state');

  // Reset form when modal opens or localityData changes
  useEffect(() => {
    if (show) {
      if (editMode && localityData) {
        console.log('Editing locality data:', localityData); // Debug log
        reset({
          name: localityData.localityName || localityData.name || '',
          state: localityData.state_id || '',
          city: localityData.city_id || ''
        });
        // Set selected state ID for edit mode - this will trigger cities API call
        if (localityData.state_id) {
          setSelectedStateId(localityData.state_id.toString());
        }
      } else {
        reset({
          name: '',
          state: '',
          city: ''
        });
        setSelectedStateId('');
      }
    }
  }, [show, editMode, localityData, reset]);

  // Set city value when cities are loaded in edit mode
  useEffect(() => {
    if (editMode && localityData && cities && cities.length > 0 && localityData.city_id) {
      setValue('city', localityData.city_id.toString());
    }
  }, [editMode, localityData, cities, setValue]);

  // Handle state change
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    const state = states.find(s => s.id.toString() === stateId);
    if (state) {
      setSelectedStateId(state.id.toString());
      setValue('city', ''); // Reset city when state changes
      setCitiesDropdownOpen(false); // Close cities dropdown
    } else {
      setSelectedStateId('');
      setCitiesDropdownOpen(false);
    }
  };

  // Handle cities dropdown focus
  const handleCitiesDropdownFocus = () => {
    if (selectedStateId && !citiesDropdownOpen) {
      setCitiesDropdownOpen(true);
    }
  };

  // Handle cities dropdown blur
  const handleCitiesDropdownBlur = () => {
    // Delay closing to allow option selection
    setTimeout(() => setCitiesDropdownOpen(false), 200);
  };

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
                    type="select"
                    id="state"
                    name="state"
                    register={register}
                    error={errors.state?.message}
                    required
                    icon="bi-map"
                    onChange={handleStateChange}
                    options={[
                      { value: '', label: 'Select State...' },
                      ...(states || []).map(state => ({
                        value: state.id,
                        label: state.name
                      }))
                    ]}
                    disabled={statesLoading}
                  />
                  {statesError && (
                    <div className="text-danger small mt-1">
                      {statesError}
                    </div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <CustomInput
                    label="City"
                    type="select"
                    id="city"
                    name="city"
                    register={register}
                    error={errors.city?.message}
                    required
                    icon="bi-building"
                    onFocus={handleCitiesDropdownFocus}
                    onBlur={handleCitiesDropdownBlur}
                    options={[
                      { value: '', label: 'Select City...' },
                      ...(cities || []).map(city => ({
                        value: city.id,
                        label: city.city
                      }))
                    ]}
                    disabled={!selectedStateId || citiesLoading}
                  />
                  {citiesError && (
                    <div className="text-danger small mt-1">
                      {citiesError}
                    </div>
                  )}
                  {selectedStateId && !citiesLoading && (!cities || cities.length === 0) && (
                    <div className="text-muted small mt-1">
                      No cities found for this state
                    </div>
                  )}
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
