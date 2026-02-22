/**
 * Project-scoped Timeline view. Tasks in chronological order by start/due date.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';

const formatDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return x.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

const ProjectTimelineView = () => {
  const { tenantSlug, projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug || !projectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await tenantProjectApiService.getProjectTasks(tenantSlug, { projectId });
        const raw = res?.data?.tasks ?? res?.tasks;
        const list = Array.isArray(raw) ? raw : (raw ? Object.values(raw).flat() : []);
        const withDate = list
          .map((t) => ({
            ...t,
            _sortDate: t.startDate || t.dueDate || t.createdAt,
          }))
          .filter((t) => t._sortDate);
        withDate.sort((a, b) => new Date(a._sortDate) - new Date(b._sortDate));
        setTasks(withDate);
      } catch (e) {
        console.error(e);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-gray-500 dark:text-gray-400">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5" />
        Timeline
      </h2>
      <div className="space-y-0">
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-8">No tasks with dates yet.</p>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task._id || task.id || idx}
              className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex-shrink-0 w-32 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4" />
                {formatDate(task._sortDate)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{task.title || task.name}</div>
                {task.status && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{task.status.replace('_', ' ')}</span>
                )}
              </div>
              {task.dueDate && task.startDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(task.startDate)} → {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectTimelineView;
