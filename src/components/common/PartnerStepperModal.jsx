import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { partnerStepperAPI, api, categoriesAPI, localitiesAPI } from '../../services/api';

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

  // Custom states
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPincode, setHoveredPincode] = useState(null);
  const [availablePincodes, setAvailablePincodes] = useState([]);
  
  // Document states
  const [aadharFrontFile, setAadharFrontFile] = useState(null);
  const [aadharBackFile, setAadharBackFile] = useState(null);
  const [panImageFile, setPanImageFile] = useState(null);
  
  const [aadharFrontError, setAadharFrontError] = useState('');
  const [aadharBackError, setAadharBackError] = useState('');
  const [panImageError, setPanImageError] = useState('');

  // Form for Personal Info
  const personalInfoForm = useForm({
    resolver: yupResolver(yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
      categoryId: yup.string().required('Category is required')
    })),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      categoryId: ''
    }
  });

  // Form for Address
  const addressForm = useForm({
    resolver: yupResolver(yup.object().shape({
      houseFlat: yup.string().required('Flat / House name is required'),
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      address: yup.string().required('Address is required'),
      pincode: yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required')
    })),
    defaultValues: {
      houseFlat: '',
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

  // Form for Documents
  const documentForm = useForm({
    resolver: yupResolver(yup.object().shape({
      aadharNumber: yup.string().matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits').required('Aadhar number is required'),
      panNumber: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').required('PAN number is required')
    })),
    defaultValues: {
      aadharNumber: '',
      panNumber: ''
    }
  });

  // Edit forms
  const editPersonalForm = useForm({
    resolver: yupResolver(yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
      categoryId: yup.string().required('Category is required')
    })),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      categoryId: ''
    }
  });

  const editAddressForm = useForm({
    resolver: yupResolver(yup.object().shape({
      houseFlat: yup.string().required('Flat / House name is required'),
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      address: yup.string().required('Address is required'),
      pincode: yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required')
    })),
    defaultValues: {
      houseFlat: '',
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

  const editDocumentForm = useForm({
    resolver: yupResolver(yup.object().shape({
      aadharNumber: yup.string().matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits').required('Aadhar number is required'),
      panNumber: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').required('PAN number is required')
    })),
    defaultValues: {
      aadharNumber: '',
      panNumber: ''
    }
  });

  const steps = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Address' },
    { id: 3, title: 'Pincode Mapping' },
    { id: 4, title: 'Bank Details' },
    { id: 5, title: 'Documents' },
    { id: 6, title: 'Review' }
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
      const isValid = await documentForm.trigger();
      if (!isValid) return;

      if (!editMode) {
        if (!aadharFrontFile) {
          setAadharFrontError('Aadhar Front image is required');
          return;
        }
        if (!aadharBackFile) {
          setAadharBackError('Aadhar Back image is required');
          return;
        }
        if (!panImageFile) {
          setPanImageError('PAN image is required');
          return;
        }
      }

      await handleUploadDocuments();
    } else if (currentStep === 6) {
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
      formData.append('categoryId', data.categoryId);
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
      formData.append('categoryId', data.categoryId);
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
        houseFlat: data.houseFlat,
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
      await partnerStepperAPI.updateAddress(userId, reviewData.address[0].id, {
        houseFlat: data.houseFlat,
        state: data.state,
        city: data.city,
        address: data.address,
        pincode: data.pincode
      });
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
      setCurrentStep(5);
    } catch (error) {
      setError(error.message || 'Failed to update bank detail');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocuments = async () => {
    setLoading(true);
    try {
      const data = documentForm.getValues();
      const formData = new FormData();
      formData.append('aadharNumber', data.aadharNumber);
      formData.append('panNumber', data.panNumber);
      
      if (aadharFrontFile) {
        formData.append('aadharFront', aadharFrontFile);
      }
      if (aadharBackFile) {
        formData.append('aadharBack', aadharBackFile);
      }
      if (panImageFile) {
        formData.append('panImage', panImageFile);
      }

      await partnerStepperAPI.uploadDocuments(userId, formData);
      await fetchReviewData();
      setCurrentStep(6);
    } catch (error) {
      setError(error.message || 'Failed to upload documents');
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
      
      let documentsRes = null;
      try {
        documentsRes = await partnerStepperAPI.getDocuments(userId);
      } catch (err) {
        console.warn('Failed to fetch documents for review:', err);
      }

      setReviewData({
        personal: personalInfoForm.getValues(),
        address: addressRes || [],
        serviceLocations: serviceLocRes || [],
        bankDetail: bankDetailRes || null,
        documents: documentsRes || null
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

  const handleAadharFrontChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setAadharFrontError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }
      setAadharFrontFile(file);
      setAadharFrontError('');
    }
  };

  const handleAadharBackChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setAadharBackError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }
      setAadharBackFile(file);
      setAadharBackError('');
    }
  };

  const handlePanImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setPanImageError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }
      setPanImageFile(file);
      setPanImageError('');
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
    } else if (section === 'documents' && reviewData?.documents) {
      editDocumentForm.reset({
        aadharNumber: reviewData.documents.aadharNumber || '',
        panNumber: reviewData.documents.panNumber || ''
      });
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
        formData.append('categoryId', data.categoryId);
        if (selectedFile) {
          formData.append('avatar', selectedFile);
        }

        await partnerStepperAPI.updateUser(userId, formData);
      } else if (section === 'address' && reviewData?.address?.[0]) {
        const data = editAddressForm.getValues();
        await partnerStepperAPI.updateAddress(userId, reviewData.address[0].id, {
          houseFlat: data.houseFlat,
          state: data.state,
          city: data.city,
          address: data.address,
          pincode: data.pincode
        });
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
      } else if (section === 'documents') {
        const data = editDocumentForm.getValues();
        const formData = new FormData();
        formData.append('aadharNumber', data.aadharNumber);
        formData.append('panNumber', data.panNumber);
        if (aadharFrontFile) {
          formData.append('aadharFront', aadharFrontFile);
        }
        if (aadharBackFile) {
          formData.append('aadharBack', aadharBackFile);
        }
        if (panImageFile) {
          formData.append('panImage', panImageFile);
        }

        await partnerStepperAPI.uploadDocuments(userId, formData);
      }

      await fetchReviewData();
      setEditSection(null);
      setSelectedFile(null);
      setAadharFrontFile(null);
      setAadharBackFile(null);
      setPanImageFile(null);
    } catch (error) {
      setError(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditSection(null);
    setSelectedFile(null);
    setAadharFrontFile(null);
    setAadharBackFile(null);
    setPanImageFile(null);
    setAadharFrontError('');
    setAadharBackError('');
    setPanImageError('');
  };

  const handleModalClose = () => {
    personalInfoForm.reset();
    addressForm.reset();
    bankForm.reset();
    documentForm.reset();
    editPersonalForm.reset();
    editAddressForm.reset();
    editBankForm.reset();
    editDocumentForm.reset();
    setCurrentStep(1);
    setUserId(null);
    setSelectedFile(null);
    setFileError('');
    setError('');
    setReviewData(null);
    setEditSection(null);
    setSelectedPincodes([]);
    setAadharFrontFile(null);
    setAadharBackFile(null);
    setPanImageFile(null);
    setAadharFrontError('');
    setAadharBackError('');
    setPanImageError('');
    setDropdownOpen(false);
    handleClose();
  };

  const handleIfscChange = (e) => {
    e.target.value = e.target.value.toUpperCase();
  };

  // Load categories and pincodes, handle dropdown close on click outside
  useEffect(() => {
    if (show) {
      const fetchCategories = async () => {
        try {
          const res = await categoriesAPI.getAll(1, 100);
          setCategories(res?.data?.items || res?.items || []);
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      };
      
      const fetchPincodes = async () => {
        try {
          const res = await localitiesAPI.getAll(1, 1000, '');
          const pincodes = res?.data?.items || res?.items || [];
          // Extract unique pincodes from locality data
          const uniquePincodes = [...new Set(pincodes.map(loc => loc.localityName).filter(Boolean))];
          setAvailablePincodes(uniquePincodes);
        } catch (error) {
          console.error('Failed to fetch pincodes:', error);
        }
      };
      
      fetchCategories();
      fetchPincodes();
    }
  }, [show]);

  // Click outside to close pincode dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.position-relative')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
      setAadharFrontFile(null);
      setAadharBackFile(null);
      setPanImageFile(null);
      setAadharFrontError('');
      setAadharBackError('');
      setPanImageError('');
      setDropdownOpen(false);
      personalInfoForm.reset();
      addressForm.reset();
      bankForm.reset();
      documentForm.reset();
      editPersonalForm.reset();
      editAddressForm.reset();
      editBankForm.reset();
      editDocumentForm.reset();
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
      
      let documentsRes = null;
      try {
        documentsRes = await partnerStepperAPI.getDocuments(partnerData.id);
      } catch (err) {
        console.warn('Failed to load documents:', err);
      }

      // Set personal info
      personalInfoForm.reset({
        name: partnerData.name || '',
        email: partnerData.email || '',
        phone: partnerData.phone || '',
        categoryId: partnerData.categoryId || ''
      });

      // Set address
      if (addressRes && addressRes.length > 0) {
        addressForm.reset({
          houseFlat: addressRes[0].houseFlat || '',
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

      // Set documents
      if (documentsRes) {
        documentForm.reset({
          aadharNumber: documentsRes.aadharNumber || '',
          panNumber: documentsRes.panNumber || ''
        });
      }

      setReviewData({
        personal: {
          name: partnerData.name || '',
          email: partnerData.email || '',
          phone: partnerData.phone || '',
          categoryId: partnerData.categoryId || ''
        },
        address: addressRes.data || addressRes || [],
        serviceLocations: serviceLocRes.data || serviceLocRes || [],
        bankDetail: bankDetailRes.data || bankDetailRes || null,
        documents: documentsRes || null
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

                <CustomInput
                  label="Category"
                  type="select"
                  id="categoryId"
                  name="categoryId"
                  placeholder="Select Category"
                  register={personalInfoForm.register}
                  error={personalInfoForm.formState.errors.categoryId?.message}
                  icon="bi-folder"
                  options={[
                    { value: '', label: 'Select Category...' },
                    ...(categories.length > 0 ? categories.map(category => ({
                      value: category.id,
                      label: category.categoryName || category.name
                    })) : [])
                  ]}
                  required
                />
              </form>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <form>
                <CustomInput
                  label="Flat Name / House Name"
                  type="text"
                  id="houseFlat"
                  name="houseFlat"
                  register={addressForm.register}
                  error={addressForm.formState.errors.houseFlat?.message}
                  placeholder="Enter flat name / house name / building name"
                  required
                />

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
                <label className="form-label fw-semibold text-dark mb-2">Select Service Pincodes *</label>
                <div className="position-relative">
                  {/* Select Input Display Box */}
                  <div
                    className="form-control d-flex flex-wrap align-items-center gap-2 border-secondary-subtle rounded-3 p-2 cursor-pointer bg-white"
                    style={{ minHeight: '48px', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {selectedPincodes.length === 0 ? (
                      <span className="text-muted ps-1">Select pincodes...</span>
                    ) : (
                      selectedPincodes.map(pincode => (
                        <span 
                          key={pincode} 
                          className="badge bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center gap-1 py-1.5 px-2 rounded-2"
                          style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd', border: '1px solid rgba(13, 110, 253, 0.2)' }}
                        >
                          {pincode}
                          <button
                            type="button"
                            className="btn-close p-0"
                            style={{ fontSize: '10px', filter: 'none', marginLeft: '4px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePincodeToggle(pincode);
                            }}
                          ></button>
                        </span>
                      ))
                    )}
                    <i className="bi bi-chevron-down ms-auto text-muted px-2"></i>
                  </div>

                  {/* Dropdown Container */}
                  {dropdownOpen && (
                    <div
                      className="position-absolute w-100 mt-1 bg-white border border-secondary-subtle rounded-3 shadow-lg p-2"
                      style={{ zIndex: 1050 }}
                    >
                      <div className="input-group mb-2">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search pincodes..."
                          value={pincodeSearch}
                          onChange={(e) => setPincodeSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {pincodeSearch && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-start-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPincodeSearch('');
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {availablePincodes
                          .filter(pincode => pincode.includes(pincodeSearch))
                          .map(pincode => {
                            const isSelected = selectedPincodes.includes(pincode);
                            return (
                              <div
                                key={pincode}
                                className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-2`}
                                style={{ 
                                  cursor: 'pointer', 
                                  transition: 'background-color 0.15s ease',
                                  backgroundColor: hoveredPincode === pincode ? '#f8f9fa' : (isSelected ? 'rgba(13, 110, 253, 0.1)' : 'transparent'),
                                  color: isSelected ? '#0d6efd' : '#212529',
                                  fontWeight: isSelected ? '500' : 'normal'
                                }}
                                onMouseEnter={() => setHoveredPincode(pincode)}
                                onMouseLeave={() => setHoveredPincode(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePincodeToggle(pincode);
                                }}
                              >
                                <span>{pincode}</span>
                                {isSelected ? (
                                  <i className="bi bi-check-lg text-primary"></i>
                                ) : (
                                  <span style={{ width: '16px' }}></span>
                                )}
                              </div>
                            );
                          })}
                        {availablePincodes.filter(pincode => pincode.includes(pincodeSearch)).length === 0 && (
                          <div className="text-center text-muted py-3">No pincodes found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                  <small className="text-muted">
                    Selected: <strong>{selectedPincodes.length}</strong> pincodes
                  </small>
                  {selectedPincodes.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={() => setSelectedPincodes([])}
                    >
                      Clear All
                    </button>
                  )}
                </div>
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

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <form>
                <CustomInput
                  label="Aadhar Number"
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  register={documentForm.register}
                  error={documentForm.formState.errors.aadharNumber?.message}
                  placeholder="Enter 12-digit Aadhar number"
                  required
                />

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Aadhar Front Image {!editMode && <span className="text-danger">*</span>}
                  </label>
                  {editMode && reviewData?.documents?.aadharFrontPath && !aadharFrontFile && (
                    <div className="mb-2">
                      <img 
                        src={reviewData.documents.aadharFrontPath} 
                        alt="Aadhar Front" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleAadharFrontChange}
                    required={!editMode}
                  />
                  {aadharFrontError && <div className="text-danger small mt-1">{aadharFrontError}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Aadhar Back Image {!editMode && <span className="text-danger">*</span>}
                  </label>
                  {editMode && reviewData?.documents?.aadharBackPath && !aadharBackFile && (
                    <div className="mb-2">
                      <img 
                        src={reviewData.documents.aadharBackPath} 
                        alt="Aadhar Back" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleAadharBackChange}
                    required={!editMode}
                  />
                  {aadharBackError && <div className="text-danger small mt-1">{aadharBackError}</div>}
                </div>

                <CustomInput
                  label="PAN Number"
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  register={documentForm.register}
                  error={documentForm.formState.errors.panNumber?.message}
                  placeholder="Enter 10-digit PAN number (e.g., ABCDE1234F)"
                  required
                />

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    PAN Image {!editMode && <span className="text-danger">*</span>}
                  </label>
                  {editMode && reviewData?.documents?.panImagePath && !panImageFile && (
                    <div className="mb-2">
                      <img 
                        src={reviewData.documents.panImagePath} 
                        alt="PAN Image" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePanImageChange}
                    required={!editMode}
                  />
                  {panImageError && <div className="text-danger small mt-1">{panImageError}</div>}
                </div>
              </form>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && reviewData && (
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
                      <CustomInput
                        label="Category"
                        type="select"
                        id="editCategoryId"
                        name="categoryId"
                        placeholder="Select Category"
                        register={editPersonalForm.register}
                        error={editPersonalForm.formState.errors.categoryId?.message}
                        icon="bi-folder"
                        options={categories.length > 0 ? categories.map(category => ({
                          value: category.id,
                          label: category.categoryName || category.name
                        })) : [
                          { value: '', label: 'No categories available' }
                        ]}
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
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Category</label>
                          <div className="fw-semibold">
                            {categories.find(c => String(c.id) === String(reviewData.personal.categoryId))?.categoryName || 
                             categories.find(c => String(c.id) === String(reviewData.personal.categoryId))?.name || 
                             'N/A'}
                          </div>
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
                        label="Flat Name / House Name"
                        type="text"
                        id="editHouseFlat"
                        name="houseFlat"
                        register={editAddressForm.register}
                        error={editAddressForm.formState.errors.houseFlat?.message}
                        required
                      />
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
                            <div className="fw-semibold">
                              {addr.houseFlat && `${addr.houseFlat}, `}{addr.address}
                            </div>
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

                {editSection === 'documents' ? (
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Edit Documents</h6>
                    </div>
                    <div className="card-body">
                      <CustomInput
                        label="Aadhar Number"
                        type="text"
                        id="editAadharNumber"
                        name="aadharNumber"
                        register={editDocumentForm.register}
                        error={editDocumentForm.formState.errors.aadharNumber?.message}
                        required
                      />
                      <div className="mb-3">
                        <label className="form-label fw-medium">Aadhar Front Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleAadharFrontChange}
                        />
                        {aadharFrontError && <div className="text-danger small mt-1">{aadharFrontError}</div>}
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-medium">Aadhar Back Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleAadharBackChange}
                        />
                        {aadharBackError && <div className="text-danger small mt-1">{aadharBackError}</div>}
                      </div>
                      <CustomInput
                        label="PAN Number"
                        type="text"
                        id="editPanNumber"
                        name="panNumber"
                        register={editDocumentForm.register}
                        error={editDocumentForm.formState.errors.panNumber?.message}
                        required
                      />
                      <div className="mb-3">
                        <label className="form-label fw-medium">PAN Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handlePanImageChange}
                        />
                        {panImageError && <div className="text-danger small mt-1">{panImageError}</div>}
                      </div>
                      <div className="mt-3">
                        <CustomButton variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </CustomButton>
                        <CustomButton variant="primary" onClick={() => handleSaveEdit('documents')} loading={loading}>
                          Save
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-file-earmark-medical me-2"></i>Documents
                      </h6>
                      <CustomButton variant="outline-primary" size="sm" onClick={() => handleEditSection('documents')}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </CustomButton>
                    </div>
                    <div className="card-body">
                      {reviewData.documents ? (
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">Aadhar Number</label>
                            <div className="fw-semibold">{reviewData.documents.aadharNumber}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1">PAN Number</label>
                            <div className="fw-semibold">{reviewData.documents.panNumber}</div>
                          </div>
                          {reviewData.documents.aadharFrontPath && (
                            <div className="col-md-4">
                              <label className="text-muted small mb-1 d-block">Aadhar Front</label>
                              <img src={reviewData.documents.aadharFrontPath} alt="Aadhar Front" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                            </div>
                          )}
                          {reviewData.documents.aadharBackPath && (
                            <div className="col-md-4">
                              <label className="text-muted small mb-1 d-block">Aadhar Back</label>
                              <img src={reviewData.documents.aadharBackPath} alt="Aadhar Back" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                            </div>
                          )}
                          {reviewData.documents.panImagePath && (
                            <div className="col-md-4">
                              <label className="text-muted small mb-1 d-block">PAN Image</label>
                              <img src={reviewData.documents.panImagePath} alt="PAN" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted">No documents uploaded</div>
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
              {currentStep === 6 ? (
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
