import { useState, useEffect } from 'react';
import {
  storiesAPI,
  usersAPI,
  localitiesAPI,
  bannersAPI,
  dashboardAPI,
  statesAPI,
  citiesAPI,
  categoriesAPI,
  subCategoriesAPI,
} from '../services/api';

// Reusable debounce hook so search inputs don't fire API queries on every keystroke
export const useDebounce = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

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

// Specific hooks for different data types (with automatic 350ms search debounce)
export const useStories = (page = 1, limit = 25, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => storiesAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
};

export const useUsers = (page = 1, limit = 10, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => usersAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
};

export const useLocalities = (page = 1, limit = 25, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => localitiesAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
};

export const useBanners = (page = 1, limit = 25, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => bannersAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
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
      if (stateId && stateId !== '') {
        return citiesAPI.getByState(stateId);
      }
      return Promise.resolve({ data: [] });
    },
    [stateId]
  );
};

// Categories and SubCategories hooks
export const useCategories = (page = 1, limit = 25, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => categoriesAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
};

export const useSubCategories = (page = 1, limit = 25, search = '') => {
  const debouncedSearch = useDebounce(search, 350);
  return useApi(() => subCategoriesAPI.getAll(page, limit, debouncedSearch), [page, limit, debouncedSearch]);
};
