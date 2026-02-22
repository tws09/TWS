import React, { useState } from 'react';
import { useTheme } from '../../../../app/providers/ThemeContext';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  CalculatorIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const DilutionSimulator = ({ currentHoldings, onSimulate }) => {
  const { isDarkMode } = useTheme();
  const [simulationMode, setSimulationMode] = useState('targetPercent'); // 'targetPercent' or 'newShares'
  const [formData, setFormData] = useState({
    targetPercent: 20,
    newShares: 0,
    amount: 0,
    preMoneyValuation: 0,
    investorName: 'New Investor',
    includeOptionPool: false,
    optionPoolSize: 0
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const payload = {
        investorName: formData.investorName,
        amount: formData.amount || undefined,
        preMoneyValuation: formData.preMoneyValuation || undefined
      };

      if (simulationMode === 'targetPercent') {
        payload.targetPercent = formData.targetPercent;
      } else {
        payload.newShares = formData.newShares;
      }

      if (formData.includeOptionPool) {
        payload.includeOptionPool = true;
        payload.optionPoolSize = formData.optionPoolSize;
      }

      const response = await axios.post('/api/equity/dilution/simulate', payload);
      
      if (response.data.success) {
        setSimulationResult(response.data.data.simulation);
      }
    } catch (error) {
      console.error('Error simulating dilution:', error);
      alert('Error simulating dilution. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricePerShare = () => {
    if (simulationResult?.newInvestment?.shares && simulationResult?.newInvestment?.amount) {
      return simulationResult.newInvestment.amount / simulationResult.newInvestment.shares;
    }
    return null;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Dilution Simulator</h2>
        <p className="text-gray-500">Simulate investment rounds and see dilution impact</p>
      </div>

      {/* Simulation Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Simulation Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="simulationMode"
              value="targetPercent"
              checked={simulationMode === 'targetPercent'}
              onChange={(e) => setSimulationMode(e.target.value)}
              className="mr-2"
            />
            Target Ownership %
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="simulationMode"
              value="newShares"
              checked={simulationMode === 'newShares'}
              onChange={(e) => setSimulationMode(e.target.value)}
              className="mr-2"
            />
            New Shares
          </label>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Investor Name</label>
          <input
            type="text"
            name="investorName"
            value={formData.investorName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {simulationMode === 'targetPercent' ? (
          <div>
            <label className="block text-sm font-medium mb-2">Target Ownership %</label>
            <input
              type="number"
              name="targetPercent"
              value={formData.targetPercent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">New Shares</label>
            <input
              type="number"
              name="newShares"
              value={formData.newShares}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Investment Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            min="0"
            step="1000"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pre-Money Valuation ($)</label>
          <input
            type="number"
            name="preMoneyValuation"
            value={formData.preMoneyValuation}
            onChange={handleInputChange}
            min="0"
            step="1000"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="includeOptionPool"
              checked={formData.includeOptionPool}
              onChange={handleInputChange}
              className="mr-2"
            />
            Include Option Pool
          </label>
          {formData.includeOptionPool && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-2">Option Pool Size (shares)</label>
              <input
                type="number"
                name="optionPoolSize"
                value={formData.optionPoolSize}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className={`w-full md:w-auto px-6 py-2 rounded-lg flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <CalculatorIcon className="h-5 w-5" />
        {loading ? 'Simulating...' : 'Simulate Dilution'}
      </button>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Simulation Results</h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pre-Money Shares</p>
              <p className="text-2xl font-bold mt-1">
                {simulationResult.preMoney.totalShares.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">New Shares</p>
              <p className="text-2xl font-bold mt-1">
                {simulationResult.newInvestment.shares.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Post-Money Shares</p>
              <p className="text-2xl font-bold mt-1">
                {simulationResult.postMoney.totalShares.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investor Ownership</p>
              <p className="text-2xl font-bold mt-1">
                {simulationResult.newInvestment.ownershipPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {calculatePricePerShare() && (
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price Per Share</p>
              <p className="text-2xl font-bold mt-1">${calculatePricePerShare().toFixed(4)}</p>
            </div>
          )}

          {/* Dilution Chart */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Ownership Before vs After</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={simulationResult.capTable.filter(h => !h.isNew)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="holderName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="preMoneyPercent" fill="#3b82f6" name="Pre-Money %" />
                <Bar dataKey="postMoneyPercent" fill="#10b981" name="Post-Money %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dilution Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="px-4 py-2 text-left">Holder</th>
                  <th className="px-4 py-2 text-left">Pre-Money %</th>
                  <th className="px-4 py-2 text-left">Post-Money %</th>
                  <th className="px-4 py-2 text-left">Dilution</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.capTable.map((holder, index) => (
                  <tr
                    key={index}
                    className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <td className="px-4 py-2">{holder.holderName}</td>
                    <td className="px-4 py-2">{holder.preMoneyPercent?.toFixed(2)}%</td>
                    <td className="px-4 py-2">{holder.postMoneyPercent?.toFixed(2)}%</td>
                    <td className="px-4 py-2">
                      <span className={holder.dilution > 0 ? 'text-red-600' : 'text-gray-600'}>
                        {holder.dilution > 0 ? '-' : ''}{holder.dilution?.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DilutionSimulator;

