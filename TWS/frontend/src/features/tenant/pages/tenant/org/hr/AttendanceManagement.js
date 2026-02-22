import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';

const AttendanceManagement = () => {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (tenantSlug) fetchAttendanceData();
    else setLoading(false);
  }, [tenantSlug, selectedDate]);

  const fetchAttendanceData = async () => {
    if (!tenantSlug) return;
    try {
      setLoading(true);
      const data = await tenantApiService.getAttendanceData(tenantSlug, { date: selectedDate });
      if (data && (data.records || data.summary)) {
        setAttendanceData({
          records: data.records || [],
          summary: data.summary || { present: 0, absent: 0, late: 0, total: 0 }
        });
      } else {
        setAttendanceData({ records: [], summary: { present: 0, absent: 0, late: 0, total: 0 } });
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setAttendanceData({ records: [], summary: { present: 0, absent: 0, late: 0, total: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (employeeId, checkInData = {}) => {
    try {
      await tenantApiService.checkIn(tenantSlug, employeeId, checkInData);
      alert('Check-in recorded successfully!');
      fetchAttendanceData();
    } catch (error) {
      console.error('Error recording check-in:', error);
      alert(error?.message || 'Failed to record check-in. Please try again.');
    }
  };

  const handleCheckOut = async (employeeId, checkOutData = {}) => {
    try {
      await tenantApiService.checkOut(tenantSlug, employeeId, checkOutData);
      alert('Check-out recorded successfully!');
      fetchAttendanceData();
    } catch (error) {
      console.error('Error recording check-out:', error);
      alert(error?.message || 'Failed to record check-out. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      const from = selectedDate;
      const to = selectedDate;
      const reports = await tenantApiService.getAttendanceReports(tenantSlug, { from, to });
      if (!reports || !reports.records) {
        alert('No report data to export.');
        return;
      }
      const headers = ['Date', 'Employee', 'Status', 'Check In', 'Check Out', 'Hours', 'Notes'];
      const rows = (reports.records || []).map((r) => {
        const name = r.userId?.fullName || r.userId?.email || r.employeeId || '—';
        const checkIn = r.checkIn?.timestamp ? new Date(r.checkIn.timestamp).toLocaleTimeString() : '—';
        const checkOut = r.checkOut?.timestamp ? new Date(r.checkOut.timestamp).toLocaleTimeString() : '—';
        const hours = r.durationMinutes != null ? (r.durationMinutes / 60).toFixed(2) : '—';
        return [r.date, name, r.status || '—', checkIn, checkOut, hours, (r.checkIn?.notes || r.checkOut?.notes || '')];
      });
      const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance-${selectedDate}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
      alert(error?.message || 'Failed to export attendance.');
    }
  };

  const summary = attendanceData?.summary || {};
  const records = attendanceData?.records || [];
  const stats = [
    { label: 'Present Today', value: (summary.present ?? 0).toString(), icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Absent Today', value: (summary.absent ?? 0).toString(), icon: XCircleIcon, iconBg: 'bg-gradient-to-br from-red-500 to-pink-600' },
    { label: 'Late Today', value: (summary.late ?? 0).toString(), icon: ClockIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Total Employees', value: (summary.total ?? 0).toString(), icon: CalendarIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Attendance Management
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl text-sm font-medium"
          />
          <button type="button" onClick={handleExport} className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card-premium p-5 xl:p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-glow-lg`}>
                <stat.icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
          Attendance for {new Date(selectedDate).toLocaleDateString()}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
              {records.length > 0 ? (
                records.map((record) => {
                  const name = record.userId?.fullName || record.userId?.email || record.employeeId || '—';
                  const checkInTime = record.checkIn?.timestamp ? new Date(record.checkIn.timestamp).toLocaleTimeString() : '—';
                  const checkOutTime = record.checkOut?.timestamp ? new Date(record.checkOut.timestamp).toLocaleTimeString() : '—';
                  const hours = record.durationMinutes != null ? (record.durationMinutes / 60).toFixed(2) : '—';
                  const hasCheckedIn = !!record.checkIn?.timestamp;
                  const hasCheckedOut = !!record.checkOut?.timestamp;
                  const employeeId = record.employeeId || record.userId?._id;
                  return (
                    <tr key={record._id || record.userId?._id || record.employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' || record.status === 'work-from-home' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          record.status === 'late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {record.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{checkInTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{checkOutTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{hours}</td>
                      <td className="px-4 py-3">
                        {employeeId && (
                          <span className="flex items-center gap-2">
                            {!hasCheckedIn && (
                              <button type="button" onClick={() => handleCheckIn(employeeId, {})} className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">
                                Check In
                              </button>
                            )}
                            {hasCheckedIn && !hasCheckedOut && (
                              <button type="button" onClick={() => handleCheckOut(employeeId, {})} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                                Check Out
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    No attendance records for this date.
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

export default AttendanceManagement;
