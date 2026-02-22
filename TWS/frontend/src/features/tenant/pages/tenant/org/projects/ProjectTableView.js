/**
 * Project-scoped Table view. Tasks in a data table.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';

const formatDate = (d) => (!d ? '—' : new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' }));

const ProjectTableView = () => {
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
        setTasks(list);
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
        <div className="text-gray-500 dark:text-gray-400">Loading table...</div>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <TableCellsIcon className="w-5 h-5" />
        Table
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-8">No tasks yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Task
              </th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Status
              </th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Priority
              </th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Start
              </th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Due
              </th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr
                key={task._id || task.id || idx}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-3 text-gray-900 dark:text-white">{task.title || task.name}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400 capitalize">
                  {task.status?.replace('_', ' ') || '—'}
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-400 capitalize">{task.priority || '—'}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{formatDate(task.startDate)}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{formatDate(task.dueDate)}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {task.assignee?.name || task.assignee?.email || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProjectTableView;
