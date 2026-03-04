// API Service with Mock Data for testing

const API_BASE_URL = 'http://localhost:3000/api';

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
  getAll: async (page = 1, limit = 10, search = '') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock data based on search and pagination
    let filteredData = mockStories;
    if (search) {
      filteredData = filteredData.filter(story => 
        story.image.toLowerCase().includes(search.toLowerCase()) ||
        story.date.toLowerCase().includes(search.toLowerCase())
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

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const story = mockStories.find(s => s.id === id);
    return {
      data: story
    };
  },

  create: async (storyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newStory = {
      id: mockStories.length + 1,
      date: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      image: new Date().getFullYear().toString(),
      status: 'On',
      ...storyData
    };
    mockStories.push(newStory);
    return {
      data: newStory,
      message: 'Story created successfully'
    };
  },

  update: async (id, storyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockStories.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStories[index] = { ...mockStories[index], ...storyData };
    }
    return {
      data: mockStories[index],
      message: 'Story updated successfully'
    };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockStories.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStories.splice(index, 1);
    }
    return {
      message: 'Story deleted successfully'
    };
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

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: mockDashboardStats
    };
  }
};
