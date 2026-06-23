import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { partnerStepperAPI, api } from '../../services/api';

const PartnerStepperModal = ({ show, handleClose, handleSave, editMode = false, partnerData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [reviewData, setReviewData] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const [pincodeSearch, setPincodeSearch] = useState('');

  // Hardcoded pincodes for multi-select
  const availablePincodes = [
    '400001', '400002', '400003', '400004', '400005',
    '400006', '400007', '400008', '400009', '400010',
    '400011', '400012', '400013', '400014', '400015',
    '400016', '400017', '400018', '400019', '400020',
    '400021', '400022', '400023', '400024', '400025',
    '400026', '400027', '400028', '400029', '400030',
    '400031', '400032', '400033', '400034', '400035',
    '400036', '400037', '400038', '400039', '400040',
    '400041', '400042', '400043', '400044', '400045',
    '400046', '400047', '400048', '400049', '400050',
    '400051', '400052', '400053', '400054', '400055',
    '400056', '400057', '400058', '400059', '400060',
    '400061', '400062', '400063', '400064', '400065',
    '400066', '400067', '400068', '400069', '400070',
    '400071', '400072', '400073', '400074', '400075',
    '400076', '400077', '400078', '400079', '400080',
    '400081', '400082', '400083', '400084', '400085',
    '400086', '400087', '400088', '400089', '400090',
    '400091', '400092', '400093', '400094', '400095',
    '400096', '400097', '400098', '400099', '400100',
    '400101', '400102', '400103', '400104', '400105',
    '400106', '400107', '400108', '400109', '400110'
  ];

  // Form for Personal Info
  const personalInfoForm = useForm({
    resolver: yupResolver(yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required')
    })),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Form for Address
  const addressForm = useForm({
    resolver: yupResolver(yup.object().shape({
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      address: yup.string().required('Address is required'),
      pincode: yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required')
    })),
    defaultValues: {
      state: '',
      city: '',
      address: '',
      pincode: ''
    }
  });

  // Form for Bank Details
  const bankForm = useForm({
    resolver: yupResolver(yup.object().shape({
      beneficiaryName: yup.string().required('Beneficiary name is required'),
      accountNumber: yup.string().required('Account number is required'),
      ifscCode: yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').required('IFSC code is required'),
      bankName: yup.string().required('Bank name is required'),
      branch: yup.string().required('Branch is required')
    })),
    defaultValues: {
      beneficiaryName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: ''
    }
  });

  // Edit forms
  const editPersonalForm = useForm({
    resolver: yupResolver(yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required')
    })),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const editAddressForm = useForm({
    resolver: yupResolver(yup.object().shape({
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      address: yup.string().required('Address is required'),
      pincode: yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required')
    })),
    defaultValues: {
      state: '',
      city: '',
      address: '',
      pincode: ''
    }
  });

  const editBankForm = useForm({
    resolver: yupResolver(yup.object().shape({
      beneficiaryName: yup.string().required('Beneficiary name is required'),
      accountNumber: yup.string().required('Account number is required'),
      ifscCode: yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').required('IFSC code is required'),
      bankName: yup.string().required('Bank name is required'),
      branch: yup.string().required('Branch is required')
    })),
    defaultValues: {
      beneficiaryName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: ''
    }
  });

  const steps = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Address' },
    { id: 3, title: 'Pincode Mapping' },
    { id: 4, title: 'Bank Details' },
    { id: 5, title: 'Review' }
  ];

  const handleNext = async () => {
    setError('');
    
    if (currentStep === 1) {
      const isValid = await personalInfoForm.trigger();
      if (!isValid) return;
      
      if (!selectedFile && !editMode) {
        setFileError('Profile image is required');
        return;
      }
      
      if (editMode) {
        await handleUpdateUser();
      } else {
        await handleCreateUser();
      }
    } else if (currentStep === 2) {
      const isValid = await addressForm.trigger();
      if (!isValid) return;
      
      if (editMode && reviewData?.address?.[0]) {
        await handleUpdateAddress();
      } else {
        await handleCreateAddress();
      }
    } else if (currentStep === 3) {
      if (selectedPincodes.length === 0) {
        setError('Please select at least one pincode');
        return;
      }
      
      if (editMode) {
        await handleUpdateServiceLocations();
      } else {
        await handleCreateServiceLocations();
      }
    } else if (currentStep === 4) {
      const isValid = await bankForm.trigger();
      if (!isValid) return;
      
      if (editMode && reviewData?.bankDetail) {
        await handleUpdateBankDetail();
      } else {
        await handleCreateBankDetail();
      }
    } else if (currentStep === 5) {
      handleClose();
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const data = personalInfoForm.getValues();
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('role', 'partner');
      formData.append('avatar', selectedFile);

      const response = await api.post('/admin/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.data?.id) {
        setUserId(response.data.data.id);
        setCurrentStep(2);
      } else if (response.data?.id) {
        setUserId(response.data.id);
        setCurrentStep(2);
      } else {
        throw new Error('Failed to get user ID from response');
      }
    } catch (error) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const data = personalInfoForm.getValues();
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('role', 'partner');
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      await partnerStepperAPI.updateUser(userId, formData);
      setCurrentStep(2);
    } catch (error) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async () => {
    setLoading(true);
    try {
      const data = addressForm.getValues();
      await partnerStepperAPI.createAddress(userId, {
        state: data.state,
        city: data.city,
        address: data.address,
        pincode: data.pincode
      });
      setCurrentStep(3);
    } catch (error) {
      setError(error.message || 'Failed to create address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    setLoading(true);
    try {
      const data = addressForm.getValues();
      await partnerStepperAPI.updateAddress(userId, reviewData.address[0].id, data);
      setCurrentStep(3);
    } catch (error) {
      setError(error.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServiceLocations = async () => {
    setLoading(true);
    try {
      await partnerStepperAPI.createServiceLocations(userId, selectedPincodes);
      setCurrentStep(4);
    } catch (error) {
      setError(error.message || 'Failed to create service locations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceLocations = async () => {
    setLoading(true);
    try {
      // For service locations, we need to delete existing and create new ones
      // or update each location individually
      // For simplicity, we'll delete all and create new ones
      const existingLocations = reviewData.serviceLocations || [];
      
      // Delete all existing locations
      for (const loc of existingLocations) {
        try {
          await partnerStepperAPI.deleteServiceLocation(userId, loc.id, loc.pincode);
        } catch (err) {
          console.error('Failed to delete service location:', err);
        }
      }
      
      // Create new locations
      await partnerStepperAPI.createServiceLocations(userId, selectedPincodes);
      setCurrentStep(4);
    } catch (error) {
      setError(error.message || 'Failed to update service locations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBankDetail = async () => {
    setLoading(true);
    try {
      const data = bankForm.getValues();
      const formData = new FormData();
      formData.append('beneficiaryName', data.beneficiaryName);
      formData.append('accountNumber', data.accountNumber);
      formData.append('ifscCode', data.ifscCode);
      formData.append('bankName', data.bankName);
      formData.append('branch', data.branch);
      if (selectedFile) {
        formData.append('passbookImage', selectedFile);
      }

      await partnerStepperAPI.createBankDetail(userId, formData);
      
      await fetchReviewData();
      setCurrentStep(5);
    } catch (error) {
      setError(error.message || 'Failed to create bank detail');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBankDetail = async () => {
    setLoading(true);
    try {
      const data = bankForm.getValues();
      const formData = new FormData();
      formData.append('beneficiaryName', data.beneficiaryName);
      formData.append('accountNumber', data.accountNumber);
      formData.append('ifscCode', data.ifscCode);
      formData.append('bankName', data.bankName);
      formData.append('branch', data.branch);
      if (selectedFile) {
        formData.append('passbookImage', selectedFile);
      }

      await partnerStepperAPI.updateBankDetail(userId, reviewData.bankDetail.id, formData);
      
      await fetchReviewData();
      setCurrentStep(5);
    } catch (error) {
      setError(error.message || 'Failed to update bank detail');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewData = async () => {
    try {
      const [addressRes, serviceLocRes, bankDetailRes] = await Promise.all([
        partnerStepperAPI.getAddresses(userId),
        partnerStepperAPI.getServiceLocations(userId),
        partnerStepperAPI.getBankDetail(userId)
      ]);
console.log(addressRes,serviceLocRes,bankDetailRes)
      setReviewData({
        personal: personalInfoForm.getValues(),
        address: addressRes || [],
        serviceLocations: serviceLocRes || [],
        bankDetail: bankDetailRes || null
      });
    } catch (error) {
      console.error('Failed to fetch review data:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }
      setSelectedFile(file);
      setFileError('');
    }
  };

  const handlePincodeToggle = (pincode) => {
    setSelectedPincodes(prev => 
      prev.includes(pincode) 
        ? prev.filter(p => p !== pincode)
        : [...prev, pincode]
    );
  };

  const handleEditSection = (section) => {
    setEditSection(section);
    if (section === 'personal' && reviewData?.personal) {
      editPersonalForm.reset(reviewData.personal);
    } else if (section === 'address' && reviewData?.address?.[0]) {
      editAddressForm.reset(reviewData.address[0]);
    } else if (section === 'bank' && reviewData?.bankDetail) {
      editBankForm.reset(reviewData.bankDetail);
    }
  };

  const handleSaveEdit = async (section) => {
    setLoading(true);
    try {
      if (section === 'personal') {
        const data = editPersonalForm.getValues();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('role', 'partner');
        if (selectedFile) {
          formData.append('avatar', selectedFile);
        }

        await partnerStepperAPI.updateUser(userId, formData);
      } else if (section === 'address' && reviewData?.address?.[0]) {
        const data = editAddressForm.getValues();
        await partnerStepperAPI.updateAddress(userId, reviewData.address[0].id, data);
      } else if (section === 'bank' && reviewData?.bankDetail) {
        const data = editBankForm.getValues();
        const formData = new FormData();
        formData.append('beneficiaryName', data.beneficiaryName);
        formData.append('accountNumber', data.accountNumber);
        formData.append('ifscCode', data.ifscCode);
        formData.append('bankName', data.bankName);
        formData.append('branch', data.branch);
        if (selectedFile) {
          formData.append('passbookImage', selectedFile);
        }

        await partnerStepperAPI.updateBankDetail(userId, reviewData.bankDetail.id, formData);
      }

      await fetchReviewData();
      setEditSection(null);
      setSelectedFile(null);
    } catch (error) {
      setError(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditSection(null);
    setSelectedFile(null);
  };

  const handleModalClose = () => {
    personalInfoForm.reset();
    addressForm.reset();
    bankForm.reset();
    editPersonalForm.reset();
    editAddressForm.reset();
    editBankForm.reset();
    setCurrentStep(1);
    setUserId(null);
    setSelectedFile(null);
    setFileError('');
    setError('');
    setReviewData(null);
    setEditSection(null);
    setSelectedPincodes([]);
    handleClose();
  };

  const handleIfscChange = (e) => {
    e.target.value = e.target.value.toUpperCase();
  };

  // Load existing data when in edit mode
  useEffect(() => {
    if (show && editMode && partnerData) {
      setUserId(partnerData.id);
      // Load all existing data
      loadExistingData();
    } else if (show && !editMode) {
      // Reset for create mode
      setCurrentStep(1);
      setUserId(null);
      setSelectedFile(null);
      setFileError('');
      setError('');
      setReviewData(null);
      setEditSection(null);
      setSelectedPincodes([]);
      personalInfoForm.reset();
      addressForm.reset();
      bankForm.reset();
      editPersonalForm.reset();
      editAddressForm.reset();
      editBankForm.reset();
    }
  }, [show, editMode, partnerData]);

  const loadExistingData = async () => {
    setLoading(true);
    try {
      const [addressRes, serviceLocRes, bankDetailRes] = await Promise.all([
        partnerStepperAPI.getAddresses(partnerData.id),
        partnerStepperAPI.getServiceLocations(partnerData.id),
        partnerStepperAPI.getBankDetail(partnerData.id)
      ]);
console.log(addressRes,serviceLocRes,bankDetailRes)
      // Set personal info
      personalInfoForm.reset({
        name: partnerData.name || '',
        email: partnerData.email || '',
        phone: partnerData.phone || ''
      });

      // Set address
      if (addressRes && addressRes.length > 0) {
        addressForm.reset({
          state: addressRes[0].state || '',
          city: addressRes[0].city || '',
          address: addressRes[0].address || '',
          pincode: addressRes[0].pincode || ''
        });
      }

      // Set pincodes
      if (serviceLocRes && serviceLocRes.length > 0) {
        const pincodes = serviceLocRes.map(loc => loc.pincode);
        setSelectedPincodes(pincodes);
      }

      // Set bank details
      if (bankDetailRes) {
        bankForm.reset({
          beneficiaryName: bankDetailRes.beneficiaryName || '',
          accountNumber: bankDetailRes.accountNumber || '',
          ifscCode: bankDetailRes.ifscCode || '',
          bankName: bankDetailRes.bankName || '',
          branch: bankDetailRes.branch || ''
        });
      }

      setReviewData({
        personal: {
          name: partnerData.name || '',
          email: partnerData.email || '',
          phone: partnerData.phone || ''
        },
        address: addressRes.data || [],
        serviceLocations: serviceLocRes.data || [],
        bankDetail: bankDetailRes.data || null
      });

      setCurrentStep(1); // Start from personal info step in edit mode
    } catch (error) {
      setError(error.message || 'Failed to load partner data');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom bg-light">
            <h5 className="modal-title fw-semibold text-primary">
              <i className={`bi ${editMode ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
              {editMode ? 'Edit Partner' : 'Add Partner'}
            </h5>
            <button type="button" className="btn-close" onClick={handleModalClose}></button>
          </div>

          {/* Stepper Progress */}
          <div className="px-4 pt-4">
            <div className="d-flex justify-content-between align-items-center position-relative">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="text-center" style={{ flex: 1 }}>
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${
                        currentStep >= step.id ? 'bg-primary text-white' : 'bg-light text-muted'
                      }`}
                      style={{ width: '40px', height: '40px', fontSize: '14px' }}
                    >
                      {currentStep > step.id ? <i className="bi bi-check"></i> : step.id}
                    </div>
                    <small className={currentStep >= step.id ? 'text-primary fw-semibold' : 'text-muted'}>
                      {step.title}
                    </small>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-grow-1 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-light'}`}
                      style={{ height: '2px' }}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="modal-body py-4">
            {error && (
              <div className="alert alert-danger mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <form>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden"
                      style={{ width: '100px', height: '100px', border: '2px solid #dee2e6' }}
                    >
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Profile" className="w-100 h-100 object-cover" />
                      ) : editMode && partnerData?.avatar ? (
                        <img src={partnerData.avatar} alt="Profile" className="w-100 h-100 object-cover" />
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
                        required={!editMode}
                      />
                    </label>
                  </div>
                  {fileError && <div className="text-danger small mt-2">{fileError}</div>}
                  <small className="text-muted d-block mt-2">
                    Supported formats: JPG, PNG, GIF (Max size: 5MB) {!editMode && '* Required'}
                  </small>
                </div>

                <CustomInput
                  label="Name"
                  type="text"
                  id="name"
                  name="name"
                  register={personalInfoForm.register}
                  error={personalInfoForm.formState.errors.name?.message}
                  placeholder="Enter full name"
                  required
                />

                <CustomInput
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  register={personalInfoForm.register}
                  error={personalInfoForm.formState.errors.email?.message}
                  placeholder="Enter email address"
                  required
                />

                <CustomInput
                  label="Phone"
                  type="tel"
                  id="phone"
                  name="phone"
                  register={personalInfoForm.register}
                  error={personalInfoForm.formState.errors.phone?.message}
                  placeholder="Enter phone number"
                  required
                />
              </form>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <form>
                <CustomInput
                  label="State"
                  type="text"
                  id="state"
                  name="state"
                  register={addressForm.register}
                  error={addressForm.formState.errors.state?.message}
                  placeholder="Enter state"
                  required
                />

                <CustomInput
                  label="City"
                  type="text"
                  id="city"
                  name="city"
                  register={addressForm.register}
                  error={addressForm.formState.errors.city?.message}
                  placeholder="Enter city"
                  required
                />

                <CustomInput
                  label="Address"
                  type="textarea"
                  id="address"
                  name="address"
                  register={addressForm.register}
                  error={addressForm.formState.errors.address?.message}
                  placeholder="Enter full address"
                  rows="3"
                  required
                />

                <CustomInput
                  label="Pincode"
                  type="text"
                  id="pincode"
                  name="pincode"
                  register={addressForm.register}
                  error={addressForm.formState.errors.pincode?.message}
                  placeholder="Enter 6-digit pincode"
                  required
                />
              </form>
            )}

            {/* Step 3: Pincode Mapping */}
            {currentStep === 3 && (
              <div>
                <label className="form-label fw-medium">Select Service Pincodes *</label>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search pincodes..."
                    value={pincodeSearch}
                    onChange={(e) => setPincodeSearch(e.target.value)}
                  />
                </div>
                <div className="card p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div className="row g-2">
                    {availablePincodes
                      .filter(pincode => pincode.includes(pincodeSearch))
                      .map(pincode => (
                        <div key={pincode} className="col-6 col-md-4">
                          <div
                            className={`form-check p-2 rounded cursor-pointer ${
                              selectedPincodes.includes(pincode) ? 'bg-primary text-white' : 'bg-light'
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePincodeToggle(pincode)}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={selectedPincodes.includes(pincode)}
                              onChange={() => handlePincodeToggle(pincode)}
                            />
                            <span className="small">{pincode}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <small className="text-muted">
                  Selected: {selectedPincodes.length} pincodes
                </small>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <form>
                <CustomInput
                  label="Beneficiary Name"
                  type="text"
                  id="beneficiaryName"
                  name="beneficiaryName"
                  register={bankForm.register}
                  error={bankForm.formState.errors.beneficiaryName?.message}
                  placeholder="Enter beneficiary name"
                  required
                />

                <CustomInput
                  label="Account Number"
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  register={bankForm.register}
                  error={bankForm.formState.errors.accountNumber?.message}
                  placeholder="Enter account number"
                  required
                />

                <CustomInput
                  label="IFSC Code"
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  register={bankForm.register}
                  error={bankForm.formState.errors.ifscCode?.message}
                  placeholder="Enter IFSC code (e.g., SBIN0000123)"
                  required
                  onChange={handleIfscChange}
                />

                <CustomInput
                  label="Bank Name"
                  type="text"
                  id="bankName"
                  name="bankName"
                  register={bankForm.register}
                  error={bankForm.formState.errors.bankName?.message}
                  placeholder="Enter bank name"
                  required
                />

                <CustomInput
                  label="Branch"
                  type="text"
                  id="branch"
                  name="branch"
                  register={bankForm.register}
                  error={bankForm.formState.errors.branch?.message}
                  placeholder="Enter branch name"
                  required
                />

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Passbook Image {!editMode && <span className="text-danger">*</span>}
                  </label>
                  {editMode && reviewData?.bankDetail?.passbookPath && !selectedFile && (
                    <div className="mb-2">
                      <img 
                        src={reviewData.bankDetail.passbookPath} 
                        alt="Passbook" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editMode}
                  />
                  {fileError && <div className="text-danger small mt-1">{fileError}</div>}
                  <small className="text-muted d-block mt-2">
                    Supported formats: JPG, PNG, GIF (Max size: 5MB)
                  </small>
                </div>
              </form>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && reviewData && (
              <div>
                {editSection === 'personal' ? (
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Edit Personal Information</h6>
                    </div>
                    <div className="card-body">
                      <CustomInput
                        label="Name"
                        type="text"
                        id="editName"
                        name="name"
                        register={editPersonalForm.register}
                        error={editPersonalForm.formState.errors.name?.message}
                        required
                      />
                      <CustomInput
                        label="Email"
                        type="email"
                        id="editEmail"
                        name="email"
                        register={editPersonalForm.register}
                        error={editPersonalForm.formState.errors.email?.message}
                        required
                      />
                      <CustomInput
                        label="Phone"
                        type="tel"
                        id="editPhone"
                        name="phone"
                        register={editPersonalForm.register}
                        error={editPersonalForm.formState.errors.phone?.message}
                        required
                      />
                      <div className="mt-3">
                        <CustomButton variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </CustomButton>
                        <CustomButton variant="primary" onClick={() => handleSaveEdit('personal')} loading={loading}>
                          Save
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-person me-2"></i>Personal Information
                      </h6>
                      <CustomButton variant="outline-primary" size="sm" onClick={() => handleEditSection('personal')}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </CustomButton>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Name</label>
                          <div className="fw-semibold">{reviewData.personal.name}</div>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Email</label>
                          <div className="fw-semibold">{reviewData.personal.email}</div>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Phone</label>
                          <div className="fw-semibold">{reviewData.personal.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editSection === 'address' ? (
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Edit Address</h6>
                    </div>
                    <div className="card-body">
                      <CustomInput
                        label="State"
                        type="text"
                        id="editState"
                        name="state"
                        register={editAddressForm.register}
                        error={editAddressForm.formState.errors.state?.message}
                        required
                      />
                      <CustomInput
                        label="City"
                        type="text"
                        id="editCity"
                        name="city"
                        register={editAddressForm.register}
                        error={editAddressForm.formState.errors.city?.message}
                        required
                      />
                      <CustomInput
                        label="Address"
                        type="textarea"
                        id="editAddress"
                        name="address"
                        register={editAddressForm.register}
                        error={editAddressForm.formState.errors.address?.message}
                        rows="3"
                        required
                      />
                      <CustomInput
                        label="Pincode"
                        type="text"
                        id="editPincode"
                        name="pincode"
                        register={editAddressForm.register}
                        error={editAddressForm.formState.errors.pincode?.message}
                        required
                      />
                      <div className="mt-3">
                        <CustomButton variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </CustomButton>
                        <CustomButton variant="primary" onClick={() => handleSaveEdit('address')} loading={loading}>
                          Save
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-geo-alt me-2"></i>Address
                      </h6>
                      <CustomButton variant="outline-primary" size="sm" onClick={() => handleEditSection('address')}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </CustomButton>
                    </div>
                    <div className="card-body">
                      {reviewData.address.length > 0 ? (
                        reviewData.address.map((addr, idx) => (
                          <div key={idx} className="mb-2">
                            <div className="fw-semibold">{addr.address}</div>
                            <small className="text-muted">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </small>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted">No address added</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-primary">
                      <i className="bi bi-map me-2"></i>Service Locations
                    </h6>
                  </div>
                  <div className="card-body">
                    {reviewData.serviceLocations.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {reviewData.serviceLocations.map((loc, idx) => (
                          <span key={idx} className="badge bg-primary">
                            {loc.pincode}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted">No service locations added</div>
                    )}
                  </div>
                </div>

                {editSection === 'bank' ? (
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Edit Bank Details</h6>
                    </div>
                    <div className="card-body">
                      <CustomInput
                        label="Beneficiary Name"
                        type="text"
                        id="editBeneficiaryName"
                        name="beneficiaryName"
                        register={editBankForm.register}
                        error={editBankForm.formState.errors.beneficiaryName?.message}
                        required
                      />
                      <CustomInput
                        label="Account Number"
                        type="text"
                        id="editAccountNumber"
                        name="accountNumber"
                        register={editBankForm.register}
                        error={editBankForm.formState.errors.accountNumber?.message}
                        required
                      />
                      <CustomInput
                        label="IFSC Code"
                        type="text"
                        id="editIfscCode"
                        name="ifscCode"
                        register={editBankForm.register}
                        error={editBankForm.formState.errors.ifscCode?.message}
                        required
                        onChange={handleIfscChange}
                      />
                      <CustomInput
                        label="Bank Name"
                        type="text"
                        id="editBankName"
                        name="bankName"
                        register={editBankForm.register}
                        error={editBankForm.formState.errors.bankName?.message}
                        required
                      />
                      <CustomInput
                        label="Branch"
                        type="text"
                        id="editBranch"
                        name="branch"
                        register={editBankForm.register}
                        error={editBankForm.formState.errors.branch?.message}
                        required
                      />
                      <div className="mb-3">
                        <label className="form-label fw-medium">Passbook Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="mt-3">
                        <CustomButton variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </CustomButton>
                        <CustomButton variant="primary" onClick={() => handleSaveEdit('bank')} loading={loading}>
                          Save
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-bank me-2"></i>Bank Details
                      </h6>
                      <CustomButton variant="outline-primary" size="sm" onClick={() => handleEditSection('bank')}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </CustomButton>
                    </div>
                    <div className="card-body">
                      {reviewData.bankDetail ? (
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">Beneficiary Name</label>
                            <div className="fw-semibold">{reviewData.bankDetail.beneficiaryName}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">Account Number</label>
                            <div className="fw-semibold">{reviewData.bankDetail.accountNumber}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">Bank Name</label>
                            <div className="fw-semibold">{reviewData.bankDetail.bankName}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">Branch</label>
                            <div className="fw-semibold">{reviewData.bankDetail.branch}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">IFSC Code</label>
                            <div className="fw-semibold">{reviewData.bankDetail.ifscCode}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted">No bank details added</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer border-top">
            <CustomButton variant="secondary" onClick={handleModalClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </CustomButton>
            {currentStep > 1 && (
              <CustomButton variant="outline-primary" onClick={handleBack}>
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </CustomButton>
            )}
            <CustomButton variant="primary" onClick={handleNext} loading={loading}>
              {currentStep === 5 ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Submit
                </>
              ) : (
                <>
                  Next <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerStepperModal;
