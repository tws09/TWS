import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Software House ERP
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Project management, HR, finance, and operations for software companies
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link 
              to="/software-house-signup" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg"
            >
              Get Started
            </Link>
            <Link 
              to="/software-house-login" 
              className="bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
          
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/software-house" className="text-indigo-600 hover:underline">Software House</Link>
              <Link to="/login" className="text-gray-600 hover:underline">Admin Login</Link>
              <Link to="/supra-admin-login" className="text-gray-600 hover:underline">Supra Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
