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
    .required('Category ID is required'),
  banner_title: yup
    .string()
    .required('Banner title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  banner_desc: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  is_visible: yup
    .string()
    .required('Visibility is required')
    .oneOf(['up', 'down'], 'Invalid visibility option'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['on', 'off'], 'Invalid status')
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

export default {
  patterns,
  storyValidationSchema,
  localityValidationSchema,
  bannerValidationSchema,
  loginValidationSchema,
  userValidationSchema
};
