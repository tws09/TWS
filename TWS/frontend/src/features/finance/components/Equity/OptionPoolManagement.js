import React, { useState } from 'react';
import { useTheme } from '../../../../app/providers/ThemeContext';
import {
  ChartPieIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const OptionPoolManagement = ({ pools, shareClasses, onRefresh }) => {
  const { isDarkMode } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const calculateUtilization = (pool) => {
    if (!pool.poolSize || pool.poolSize === 0) return 0;
    return ((pool.grantedShares + pool.reservedShares) / pool.poolSize) * 100;
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Option Pools</h2>
          <p className="text-gray-500">Manage employee stock option pools</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          Create Pool
        </button>
      </div>

      {pools.length === 0 ? (
        <div className="text-center py-12">
          <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No option pools found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => {
            const utilization = calculateUtilization(pool);
            return (
              <div
                key={pool._id}
                className={`p-6 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{pool.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-1 rounded ${
                        isDarkMode
                          ? 'text-blue-400 hover:bg-gray-600'
                          : 'text-blue-600 hover:bg-gray-200'
                      }`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-1 rounded ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-gray-600'
                          : 'text-red-600 hover:bg-gray-200'
                      }`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Pool Size</span>
                      <span className="text-sm font-semibold">
                        {pool.poolSize.toLocaleString()} shares
                      </span>
                    </div>
                    <div
                      className={`h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`h-2 rounded-full ${
                          utilization >= 90
                            ? 'bg-red-500'
                            : utilization >= 70
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Available</p>
                      <p className="text-lg font-semibold text-green-600">
                        {pool.availableShares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Granted</p>
                      <p className="text-lg font-semibold">
                        {pool.grantedShares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reserved</p>
                      <p className="text-lg font-semibold">
                        {pool.reservedShares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Utilization</p>
                      <p className={`text-lg font-semibold ${getUtilizationColor(utilization)}`}>
                        {utilization.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {pool.shareClassId && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-500">Share Class</p>
                      <p className="text-sm font-semibold">
                        {pool.shareClassId.name} ({pool.shareClassId.type})
                      </p>
                    </div>
                  )}

                  {pool.expirationDate && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-500">Expiration</p>
                      <p className="text-sm font-semibold">
                        {new Date(pool.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OptionPoolManagement;

