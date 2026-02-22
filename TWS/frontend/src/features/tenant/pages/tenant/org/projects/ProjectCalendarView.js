/**
 * Project-scoped Calendar view. Shows tasks and milestones by date.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ProjectCalendarView = () => {
  const { tenantSlug, projectId } = useParams();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug || !projectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, milestonesRes] = await Promise.all([
          tenantProjectApiService.getProjectTasks(tenantSlug, { projectId }).catch(() => ({ data: { tasks: [] } })),
          tenantProjectApiService.getProjectMilestones(tenantSlug, { projectId }).catch(() => ({ milestones: [] })),
        ]);
        const taskList = tasksRes?.data?.tasks
          ? (Array.isArray(tasksRes.data.tasks) ? tasksRes.data.tasks : Object.values(tasksRes.data.tasks).flat())
          : tasksRes?.tasks || [];
        const mileList = Array.isArray(milestonesRes?.milestones) ? milestonesRes.milestones : milestonesRes?.data?.milestones || [];
        setTasks(taskList);
        setMilestones(mileList);
      } catch (e) {
        console.error(e);
        setTasks([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug, projectId]);

  const getDaysInMonth = (year, month) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    const cells = [];
    for (let i = startPad - 1; i >= 0; i--) {
      cells.push({ date: prevDays - i, current: false, full: new Date(year, month - 1, prevDays - i) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: d, current: true, full: new Date(year, month, d) });
    }
    const remaining = 42 - cells.length;
    for (let r = 1; r <= remaining; r++) {
      cells.push({ date: r, current: false, full: new Date(year, month + 1, r) });
    }
    return cells;
  };

  const toDateKey = (d) => {
    if (!d) return '';
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };

  const taskDate = (t) => t.dueDate || t.startDate || t.createdAt;
  const itemsByDay = {};
  tasks.forEach((t) => {
    const d = taskDate(t);
    if (d) {
      const key = toDateKey(d);
      if (!itemsByDay[key]) itemsByDay[key] = { tasks: [], milestones: [] };
      itemsByDay[key].tasks.push(t);
    }
  });
  milestones.forEach((m) => {
    const d = m.dueDate || m.targetDate || m.date || m.createdAt;
    if (d) {
      const key = toDateKey(d);
      if (!itemsByDay[key]) itemsByDay[key] = { tasks: [], milestones: [] };
      itemsByDay[key].milestones.push(m);
    }
  });

  const cells = getDaysInMonth(currentMonth.year, currentMonth.month);
  const prevMonth = () => {
    setCurrentMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }));
  };
  const nextMonth = () => {
    setCurrentMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5" />
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[160px] text-center">
            {MONTHS[currentMonth.month]} {currentMonth.year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800/80 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
        {cells.map((cell, idx) => {
          const key = toDateKey(cell.full);
          const items = itemsByDay[key] || { tasks: [], milestones: [] };
          const hasItems = items.tasks.length > 0 || items.milestones.length > 0;
          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 text-sm ${
                cell.current ? 'bg-white dark:bg-gray-900' : 'bg-gray-100/80 dark:bg-gray-800/50'
              } ${!cell.current ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
            >
              <div className="font-medium mb-1">{cell.date}</div>
              <div className="space-y-1">
                {items.milestones.slice(0, 2).map((m) => (
                  <div
                    key={m._id || m.id}
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 truncate"
                    title={m.name || m.title}
                  >
                    <FlagIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{m.name || m.title}</span>
                  </div>
                ))}
                {items.tasks.slice(0, 3).map((t) => (
                  <div
                    key={t._id || t.id}
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 truncate"
                    title={t.title || t.name}
                  >
                    <ClipboardDocumentListIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{t.title || t.name}</span>
                  </div>
                ))}
                {(items.tasks.length > 3 || items.milestones.length > 2) && (
                  <div className="text-xs text-gray-500">
                    +{Math.max(0, items.tasks.length - 3) + Math.max(0, items.milestones.length - 2)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectCalendarView;
