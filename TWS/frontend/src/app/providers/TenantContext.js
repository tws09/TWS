import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load tenant data from localStorage or API
    const loadTenantData = async () => {
      try {
        setLoading(true);
        
        // Try to get tenant from localStorage first
        const savedTenant = localStorage.getItem('currentTenant');
        if (savedTenant) {
          setTenant(JSON.parse(savedTenant));
        }
        
        // You can also fetch fresh tenant data from API here
        // const tenantData = await tenantApiService.getCurrentTenant();
        // setTenant(tenantData);
        
      } catch (err) {
        console.error('Error loading tenant data:', err);
        setError('Failed to load tenant data');
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, []);

  const switchTenant = async (newTenant) => {
    try {
      setLoading(true);
      setError(null);
      
      // Save to localStorage
      localStorage.setItem('currentTenant', JSON.stringify(newTenant));
      setTenant(newTenant);
      
      // You can also update the API here
      // await tenantApiService.switchTenant(newTenant.id);
      
    } catch (err) {
      console.error('Error switching tenant:', err);
      setError('Failed to switch tenant');
    } finally {
      setLoading(false);
    }
  };

  const updateTenant = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedTenant = { ...tenant, ...updates };
      localStorage.setItem('currentTenant', JSON.stringify(updatedTenant));
      setTenant(updatedTenant);
      
      // You can also update the API here
      // await tenantApiService.updateTenant(tenant.id, updates);
      
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError('Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  const clearTenant = () => {
    localStorage.removeItem('currentTenant');
    setTenant(null);
  };

  const value = {
    tenant,
    loading,
    error,
    switchTenant,
    updateTenant,
    clearTenant,
    setTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;
