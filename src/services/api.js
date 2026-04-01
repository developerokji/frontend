// API Service with Mock Data for testing

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
  { id: 1, title: 'Summer Sale Banner', description: 'Get 50% off on all summer collection items. Limited time offer!', status: 'Active', createdAt: '2024-01-15' },
  { id: 2, title: 'New Year Special', description: 'Celebrate New Year with amazing discounts and special offers on all products.', status: 'Active', createdAt: '2024-01-10' },
  { id: 3, title: 'Welcome Banner', description: 'Welcome to our amazing platform. Explore our features and services.', status: 'Inactive', createdAt: '2024-01-05' }
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

// Localities API
export const localitiesAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = mockLocalities;
    if (search) {
      filteredData = filteredData.filter(locality => 
        locality.name.toLowerCase().includes(search.toLowerCase()) ||
        locality.code.toLowerCase().includes(search.toLowerCase())
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
  }
};

// Banners API
export const bannersAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = mockBanners;
    if (search) {
      filteredData = filteredData.filter(banner => 
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
        banner.description.toLowerCase().includes(search.toLowerCase())
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
