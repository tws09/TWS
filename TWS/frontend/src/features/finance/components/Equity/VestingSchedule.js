import React, { useState } from 'react';
import { useTheme } from '../../../../app/providers/ThemeContext';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const VestingSchedule = ({ schedules, onRefresh }) => {
  const { isDarkMode } = useTheme();
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (schedule) => {
    if (!schedule.vestingInfo) return 0;
    return schedule.vestingInfo.vestedPercent || 0;
  };

  const getStatusColor = (schedule) => {
    if (schedule.status === 'completed') return 'bg-green-500';
    if (schedule.status === 'cancelled') return 'bg-red-500';
    if (schedule.status === 'accelerated') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Vesting Schedules</h2>
        <p className="text-gray-500">Track equity vesting progress and milestones</p>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No vesting schedules found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{schedule.name}</h3>
                  <p className="text-sm text-gray-500">
                    {schedule.holderId?.name || 'Unknown Holder'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      schedule
                    )} text-white`}
                  >
                    {schedule.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Shares</p>
                  <p className="text-lg font-semibold">{schedule.totalShares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vested Shares</p>
                  <p className="text-lg font-semibold text-green-600">
                    {schedule.vestingInfo?.vestedShares?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unvested Shares</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {schedule.vestingInfo?.unvestedShares?.toLocaleString() || schedule.totalShares}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vested %</p>
                  <p className="text-lg font-semibold">
                    {schedule.vestingInfo?.vestedPercent?.toFixed(2) || 0}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Vesting Progress</span>
                  <span className="text-sm font-semibold">
                    {calculateProgress(schedule).toFixed(2)}%
                  </span>
                </div>
                <div
                  className={`h-2 rounded-full ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${calculateProgress(schedule)}%` }}
                  />
                </div>
              </div>

              {/* Vesting Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Grant Date</p>
                  <p className="font-semibold">{formatDate(schedule.grantDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cliff</p>
                  <p className="font-semibold">{schedule.cliffMonths} months</p>
                </div>
                <div>
                  <p className="text-gray-500">Vesting Period</p>
                  <p className="font-semibold">{schedule.vestingMonths} months</p>
                </div>
                <div>
                  <p className="text-gray-500">Vesting Type</p>
                  <p className="font-semibold capitalize">{schedule.vestingType}</p>
                </div>
              </div>

              {schedule.vestingInfo && !schedule.vestingInfo.cliffReached && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Cliff not yet reached. {schedule.vestingInfo.monthsUntilCliff} months remaining.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VestingSchedule;

