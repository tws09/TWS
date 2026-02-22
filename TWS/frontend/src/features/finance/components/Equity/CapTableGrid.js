import React, { useState } from 'react';
import { useTheme } from '../../../../app/providers/ThemeContext';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CapTableGrid = ({ capTable, shareClasses, equityHolders, onRefresh }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ownershipPercent', direction: 'desc' });
  const [selectedHolder, setSelectedHolder] = useState(null);

  const filteredCapTable = capTable.filter(holder =>
    holder.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holder.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCapTable = [...filteredCapTable].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getTypeColor = (type) => {
    const colors = {
      founder: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      cofounder: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      investor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      advisor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="wolfstack-card-premium">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="wolfstack-heading-3 text-gray-900 dark:text-white">Cap Table</h3>
            <button
              className="wolfstack-button-primary px-4 py-2 flex items-center gap-2 text-sm"
            >
              <PlusIcon className="h-5 w-5" />
              Add Holder
            </button>
          </div>
          
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search holders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* Cap Table */}
      <div className="wolfstack-card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('holderName')}
                >
                  <div className="flex items-center gap-2">
                    Holder Name
                    {sortConfig.key === 'holderName' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortConfig.key === 'type' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('shares')}
                >
                  <div className="flex items-center gap-2">
                    Shares
                    {sortConfig.key === 'shares' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('ownershipPercent')}
                >
                  <div className="flex items-center gap-2">
                    Ownership %
                    {sortConfig.key === 'ownershipPercent' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                {capTable[0]?.fullyDilutedPercent !== undefined && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Fully Diluted %
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sortedCapTable.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No equity holders found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          Try adjusting your search terms
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCapTable.map((holder, index) => (
                  <tr
                    key={holder.holderId || index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isDarkMode ? 'bg-gray-900' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {holder.holderName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(holder.type)}`}>
                        {holder.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {holder.shares.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {holder.ownershipPercent}%
                        </div>
                        <div className={`h-2 w-16 rounded-full ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                            style={{ width: `${holder.ownershipPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {holder.fullyDilutedPercent !== undefined && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {holder.fullyDilutedPercent?.toFixed(2)}%
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'text-blue-400 hover:bg-gray-700'
                              : 'text-blue-600 hover:bg-gray-100'
                          }`}
                          title="View Details"
                          onClick={() => setSelectedHolder(holder)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'text-purple-400 hover:bg-gray-700'
                              : 'text-purple-600 hover:bg-gray-100'
                          }`}
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'text-red-400 hover:bg-gray-700'
                              : 'text-red-600 hover:bg-gray-100'
                          }`}
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={`border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Total</td>
                <td></td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {sortedCapTable.reduce((sum, h) => sum + (h.shares || 0), 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {sortedCapTable.reduce((sum, h) => sum + (h.ownershipPercent || 0), 0).toFixed(2)}%
                </td>
                {capTable[0]?.fullyDilutedPercent !== undefined && <td></td>}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Holder Details Modal */}
      {selectedHolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`wolfstack-card-premium max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="wolfstack-heading-3 text-gray-900 dark:text-white">
                  {selectedHolder.holderName}
                </h3>
                <button
                  onClick={() => setSelectedHolder(null)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedHolder.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Shares</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedHolder.shares.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ownership Percentage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedHolder.ownershipPercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapTableGrid;
