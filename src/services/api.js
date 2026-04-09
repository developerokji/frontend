import { api } from './apiClient';

// Mock data for testing
const mockStories = [
  { id: 1, date: '04 Jan 2026 07:33 PM', image: '2026' },
  { id: 2, date: '03 Jan 2026 02:15 PM', image: '2025',},
  { id: 3, date: '02 Jan 2026 11:45 AM', image: '2024',},
  { id: 4, date: '01 Jan 2026 09:20 AM', image: '2023' },
  { id: 5, date: '31 Dec 2025 04:15 PM', image: '2022',},
  { id: 6, date: '30 Dec 2025 11:30 PM', image: '2021',},
  { id: 7, date: '29 Dec 2025 08:45 PM', image: '2020' },
  { id: 8, date: '28 Dec 2025 05:20 PM', image: '2019',}
];

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15', stories: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', joinDate: '2024-02-20', stories: 8 },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Inactive', joinDate: '2024-03-10', stories: 2 }
];

const mockLocalities = [
  { id: 1, name: 'Downtown Area', state: 'California', city: 'Los Angeles', stories: 8, users: 45 },
  { id: 2, name: 'North District', state: 'New York', city: 'New York City', stories: 5, users: 32 },
  { id: 3, name: 'East Zone', state: 'Texas', city: 'Houston', stories: 2, users: 18 }
];

const mockBanners = [
  { 
    id: 1, 
    banner_title: 'electricain', 
    banner_desc: 'service',
    banner_img: 'electricain.jpeg',
    banner_img_path: 'assets/images/banner/',
    category_id: 1,
    sub_category_id: 22,
    service_id: 48,
    status: 'on',
    is_visible: 'up',
    created_at: '2025-11-05T16:48:42.000Z'
  },
  { 
    id: 2, 
    banner_title: 'ac', 
    banner_desc: 'about ac',
    banner_img: 'ac.jpeg',
    banner_img_path: 'assets/images/banner/',
    category_id: 6,
    sub_category_id: 32,
    service_id: 146,
    status: 'on',
    is_visible: 'up',
    created_at: '2025-11-05T16:36:21.000Z'
  }
];

const mockDashboardStats = {
  totalStories: 24,
  activeUsers: 156,
  localities: 8,
  totalViews: 1200,
  storiesChange: '+3 this week',
  usersChange: '+12 this week',
  localitiesChange: '+2 this month',
  viewsChange: '+240 this week'
};

// Stories API
export const storiesAPI = {
  getAll: async (page = 1, limit, search = '') => {
    console.log('Fetching stories with params:', { page, limit, search });
    try {
      const response = await api.get('/v1/stories', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Stories API Error:', error);
      // Fallback to mock data
      let filteredData = mockStories;
      if (search) {
        filteredData = filteredData.filter(story => 
          story.date.toLowerCase().includes(search.toLowerCase()) ||
          story.image.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        total: filteredData.length,
        page: page,
        limit: limit
      };
    }
  },


  create: async (storyData) => {
    try {
      const response = await api.post('/v1/stories', storyData);
      return response;
    } catch (error) {
      console.error('Create Story Error:', error);
      return {
        data: {},
        message: error.message
      };
    }
  },

  update: async (id, storyData) => {
    try {
      const response = await api.patch(`/v1/stories/${id}`, storyData);
      return response;
    } catch (error) {
      console.error('Update Story Error:', error);
      // Fallback to mock
      return {
        data: {},
        message: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/v1/stories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Story Error:', error);
      // Fallback to mock
      const index = mockStories.findIndex(s => s.id === parseInt(id));
      if (index === -1) throw new Error('Story not found');
      
      mockStories.splice(index, 1);
      return {
        message: 'Story deleted successfully'
      };
    }
  }
};

// Users API
export const usersAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = mockUsers;
    if (search) {
      filteredData = filteredData.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      limit
    };
  },

  create: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      id: mockUsers.length + 1,
      joinDate: new Date().toISOString().split('T')[0],
      ...userData
    };
    mockUsers.push(newUser);
    return {
      data: newUser,
      message: 'User created successfully'
    };
  }
};

// States and Cities API
export const statesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/v1/states');
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
      const response = await api.get('/v1/cities', {
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
  getAll: async (page = 1, limit = 10, search = '') => {
    console.log('localitiesAPI.getAll called with:', { page, limit, search });
    try {
      const response = await api.get('/v1/localities', {
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
      const response = await api.post('/v1/localities', localityData);
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
      const response = await api.patch(`/v1/localities/${id}`, localityData);
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
      const response = await api.delete(`/v1/localities/${id}`);
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
  getAll: async (page = 1, limit = 10, search = '') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = mockBanners;
    if (search) {
      filteredData = filteredData.filter(banner => 
        banner.banner_title.toLowerCase().includes(search.toLowerCase()) ||
        banner.banner_desc.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      success: true,
      message: 'Banners fetched successfully',
      data: {
        items: paginatedData,
        meta: {
          totalItems: filteredData.length,
          currentPage: page,
          totalPages: Math.ceil(filteredData.length / limit),
          itemsPerPage: limit
        }
      }
    };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const banner = mockBanners.find(b => b.id === parseInt(id));
    if (!banner) {
      throw new Error('Banner not found');
    }
    return {
      data: banner
    };
  },

  create: async (bannerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBanner = {
      id: mockBanners.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      ...bannerData
    };
    mockBanners.push(newBanner);
    return {
      data: newBanner,
      message: 'Banner created successfully'
    };
  },

  update: async (id, bannerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBanners.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error('Banner not found');
    }
    
    mockBanners[index] = {
      ...mockBanners[index],
      ...bannerData
    };
    
    return {
      data: mockBanners[index],
      message: 'Banner updated successfully'
    };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBanners.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error('Banner not found');
    }
    
    mockBanners.splice(index, 1);
    return {
      message: 'Banner deleted successfully'
    };
  }
};
export const dashboardAPI = {
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: mockDashboardStats
    };
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/v1/categories', {
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
      
      const response = await api.post('/v1/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create Category Error:', error);
      return {
        data: {},
        message: error.message
      };
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
      
      const response = await api.patch(`/v1/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Update Category Error:', error);
      return {
        data: {},
        message: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/v1/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Category Error:', error);
      return {
        message: error.message
      };
    }
  }
};

// SubCategories API
export const subCategoriesAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/v1/sub-categories', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('SubCategories API Error:', error);
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
      
      const response = await api.post('/v1/sub-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create SubCategory Error:', error);
      return {
        data: {},
        message: error.message
      };
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
      
      const response = await api.patch(`/v1/sub-categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Update SubCategory Error:', error);
      return {
        data: {},
        message: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/v1/sub-categories/${id}`);
      return response;
    } catch (error) {
      console.error('Delete SubCategory Error:', error);
      return {
        message: error.message
      };
    }
  }
};
