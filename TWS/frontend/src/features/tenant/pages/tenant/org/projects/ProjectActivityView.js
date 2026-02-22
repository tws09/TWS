/**
 * Project-scoped Activity view. Recent task updates (by updatedAt).
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';

const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const ProjectActivityView = () => {
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
        const sorted = [...list].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        setTasks(sorted);
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
        <div className="text-gray-500 dark:text-gray-400">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <BoltIcon className="w-5 h-5" />
        Activity
      </h2>
      <div className="space-y-0">
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-8">No activity yet.</p>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task._id || task.id || idx}
              className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex-shrink-0 w-40 text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(task.updatedAt || task.createdAt)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{task.title || task.name}</div>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{task.status?.replace('_', ' ') || '—'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectActivityView;
