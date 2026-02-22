/**
 * Project-scoped Workload view. Tasks grouped by assignee.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';

const ProjectWorkloadView = () => {
  const { tenantSlug, projectId } = useParams();
  const [byAssignee, setByAssignee] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug || !projectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await tenantProjectApiService.getProjectTasks(tenantSlug, { projectId });
        const raw = res?.data?.tasks ?? res?.tasks;
        const list = Array.isArray(raw) ? raw : (raw ? Object.values(raw).flat() : []);
        const grouped = {};
        list.forEach((t) => {
          const key = t.assignee?._id || t.assignee?.id || t.assigneeId || 'unassigned';
          const label = t.assignee?.name || t.assignee?.email || 'Unassigned';
          if (!grouped[key]) grouped[key] = { label, tasks: [] };
          grouped[key].tasks.push(t);
        });
        setByAssignee(grouped);
      } catch (e) {
        console.error(e);
        setByAssignee({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-gray-500 dark:text-gray-400">Loading workload...</div>
      </div>
    );
  }

  const entries = Object.entries(byAssignee);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <UserGroupIcon className="w-5 h-5" />
        Workload
      </h2>
      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-8">No tasks to show.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([key, { label, tasks }]) => (
            <div
              key={key}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-2">{label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{tasks.length} task(s)</div>
              <ul className="space-y-1">
                {tasks.slice(0, 5).map((t, i) => (
                  <li key={t._id || t.id || i} className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {t.title || t.name}
                  </li>
                ))}
                {tasks.length > 5 && (
                  <li className="text-xs text-gray-500">+{tasks.length - 5} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectWorkloadView;
