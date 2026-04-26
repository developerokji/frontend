import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { packageValidationSchema } from '../../utils/validation';
import { CustomButton } from './CustomButton';
import CustomInput from './CustomInput';
import { categoriesAPI } from '../../services/api';

const PackageModal = ({ show, handleClose, handleSave, editMode = false, packageData = null }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(packageValidationSchema),
    defaultValues: {
      categoryId: '',
      packageName: '',
      packagePrice: '',
      noOfLead: '',
      leadCountIn: '',
      leadIn: 'months',
      status: 'on'
    }
  });

  // Reset form when modal opens or packageData changes
  useEffect(() => {
    if (editMode && packageData) {
      reset({
        categoryId: packageData.categoryId?.toString() || '',
        packageName: packageData.packageName || '',
        packagePrice: packageData.packagePrice || '',
        noOfLead: packageData.noOfLead || '',
        leadCountIn: packageData.leadCountIn || '',
        leadIn: packageData.leadIn || 'months',
        status: packageData.status || 'on'
      });
    } else {
      reset({
        categoryId: '',
        packageName: '',
        packagePrice: '',
        noOfLead: '',
        leadCountIn: '',
        leadIn: 'months',
        status: 'on'
      });
    }
  }, [show, editMode, packageData, reset]);

  // Load categories when modal opens
  useEffect(() => {
    const loadCategories = async () => {
      if (show) {
        setCategoriesLoading(true);
        try {
          const response = await categoriesAPI.getAll(1, 30, '');
          if (response.data && response.data.items) {
            setCategories(response.data.items);
          } else if (response.items) {
            setCategories(response.items);
          } else if (response.data) {
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

  // Reset form after categories are loaded in edit mode
  useEffect(() => {
    if (editMode && packageData && categories.length > 0 && !categoriesLoading) {
      reset({
        categoryId: packageData.categoryId?.toString() || '',
        packageName: packageData.packageName || '',
        packagePrice: packageData.packagePrice || '',
        noOfLead: packageData.noOfLead || '',
        leadCountIn: packageData.leadCountIn || '',
        leadIn: packageData.leadIn || 'months',
        status: packageData.status || 'on'
      });
    }
  }, [editMode, packageData, categories, categoriesLoading, reset]);

  const onSubmit = async (data) => {
    try {
      const packageDataWithCategory = {
        categoryId: data.categoryId,
        packageName: data.packageName,
        packagePrice: parseFloat(data.packagePrice),
        noOfLead: parseInt(data.noOfLead),
        leadCountIn: parseInt(data.leadCountIn),
        leadIn: data.leadIn,
        status: data.status
      };
      
      await handleSave(packageDataWithCategory);
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
          <div className="modal-header border-bottom bg-light">
            <h5 className="modal-title fw-semibold text-primary">
              <i className="bi bi-box-seam me-2"></i>
              {editMode ? 'Edit Package' : 'Add New Package'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body py-4">
              {/* First Row: Category and Package Name */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Category"
                    type="select"
                    id="categoryId"
                    name="categoryId"
                    placeholder={categoriesLoading ? "Loading..." : "Select Category"}
                    register={register}
                    error={errors.categoryId?.message}
                    required
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
                    label="Package Name"
                    type="text"
                    id="packageName"
                    name="packageName"
                    placeholder="Enter package name"
                    register={register}
                    error={errors.packageName?.message}
                    required
                  />
                </div>
              </div>

              {/* Second Row: Package Price and No. of Leads */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Package Price"
                    type="number"
                    id="packagePrice"
                    name="packagePrice"
                    placeholder="0.00"
                    register={register}
                    error={errors.packagePrice?.message}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-md-6">
                  <CustomInput
                    label="No. of Leads"
                    type="number"
                    id="noOfLead"
                    name="noOfLead"
                    placeholder="Enter number of leads"
                    register={register}
                    error={errors.noOfLead?.message}
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Third Row: Lead Count In and Duration Type */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Package In Count:"
                    type="number"
                    id="leadCountIn"
                    name="leadCountIn"
                    placeholder="Package In Count"
                    register={register}
                    error={errors.leadCountIn?.message}
                    required
                    min="1"
                  />
                </div>
                <div className="col-md-6">
                  <CustomInput
                    label="Package In:"
                    type="select"
                    id="leadIn"
                    name="leadIn"
                    placeholder="Select duration type"
                    register={register}
                    error={errors.leadIn?.message}
                    required
                    options={[
                      { value: 'days', label: 'Days' },
                      { value: 'weeks', label: 'Weeks' },
                      { value: 'months', label: 'Months' }
                    ]}
                  />
                </div>
              </div>

              {/* Fourth Row: Status */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <CustomInput
                    label="Status"
                    type="select"
                    id="status"
                    name="status"
                    placeholder="Select Status"
                    register={register}
                    error={errors.status?.message}
                    options={[
                      { value: 'on', label: 'Active' },
                      { value: 'off', label: 'Inactive' }
                    ]}
                    required
                  />
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
                {editMode ? 'Update Package' : 'Submit'}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;
