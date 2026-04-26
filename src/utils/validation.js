import * as yup from 'yup';

// Common validation patterns
const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[0-9]{10}$/,
  alphanumeric: /^[A-Za-z0-9\s]+$/
};

// Stories validation schema
export const storyValidationSchema = yup.object().shape({
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['on', 'off'], 'Invalid status')
});

// Locality validation schema
export const localityValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Locality name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(patterns.alphanumeric, 'Name can only contain letters, numbers, and spaces'),
  state: yup
    .string()
    .required('State is required')
    .test('state-selection', 'Please select a valid state', (value) => {
      // Check if value is not empty and not the placeholder
      return value && value !== '' && value !== undefined;
    }),
  city: yup
    .string()
    .required('City is required')
    .test('city-selection', 'Please select a valid city', (value) => {
      // Check if value is not empty and not the placeholder
      return value && value !== '' && value !== undefined;
    })
});

// Banner validation schema
export const bannerValidationSchema = yup.object().shape({
  category_id: yup
    .string()
    .required('Category is required')
    .notOneOf(['', 'null', 'undefined'], 'Please select a category'),
  sub_category_id: yup
    .string()
    .required('Sub Category is required')
    .notOneOf(['', 'null', 'undefined'], 'Please select a sub category'),
  service_id: yup
    .string()
    .required('Service is required')
    .notOneOf(['', 'null', 'undefined'], 'Please select a service'),
  banner_title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim('Title cannot be empty spaces'),
  banner_desc: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim('Description cannot be empty spaces'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['on', 'off'], 'Please select a valid status')
    .notOneOf(['', 'null', 'undefined'], 'Please select a status')
});

// Login validation schema
export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(patterns.email, 'Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
});

// User validation schema
export const userValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(patterns.alphanumeric, 'Name can only contain letters, numbers, and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .matches(patterns.email, 'Please enter a valid email address'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['Admin', 'Editor', 'Viewer'], 'Invalid role')
});

// Service validation schema
export const serviceValidationSchema = yup.object().shape({
  service_name: yup
    .string()
    .required('Service name is required')
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be less than 100 characters')
    .trim('Service name cannot be empty spaces'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be a positive number')
    .typeError('Price must be a valid number'),
  sale_price: yup
    .number()
    .positive('Sale price must be a positive number')
    .typeError('Sale price must be a valid number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  category_id: yup
    .string()
    .required('Category is required')
    .notOneOf(['', 'null', 'undefined'], 'Please select a category'),
  sub_category_id: yup
    .string()
    .required('Sub Category is required')
    .notOneOf(['', 'null', 'undefined'], 'Please select a sub category'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['on', 'off'], 'Please select a valid status')
    .notOneOf(['', 'null', 'undefined'], 'Please select a status'),
  service_details: yup
    .string()
    .required('Service details are required')
    .min(10, 'Service details must be at least 10 characters')
    .trim('Service details cannot be empty spaces'),
  service_included: yup
    .string()
    .required('Service included details are required')
    .min(5, 'Service included must be at least 5 characters')
    .trim('Service included cannot be empty spaces'),
  service_excluded: yup
    .string()
    .required('Service excluded details are required')
    .min(5, 'Service excluded must be at least 5 characters')
    .trim('Service excluded cannot be empty spaces')
});

// Client validation schema
export const clientValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(patterns.alphanumeric, 'First name can only contain letters, numbers, and spaces'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(patterns.alphanumeric, 'Last name can only contain letters, numbers, and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .matches(patterns.email, 'Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(patterns.phone, 'Please enter a valid 10-digit phone number'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['active', 'inactive'], 'Invalid status')
});

// Package validation schema
export const packageValidationSchema = yup.object().shape({
  categoryId: yup
    .string()
    .required('Category is required'),
  packageName: yup
    .string()
    .required('Package name is required')
    .min(2, 'Package name must be at least 2 characters')
    .max(100, 'Package name must be less than 100 characters'),
  packagePrice: yup
    .number()
    .required('Package price is required')
    .min(0, 'Package price must be greater than or equal to 0'),
  noOfLead: yup
    .number()
    .required('Number of leads is required')
    .min(1, 'Number of leads must be at least 1')
    .integer('Number of leads must be a whole number'),
  leadCountIn: yup
    .number()
    .required('Lead count duration is required')
    .min(1, 'Lead count duration must be at least 1')
    .integer('Lead count duration must be a whole number'),
  leadIn: yup
    .string()
    .required('Duration type is required')
    .oneOf(['days', 'weeks', 'months'], 'Invalid duration type'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['on', 'off'], 'Invalid status')
});

export default {
  patterns,
  storyValidationSchema,
  localityValidationSchema,
  bannerValidationSchema,
  loginValidationSchema,
  userValidationSchema,
  serviceValidationSchema,
  clientValidationSchema,
  packageValidationSchema
};
