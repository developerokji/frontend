import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { clientValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';

const ClientModal = ({ show, handleClose, handleSave, editMode = false, clientData = null, setSelectedFile, selectedFile }) => {
  const [fileError, setFileError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(clientValidationSchema),
    defaultValues: {
      status: 'active'
    }
  });

  // Reset form when modal opens or clientData changes
  React.useEffect(() => {
    if (show) {
      if (editMode && clientData) {
        // Split name into first and last name for editing
        const nameParts = (clientData.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        reset({
          first_name: firstName,
          last_name: lastName,
          email: clientData.email || '',
          phone: clientData.phone || '',
          status: clientData.account_status || 'active'
        });
      } else {
        reset({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          status: 'active'
        });
      }
      setSelectedFile(null);
      setFileError('');
    }
  }, [show, editMode, clientData, reset, setSelectedFile]);

  const onSubmit = async (data) => {
    try {
      // Manual file validation
      if (!selectedFile && !editMode) {
        setFileError('Profile image is required');
        return;
      }
      
      // Check file type if file is selected
      if (selectedFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(selectedFile.type)) {
          setFileError('Please upload a valid image file (JPG, PNG, GIF)');
          return;
        }
      }
      
      // Combine first_name and last_name into name field
      const fullName = `${data.first_name} ${data.last_name}`.trim();
      
      const clientDataWithRole = {
        name: fullName,
        email: data.email,
        phone: data.phone,
        account_status: data.status,
        role: 'customer'
      };
      
      // Add image if selected
      if (selectedFile) {
        clientDataWithRole.profile_image = selectedFile;
      }
      
      await handleSave(clientDataWithRole);
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
              {editMode ? 'Edit Client' : 'New Client Information'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden"
                    style={{ 
                      width: '100px', 
                      height: '100px',
                      border: '2px solid #dee2e6'
                    }}
                  >
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Profile preview"
                        className="w-100 h-100 object-cover"
                      />
                    ) : clientData?.profile_image ? (
                      <img
                        src={clientData.profile_image}
                        alt="Profile"
                        className="w-100 h-100 object-cover"
                      />
                    ) : (
                      <i className="bi bi-person-fill text-muted" style={{ fontSize: '40px' }}></i>
                    )}
                  </div>
                  <label 
                    htmlFor="profileImage"
                    className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle mb-0 me-0"
                    style={{ width: '32px', height: '32px', padding: '0', cursor: 'pointer' }}
                  >
                    <i className="bi bi-pencil-fill"></i>
                    <input 
                      type="file" 
                      id="profileImage"
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                                {fileError && (
                  <div className="text-danger small mt-2">
                    {fileError}
                  </div>
                )}
                <small className="text-muted d-block mt-2">
                  Supported formats: JPG, PNG, GIF (Max size: 5MB)
                </small>
              </div>

              <div className="row">
                <div className="col-12 col-md-6">
                  <CustomInput
                    label="First Name"
                    type="text"
                    id="first_name"
                    name="first_name"
                    register={register}
                    error={errors.first_name?.message}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <CustomInput
                    label="Last Name"
                    type="text"
                    id="last_name"
                    name="last_name"
                    register={register}
                    error={errors.last_name?.message}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <CustomInput
                label="E-mail"
                type="email"
                id="email"
                name="email"
                register={register}
                error={errors.email?.message}
                placeholder="Enter email address"
                icon="bi-envelope"
                required
              />

              <CustomInput
                label="Phone"
                type="tel"
                id="phone"
                name="phone"
                register={register}
                error={errors.phone?.message}
                placeholder="Enter phone number"
                icon="bi-telephone"
                required
              />

              <CustomInput
                label="Status"
                type="select"
                id="status"
                name="status"
                register={register}
                error={errors.status?.message}
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
                {editMode ? 'Update Client' : 'Save Client'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
