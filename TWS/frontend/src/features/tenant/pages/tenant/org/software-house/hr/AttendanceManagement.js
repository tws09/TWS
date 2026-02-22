import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../../../../../app/providers/TenantAuthContext';

const CATEGORY_LABELS = {
  fixed_shift: 'Fixed Shift',
  flexible_shift: 'Flexible Shift',
  field_worker: 'Field Worker',
  remote_worker: 'Remote Worker',
  hybrid_worker: 'Hybrid Worker',
  exempt: 'Exempt'
};

const AttendanceManagement = () => {
  const { tenantSlug } = useParams();
  const { isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [config, setConfig] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && tenantSlug) {
      fetchConfig();
      fetchAttendanceData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [tenantSlug, selectedDate, isAuthenticated, authLoading]);

  const fetchConfig = async () => {
    if (!tenantSlug) return;
    try {
      const data = await tenantApiService.getAttendanceConfig(tenantSlug);
      if (data) setConfig(data);
    } catch (e) {
      console.error('Attendance config:', e);
    }
  };

  const fetchAttendanceData = async () => {
    if (!isAuthenticated || !tenantSlug) return;
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
      const headers = ['Date', 'Employee', 'Department', 'Attendance Category', 'Status', 'Check In', 'Check Out', 'Hours', 'Notes'];
      const rows = (reports.records || []).map((r) => {
        const name = r.userId?.fullName || r.userId?.email || r.employeeId || '—';
        const dept = r.employeeInfo?.department || '—';
        const cat = r.employeeInfo?.attendanceCategory ? CATEGORY_LABELS[r.employeeInfo.attendanceCategory] || r.employeeInfo.attendanceCategory : '—';
        const checkIn = r.checkIn?.timestamp ? new Date(r.checkIn.timestamp).toLocaleTimeString() : '—';
        const checkOut = r.checkOut?.timestamp ? new Date(r.checkOut.timestamp).toLocaleTimeString() : '—';
        const hours = r.durationMinutes != null ? (r.durationMinutes / 60).toFixed(2) : '—';
        return [r.date, name, dept, cat, r.status || '—', checkIn, checkOut, hours, (r.checkIn?.notes || r.checkOut?.notes || '')];
      });
      const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance-software-house-${selectedDate}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
      alert(error?.message || 'Failed to export attendance.');
    }
  };

  const summary = attendanceData?.summary || {};
  let records = attendanceData?.records || [];
  if (departmentFilter) {
    records = records.filter((r) => (r.employeeInfo?.department || '').toLowerCase() === departmentFilter.toLowerCase());
  }

  const stats = [
    { label: 'Present Today', value: (summary.present ?? 0).toString(), icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Absent Today', value: (summary.absent ?? 0).toString(), icon: XCircleIcon, iconBg: 'bg-gradient-to-br from-red-500 to-pink-600' },
    { label: 'Late Today', value: (summary.late ?? 0).toString(), icon: ClockIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Total Tracked', value: (summary.total ?? 0).toString(), icon: CalendarIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' }
  ];

  const uniqueDepartments = [...new Set((attendanceData?.records || []).map((r) => r.employeeInfo?.department).filter(Boolean))];

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
      {/* Software House Attendance Engine – First principle */}
      <div className="glass-card-premium p-5 xl:p-6 border-l-4 border-primary-500">
        <h1 className="text-xl xl:text-2xl font-bold font-heading text-gray-900 dark:text-white mb-1">
          ERP Attendance Engine — Software House
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Hybrid, remote, flexible, project-based. Attendance is not about &quot;who came at 9 AM&quot; — it is about:
        </p>
        <div className="flex flex-wrap gap-2 text-xs xl:text-sm">
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Work availability</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Billable hours</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Leave compliance</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Payroll input</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Team visibility</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Remote / hybrid tracking</span>
        </div>
      </div>

      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white">
            Today&apos;s presence
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            By department, role, and work style. Used by HR, Finance, PM, and Managers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl text-sm font-medium"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl text-sm font-medium min-w-[140px]"
          >
            <option value="">All departments</option>
            {uniqueDepartments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button type="button" onClick={handleExport} className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Attendance table – Department, Category, Work style */}
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
          Attendance for {new Date(selectedDate).toLocaleDateString()} — by department & work style
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance category</th>
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
                  const dept = record.employeeInfo?.department || '—';
                  const category = record.employeeInfo?.attendanceCategory || 'hybrid_worker';
                  const isExempt = record.employeeInfo?.isAttendanceExempt || category === 'exempt';
                  const categoryLabel = CATEGORY_LABELS[category] || category;
                  const checkInTime = record.checkIn?.timestamp ? new Date(record.checkIn.timestamp).toLocaleTimeString() : '—';
                  const checkOutTime = record.checkOut?.timestamp ? new Date(record.checkOut.timestamp).toLocaleTimeString() : '—';
                  const hours = record.durationMinutes != null ? (record.durationMinutes / 60).toFixed(2) : '—';
                  const hasCheckedIn = !!record.checkIn?.timestamp;
                  const hasCheckedOut = !!record.checkOut?.timestamp;
                  const employeeId = record.employeeId || record.userId?._id;
                  return (
                    <tr key={record._id || record.userId?._id || record.employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{dept}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isExempt ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          category === 'field_worker' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' :
                          category === 'remote_worker' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {categoryLabel}
                        </span>
                      </td>
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
                        {isExempt ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">Exempt — no daily punch</span>
                        ) : employeeId ? (
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
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    {departmentFilter ? `No attendance records for ${departmentFilter} on this date.` : 'No attendance records for this date.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference: Departments & categories (collapsible or compact) */}
      {config && (config.departments?.length > 0 || config.attendanceCategories?.length > 0) && (
        <div className="glass-card p-4 xl:p-5 rounded-xl">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BriefcaseIcon className="w-4 h-4" />
            Departments & attendance categories (reference)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs xl:text-sm">
            <div>
              <p className="font-medium text-gray-600 dark:text-gray-400 mb-2">By department</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                {config.departments?.slice(0, 6).map((d) => (
                  <li key={d.id}><span className="font-medium text-gray-700 dark:text-gray-300">{d.name}</span>: {d.description}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-600 dark:text-gray-400 mb-2">Attendance categories</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                {config.attendanceCategories?.map((c) => (
                  <li key={c.id}><span className="font-medium text-gray-700 dark:text-gray-300">{c.label}</span> — {c.who}{c.requiresPunch ? ' (punch required)' : ' (exempt)'}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
