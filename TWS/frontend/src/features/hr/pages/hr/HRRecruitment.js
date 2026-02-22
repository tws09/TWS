import React, { useState } from 'react';
import AdminPageTemplate from '../../../../features/admin/components/admin/AdminPageTemplate';
import JobPostingSystem from './JobPostingSystem';
import InterviewFormPortal from './InterviewFormPortal';
import ResponseDashboard from './ResponseDashboard';
import { 
  BriefcaseIcon, 
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const HRRecruitment = () => {
  const [activeView, setActiveView] = useState('overview'); // overview, job-posting, interviews, responses

  const stats = [
    { label: 'Open Positions', value: '8', icon: BriefcaseIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Active Candidates', value: '45', icon: UserPlusIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'In Review', value: '12', icon: ClockIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Hired This Month', value: '3', icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  const actions = (
    <div className="flex gap-3">
      <button 
        onClick={() => setActiveView('job-posting')}
        className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2"
      >
        <Cog6ToothIcon className="w-5 h-5" />
        <span className="font-medium">Form Builder</span>
      </button>
      <button 
        onClick={() => setActiveView('job-posting')}
        className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="font-medium">Post New Job</span>
      </button>
    </div>
  );

  const openPositions = [
    { id: 1, title: 'Senior Full-Stack Developer', department: 'Engineering', location: 'Remote', applicants: 23, posted: '2 weeks ago' },
    { id: 2, title: 'UI/UX Designer', department: 'Design', location: 'Hybrid', applicants: 18, posted: '1 week ago' },
    { id: 3, title: 'Product Manager', department: 'Management', location: 'On-site', applicants: 12, posted: '3 days ago' }
  ];

  const renderOverview = () => (
    <AdminPageTemplate
      title="Recruitment"
      description="Manage job postings and candidate applications"
      stats={stats}
      actions={actions}
    >
      {/* Navigation Tabs */}
      <div className="glass-card-premium p-2 mb-6">
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BriefcaseIcon },
            { id: 'job-posting', label: 'Job Posting System', icon: Cog6ToothIcon },
            { id: 'interviews', label: 'Interview Portal', icon: UserIcon },
            { id: 'responses', label: 'Response Dashboard', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeView === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Open Positions
        </h3>
        <div className="space-y-4">
          {openPositions.map((position) => (
            <div key={position.id} className="glass-card p-4 hover-lift">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{position.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span>{position.location}</span>
                    <span>•</span>
                    <span>{position.applicants} applicants</span>
                    <span>•</span>
                    <span>Posted {position.posted}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveView('responses')}
                    className="glass-button px-4 py-2 rounded-xl hover-scale text-sm font-medium"
                  >
                    View Applicants
                  </button>
                  <button 
                    onClick={() => setActiveView('job-posting')}
                    className="glass-button px-4 py-2 rounded-xl hover-scale text-sm font-medium"
                  >
                    Edit Job
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="glass-card-premium p-6 hover-glow">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
          Candidate Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { stage: 'Applied', count: 45, color: 'blue' },
            { stage: 'Screening', count: 18, color: 'amber' },
            { stage: 'Interview', count: 12, color: 'purple' },
            { stage: 'Offer', count: 5, color: 'green' }
          ].map((stage, index) => (
            <div key={index} className="glass-card p-4 hover-lift text-center">
              <p className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-2">{stage.count}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stage.stage}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminPageTemplate>
  );

  // Render different views based on activeView
  if (activeView === 'job-posting') {
    return <JobPostingSystem />;
  }
  
  if (activeView === 'interviews') {
    return <InterviewFormPortal />;
  }
  
  if (activeView === 'responses') {
    return <ResponseDashboard />;
  }

  return renderOverview();
};

export default HRRecruitment;
