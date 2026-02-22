import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../../app/providers/AuthContext';
import { useTenantAuth } from '../../../../../../../app/providers/TenantAuthContext';
import toast from 'react-hot-toast';
import { tenantApiService } from '../../../../../../../shared/services/tenant/tenant-api.service';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

function mapRecord(record) {
  const date = record.date;
  const checkInTime = record.checkIn?.timestamp ? new Date(record.checkIn.timestamp) : null;
  const checkOutTime = record.checkOut?.timestamp ? new Date(record.checkOut.timestamp) : null;
  const hoursWorked = record.durationMinutes != null ? record.durationMinutes / 60 : null;
  const isLate = record.status === 'late';
  const notes = record.checkIn?.notes || record.checkOut?.notes;
  return {
    date,
    status: record.status || 'absent',
    checkInTime: checkInTime ? checkInTime.toISOString() : null,
    checkOutTime: checkOutTime ? checkOutTime.toISOString() : null,
    hoursWorked,
    isLate,
    notes
  };
}

const EmployeeAttendanceView = ({ tenantSlug }) => {
  const { user } = useAuth();
  const { user: tenantUser } = useTenantAuth();
  const effectiveUser = tenantUser || user;
  const employeeId = effectiveUser?.employeeId || effectiveUser?.id || effectiveUser?._id;

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onTime: 0,
    totalDays: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (tenantSlug && employeeId) {
      fetchAttendance();
      fetchToday();
    } else setLoading(false);
  }, [tenantSlug, employeeId, selectedMonth]);

  const fetchToday = async () => {
    if (!tenantSlug || !employeeId) return;
    try {
      const data = await tenantApiService.getAttendanceData(tenantSlug, { date: todayDate, employeeId });
      const records = data?.records || [];
      setTodayRecord(records[0] || null);
    } catch (e) {
      setTodayRecord(null);
    }
  };

  const fetchAttendance = async () => {
    if (!tenantSlug || !employeeId) return;
    try {
      setLoading(true);
      const data = await tenantApiService.getAttendanceData(tenantSlug, {
        employeeId,
        month: selectedMonth
      });
      const records = (data?.records || []).map(mapRecord);
      setAttendance(records);
      calculateStats(records);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance');
      setAttendance([]);
      setStats({ present: 0, absent: 0, late: 0, onTime: 0, totalDays: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!tenantSlug || !employeeId || punchLoading) return;
    setPunchLoading(true);
    try {
      await tenantApiService.checkIn(tenantSlug, employeeId, {});
      toast.success('Check-in recorded');
      await fetchToday();
      fetchAttendance();
    } catch (err) {
      toast.error(err?.message || 'Check-in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!tenantSlug || !employeeId || punchLoading) return;
    setPunchLoading(true);
    try {
      await tenantApiService.checkOut(tenantSlug, employeeId, {});
      toast.success('Check-out recorded');
      await fetchToday();
      fetchAttendance();
    } catch (err) {
      toast.error(err?.message || 'Check-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const calculateStats = (records) => {
    const next = {
      present: 0,
      absent: 0,
      late: 0,
      onTime: 0,
      totalDays: records.length
    };
    records.forEach((record) => {
      if (record.status === 'present' || record.status === 'work-from-home') {
        next.present++;
        if (record.isLate) next.late++;
        else if (record.checkInTime) next.onTime++;
      } else if (record.status === 'absent') next.absent++;
    });
    setStats(next);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'present') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isLate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {isLate ? 'Late' : 'Present'}
        </span>
      );
    } else if (status === 'absent') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Absent
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const hasCheckedIn = todayRecord?.checkIn?.timestamp;
  const hasCheckedOut = todayRecord?.checkOut?.timestamp;
  const canPunch = !todayRecord?.employeeInfo?.isAttendanceExempt && todayRecord?.employeeInfo?.attendanceCategory !== 'exempt';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Attendance</h2>
          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Today: Mark attendance (check-in / check-out) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Check In:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {hasCheckedIn ? formatTime(todayRecord.checkIn.timestamp) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <StopIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Check Out:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {hasCheckedOut ? formatTime(todayRecord.checkOut.timestamp) : '—'}
            </span>
          </div>
          {canPunch && (
            <div className="flex items-center gap-2">
              {!hasCheckedIn && (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={punchLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <PlayIcon className="w-5 h-5" />
                  {punchLoading ? 'Recording…' : 'Check In'}
                </button>
              )}
              {hasCheckedIn && !hasCheckedOut && (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={punchLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <StopIcon className="w-5 h-5" />
                  {punchLoading ? 'Recording…' : 'Check Out'}
                </button>
              )}
            </div>
          )}
          {todayRecord?.employeeInfo?.isAttendanceExempt && (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Exempt — no daily punch required</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.length > 0 ? (
                attendance.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status, record.isLate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hoursWorked ? `${record.hoursWorked.toFixed(2)} hrs` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found for this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceView;
