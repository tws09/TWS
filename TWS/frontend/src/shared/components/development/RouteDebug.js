import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteDebug = () => {
  const location = useLocation();
  
  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm z-50">
      <h3 className="font-bold mb-2">Route Debug</h3>
      <p><strong>Current Path:</strong> {location.pathname}</p>
      <p><strong>Search:</strong> {location.search}</p>
      <p><strong>Hash:</strong> {location.hash}</p>
      <p><strong>State:</strong> {JSON.stringify(location.state)}</p>
    </div>
  );
};

export default RouteDebug;
