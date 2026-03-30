import { useState, useEffect } from 'react';
import { storiesAPI, usersAPI, localitiesAPI, bannersAPI, dashboardAPI } from '../services/api';

// Custom hook for API data management
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result.data || result);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};

// Specific hooks for different data types
export const useStories = (page = 1, limit = 10, search = '') => {
  return useApi(storiesAPI.getAll, [page, limit, search]);
};

export const useUsers = (page = 1, limit = 10, search = '') => {
  return useApi(usersAPI.getAll, [page, limit, search]);
};

export const useLocalities = (page = 1, limit = 10, search = '') => {
  return useApi(localitiesAPI.getAll, [page, limit, search]);
};

export const useBanners = (page = 1, limit = 10, search = '') => {
  return useApi(bannersAPI.getAll, [page, limit, search]);
};

export const useDashboardStats = () => {
  return useApi(dashboardAPI.getStats, []);
};
