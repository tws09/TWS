/**
 * Custom Hook for Filter Management
 * Provides reusable filter state and logic
 */

import { useState, useMemo, useCallback } from 'react';

/**
 * Generic filter hook for managing filter state
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' || value === null ? undefined : value
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(newFilters).map(([key, value]) => [
          key,
          value === '' || value === null ? undefined : value
        ])
      )
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    ).length;
  }, [filters]);

  return {
    filters: {
      ...filters,
      ...(searchTerm && { search: searchTerm })
    },
    searchTerm,
    setSearchTerm,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    activeFilters
  };
};

/**
 * Hook for project filtering
 */
export const useProjectFilters = () => {
  return useFilters({
    status: undefined,
    priority: undefined,
    clientId: undefined,
    search: undefined
  });
};

/**
 * Hook for task filtering
 */
export const useTaskFilters = () => {
  return useFilters({
    status: undefined,
    priority: undefined,
    projectId: undefined,
    assigneeId: undefined,
    type: undefined,
    search: undefined
  });
};

/**
 * Hook for milestone filtering
 */
export const useMilestoneFilters = () => {
  return useFilters({
    status: undefined,
    projectId: undefined,
    upcoming: undefined,
    search: undefined
  });
};

/**
 * Hook for resource filtering
 */
export const useResourceFilters = () => {
  return useFilters({
    role: undefined,
    department: undefined,
    availability: undefined,
    search: undefined
  });
};

