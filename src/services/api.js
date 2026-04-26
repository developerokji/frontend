import { api } from './apiClient';

// Stories API
export const storiesAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    console.log('Fetching stories with params:', { page, limit, search });
    try {
      const response = await api.get('/stories', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Stories API Error:', error);
      throw error;
    }
  },


  create: async (storyData) => {
    try {
      const response = await api.post('/stories', storyData);
      return response;
    } catch (error) {
      console.error('Create Story Error:', error);
      throw error;
    }
  },

  update: async (id, storyData) => {
    try {
      const response = await api.patch(`/stories/${id}`, storyData);
      return response;
    } catch (error) {
      console.error('Update Story Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/stories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Story Error:', error);
      throw error;
    }
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return response;
    } catch (error) {
      console.error('Logout API Error:', error);
      throw error;
    }
  }
};

// Users API
export const usersAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Users API Error:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      console.error('Create User Error:', error);
      throw error;
    }
  }
};

// States and Cities API
export const statesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/states');
      return response.data;
    } catch (error) {
      console.error('States API Error:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
};

export const citiesAPI = {
  getByState: async (stateId) => {
    try {
      const response = await api.get('/cities', {
        params: { stateId }
      });
      return response.data;
    } catch (error) {
      console.error('Cities API Error:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
};

// Localities API
export const localitiesAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    console.log('localitiesAPI.getAll called with:', { page, limit, search });
    try {
      const response = await api.get('/localities', {
        params: { page, limit, search }
      });
      console.log('localitiesAPI response:', response);
      return response.data;
    } catch (error) {
      console.error('Localities API Error:', error);
      throw error;
    }
  },

  create: async (localityData) => {
    try {
      const response = await api.post('/localities', localityData);
      return response;
    } catch (error) {
      console.error('Create Locality Error:', error);
      return {
        data: {},
        message: error.message
      };
    }
  },

  update: async (id, localityData) => {
    try {
      const response = await api.patch(`/localities/${id}`, localityData);
      return response;
    } catch (error) {
      console.error('Update Locality Error:', error);
      return {
        data: {},
        message: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/localities/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Locality Error:', error);
      return {
        message: error.message
      };
    }
  }
};

// Banners API
export const bannersAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/banners', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Banners API Error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Banner Error:', error);
      throw error;
    }
  },

  create: async (bannerData) => {
    try {
      const response = await api.post('/banners', bannerData);
      return response;
    } catch (error) {
      console.error('Create Banner Error:', error);
      throw error;
    }
  },

  update: async (id, bannerData) => {
    try {
      const response = await api.patch(`/banners/${id}`, bannerData);
      return response;
    } catch (error) {
      console.error('Update Banner Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/banners/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Banner Error:', error);
      throw error;
    }
  }
};
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard API Error:', error);
      throw error;
    }
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/categories', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Categories API Error:', error);
      // Temporary fallback for testing
      console.log('Using mock categories data for testing');
      const mockCategories = [
        { id: 1, name: 'Electronics', image: 'https://via.placeholder.com/150', status: 'active', created_at: '2024-01-15' },
        { id: 2, name: 'Furniture', image: 'https://via.placeholder.com/150', status: 'active', created_at: '2024-01-16' },
        { id: 3, name: 'Clothing', image: 'https://via.placeholder.com/150', status: 'inactive', created_at: '2024-01-17' }
      ];
      
      return {
        success: true,
        message: 'Categories fetched successfully (mock)',
        data: {
          items: mockCategories,
          meta: {
            totalItems: mockCategories.length,
            currentPage: page,
            totalPages: Math.ceil(mockCategories.length / limit),
            itemsPerPage: limit
          }
        }
      };
    }
  },

  create: async (categoryData) => {
    try {
      const formData = new FormData();
      
      // Add fields to FormData
      if (categoryData.categoryName) {
        formData.append('name', categoryData.categoryName);
      }
      
      if (categoryData.image) {
        formData.append('image', categoryData.image);
      }
      
      if (categoryData.status) {
        formData.append('status', categoryData.status);
      }
      
      const response = await api.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create Category Error:', error);
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const formData = new FormData();
      
      // Add fields to FormData
      if (categoryData.categoryName) {
        formData.append('name', categoryData.categoryName);
      }
      
      // Only append image if it's a new file (not old image path)
      if (categoryData.image && categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
      }
      
      if (categoryData.status) {
        formData.append('status', categoryData.status);
      }
      
      const response = await api.patch(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Update Category Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Category Error:', error);
      throw error;
    }
  }
};

// SubCategories API
export const subCategoriesAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/sub-categories', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('SubCategories API Error:', error);
      throw error;
    }
  },

  getByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/sub-categories?categoryId=${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Get SubCategories by Category Error:', error);
      throw error;
    }
  },

  create: async (subCategoryData) => {
    try {
      const formData = new FormData();
      
      // Add fields to FormData
      if (subCategoryData.name) {
        formData.append('name', subCategoryData.name);
      }
      
      if (subCategoryData.categoryId) {
        formData.append('categoryId', subCategoryData.categoryId);
      }
      
      if (subCategoryData.image) {
        formData.append('image', subCategoryData.image);
      }
      
      if (subCategoryData.status) {
        formData.append('status', subCategoryData.status);
      }
      
      const response = await api.post('/sub-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create SubCategory Error:', error);
      throw error;
    }
  },

  update: async (id, subCategoryData) => {
    try {
      const formData = new FormData();
      
      // Add fields to FormData
      if (subCategoryData.name) {
        formData.append('name', subCategoryData.name);
      }
      
      if (subCategoryData.categoryId) {
        formData.append('categoryId', subCategoryData.categoryId);
      }
      
      // Only append image if it's a new file (not old image path)
      if (subCategoryData.image && subCategoryData.image instanceof File) {
        formData.append('image', subCategoryData.image);
      }
      
      if (subCategoryData.status) {
        formData.append('status', subCategoryData.status);
      }
      
      const response = await api.patch(`/sub-categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Update SubCategory Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/sub-categories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete SubCategory Error:', error);
      throw error;
    }
  }
};

// Clients API
export const clientsAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/users/', {
        params: { page, limit, search, role: 'customer' }
      });
      return response.data;
    } catch (error) {
      console.error('Clients API Error:', error);
      throw error;
    }
  },

  create: async (clientData) => {
    try {
      // Check if there's a file to upload
      const hasFile = clientData.avatar && clientData.avatar instanceof File;
      
      if (hasFile) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add fields to FormData with correct field names
        if (clientData.firstName) {
          formData.append('firstName', clientData.firstName);
        }
        
        if (clientData.lastName) {
          formData.append('lastName', clientData.lastName);
        }
        
        if (clientData.email) {
          formData.append('email', clientData.email);
        }
        
        if (clientData.phone) {
          formData.append('phone', clientData.phone);
        }
        
        formData.append('avatar', clientData.avatar);
        
        if (clientData.accountStatus) {
          formData.append('accountStatus', clientData.accountStatus);
        }
        
        const response = await api.post('/users/clients', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response;
      } else {
        // Use JSON for regular creation without files
        const jsonData = {};
        
        if (clientData.firstName) {
          jsonData.firstName = clientData.firstName;
        }
        
        if (clientData.lastName) {
          jsonData.lastName = clientData.lastName;
        }
        
        if (clientData.email) {
          jsonData.email = clientData.email;
        }
        
        if (clientData.phone) {
          jsonData.phone = clientData.phone;
        }
        
        if (clientData.accountStatus) {
          jsonData.accountStatus = clientData.accountStatus;
        }
        
        const response = await api.post('/users/clients', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      }
    } catch (error) {
      console.error('Create Client Error:', error);
      throw error;
    }
  },

  update: async (id, clientData) => {
    try {
      // Check if there's a file to upload
      const hasFile = clientData.avatar && clientData.avatar instanceof File;
      
      if (hasFile) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add fields to FormData with correct field names
        if (clientData.firstName) {
          formData.append('firstName', clientData.firstName);
        }
        
        if (clientData.lastName) {
          formData.append('lastName', clientData.lastName);
        }
        
        if (clientData.email) {
          formData.append('email', clientData.email);
        }
        
        if (clientData.phone) {
          formData.append('phone', clientData.phone);
        }
        
        formData.append('avatar', clientData.avatar);
        
        if (clientData.accountStatus) {
          formData.append('accountStatus', clientData.accountStatus);
        }
        
        const response = await api.patch(`/users/clients/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response;
      } else {
        // Use JSON for regular updates without files
        const jsonData = {};
        
        if (clientData.firstName) {
          jsonData.firstName = clientData.firstName;
        }
        
        if (clientData.lastName) {
          jsonData.lastName = clientData.lastName;
        }
        
        if (clientData.email) {
          jsonData.email = clientData.email;
        }
        
        if (clientData.phone) {
          jsonData.phone = clientData.phone;
        }
        
        if (clientData.accountStatus) {
          jsonData.accountStatus = clientData.accountStatus;
        }
        
        const response = await api.patch(`/users/clients/${id}`, jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      }
    } catch (error) {
      console.error('Update Client Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Client Error:', error);
      throw error;
    }
  }
};

// Partners API
export const partnersAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/users', {
        params: { page, limit, search, role: 'partner' }
      });
      return response.data;
    } catch (error) {
      console.error('Partners API Error:', error);
      throw error;
    }
  },

  create: async (partnerData) => {
    try {
      const response = await api.post('/users', partnerData);
      return response;
    } catch (error) {
      console.error('Create Partner Error:', error);
      throw error;
    }
  },

  update: async (id, partnerData) => {
    try {
      const response = await api.patch(`/users/${id}`, partnerData);
      return response;
    } catch (error) {
      console.error('Update Partner Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Partner Error:', error);
      throw error;
    }
  }
};

// Services API
export const servicesAPI = {
  getAll: async (page = 1, limit , search = '', subCategoryId = '') => {
    try {
      const response = await api.get('/services', {
        params: { page, limit, search, subCategoryId }
      });
      return response.data;
    } catch (error) {
      console.error('Services API Error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Service Error:', error);
      throw error;
    }
  },

  getBySubCategory: async (subCategoryId) => {
    try {
      const response = await api.get(`/services/sub-category/${subCategoryId}`);
      return response.data;
    } catch (error) {
      console.error('Get Services by SubCategory Error:', error);
      throw error;
    }
  },

  create: async (serviceData) => {
    try {
      const formData = new FormData();
      
      // Match backend controller field names exactly
      if (serviceData.service_name) {
        formData.append('serviceName', serviceData.service_name);
      }
      
      if (serviceData.price) {
        formData.append('price', serviceData.price);
      }
      
      if (serviceData.sale_price) {
        formData.append('salePrice', serviceData.sale_price);
      }
      
      if (serviceData.category_id) {
        formData.append('categoryId', serviceData.category_id);
      }
      
      if (serviceData.sub_category_id) {
        formData.append('subCategoryId', serviceData.sub_category_id);
      }
      
      if (serviceData.status) {
        formData.append('status', serviceData.status);
      }
      
      if (serviceData.service_details) {
        formData.append('serviceDescription', serviceData.service_details);
      }
      
      if (serviceData.service_included) {
        formData.append('serviceIncluded', serviceData.service_included);
      }
      
      if (serviceData.service_excluded) {
        formData.append('serviceExcluded', serviceData.service_excluded);
      }
      
      // Add image if selected
      if (serviceData.image) {
        formData.append('serviceImage', serviceData.image);
      }
      
      const response = await api.post('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create Service Error:', error);
      throw error;
    }
  },

  update: async (id, serviceData) => {
    try {
      const formData = new FormData();
      
      // Match backend controller field names exactly
      if (serviceData.service_name) {
        formData.append('serviceName', serviceData.service_name);
      }
      
      if (serviceData.price) {
        formData.append('price', serviceData.price);
      }
      
      if (serviceData.sale_price) {
        formData.append('salePrice', serviceData.sale_price);
      }
      
      if (serviceData.category_id) {
        formData.append('categoryId', serviceData.category_id);
      }
      
      if (serviceData.sub_category_id) {
        formData.append('subCategoryId', serviceData.sub_category_id);
      }
      
      if (serviceData.status) {
        formData.append('status', serviceData.status);
      }
      
      if (serviceData.service_details) {
        formData.append('serviceDescription', serviceData.service_details);
      }
      
      if (serviceData.service_included) {
        formData.append('serviceIncluded', serviceData.service_included);
      }
      
      if (serviceData.service_excluded) {
        formData.append('serviceExcluded', serviceData.service_excluded);
      }
      
      // Only append image if it's a new file (not old image path)
      if (serviceData.image && serviceData.image instanceof File) {
        formData.append('serviceImage', serviceData.image);
      }
      
      const response = await api.patch(`/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Update Service Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Service Error:', error);
      throw error;
    }
  }
};

// Packages API
export const packagesAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/packages', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Packages API Error:', error);
      throw error;
    }
  },

  create: async (packageData) => {
    try {
      const response = await api.post('/packages', packageData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Create Package Error:', error);
      throw error;
    }
  },

  update: async (id, packageData) => {
    try {
      const response = await api.patch(`/packages/${id}`, packageData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Update Package Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/packages/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Package Error:', error);
      throw error;
    }
  }
};

// Bookings API (Leads)
export const bookingsAPI = {
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const response = await api.get('/bookings', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Bookings API Error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Booking Error:', error);
      throw error;
    }
  }
};
