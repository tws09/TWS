// Mock authentication setup utilities
export const setupMockAuth = () => {
  // Mock authentication setup for development
  console.log('Mock authentication setup initialized');
  
  return {
    isAuthenticated: true,
    user: {
      id: 'mock-user-id',
      email: 'admin@tws.com',
      role: 'super_admin'
    }
  };
};

export default setupMockAuth;