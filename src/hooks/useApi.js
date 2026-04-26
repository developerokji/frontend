import { useState, useEffect, useCallback } from 'react';
import { storiesAPI, usersAPI, localitiesAPI, bannersAPI, dashboardAPI, statesAPI, citiesAPI, categoriesAPI, subCategoriesAPI, authAPI } from '../services/api';

// Custom hook for API data management
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      console.log('API call with args:', args); // Debug log
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
export const useStories = (page = 1, limit, search = '') => {
  return useApi(() => storiesAPI.getAll(page, limit, search),[page, limit, search]);
};

export const useUsers = (page = 1, limit = 10, search = '') => {
  return useApi(usersAPI.getAll, [page, limit, search]);
};

export const useLocalities = (page = 1, limit = 10, search = '') => {
  console.log('useLocalities called with:', { page, limit, search });
  return useApi(() => localitiesAPI.getAll(page, limit, search), [page, limit, search]);
};

export const useBanners = (page = 1, limit = 10, search = '') => {
  return useApi(() => bannersAPI.getAll(page, limit, search), [page, limit, search]);
};

export const useDashboardStats = () => {
  return useApi(dashboardAPI.getStats, []);
};

// States and Cities hooks
export const useStates = () => {
  return useApi(statesAPI.getAll, []);
};

export const useCities = (stateId) => {
  return useApi(
    () => {
      // Only make API call if stateId is provided and not empty
      if (stateId && stateId !== '') {
        return citiesAPI.getByState(stateId);
      }
      // Return empty data when no stateId
      return Promise.resolve({ data: [] });
    },
    [stateId] // Always include stateId in dependencies
  );
};

// Categories and SubCategories hooks
export const useCategories = (page = 1, limit = 10, search = '') => {
  return useApi(() => categoriesAPI.getAll(page, limit, search), [page, limit, search]);
};

export const useSubCategories = (page = 1, limit = 10, search = '') => {
  return useApi(() => subCategoriesAPI.getAll(page, limit, search), [page, limit, search]);
};
