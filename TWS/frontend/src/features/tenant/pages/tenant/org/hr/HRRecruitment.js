import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  PlayIcon,
  PauseIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TagIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  VideoCameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';
import FormBuilder from './components/hr/FormBuilder';
import FormTemplateManager from './components/hr/FormTemplateManager';
import JobPostingSystem from './components/hr/JobPostingSystem';
import InterviewFormPortal from './components/hr/InterviewFormPortal';
import ResponseDashboard from './components/hr/ResponseDashboard';

const HRRecruitment = () => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview'); // overview, job-posting, interviews, responses
  const [loading, setLoading] = useState(true);
  const [openPositions, setOpenPositions] = useState([]);
  const [stats, setStats] = useState({
    openPositions: 0,
    activeCandidates: 0,
    inReview: 0,
    hiredThisMonth: 0
  });

  useEffect(() => {
    fetchRecruitmentData();
  }, [tenantSlug]);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      const data = await tenantApiService.getRecruitmentData(tenantSlug);
      
      // Transform API data to match component expectations
      const positions = data.positions || data.jobs || [];
      const stats = data.stats || {
        openPositions: positions.length || 0,
        activeCandidates: data.activeCandidates || 0,
        inReview: data.inReview || 0,
        hiredThisMonth: data.hiredThisMonth || 0
      };
      
      setOpenPositions(positions);
      setStats(stats);
    } catch (err) {
      console.error('Error fetching recruitment data:', err);
      // Set empty state on error
      setOpenPositions([]);
      setStats({ openPositions: 0, activeCandidates: 0, inReview: 0, hiredThisMonth: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Open Positions', value: stats.openPositions.toString(), icon: BriefcaseIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Active Candidates', value: stats.activeCandidates.toString(), icon: UserPlusIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'In Review', value: stats.inReview.toString(), icon: ClockIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Hired This Month', value: stats.hiredThisMonth.toString(), icon: CheckCircleIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Recruitment
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage job postings and candidate applications
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="glass-card-premium p-5 xl:p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-glow-lg`}>
                <stat.icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
          Open Positions
        </h3>
        <div className="space-y-4">
          {openPositions.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No open positions</p>
            </div>
          ) : (
            openPositions.map((position) => (
              <div key={position.id} className="glass-card p-4 hover-lift">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-glow">
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
            ))
          )}
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
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
    </div>
  );

  // Render different views based on activeView
  if (activeView === 'job-posting') {
    return <JobPostingSystem tenantSlug={tenantSlug} onBack={() => setActiveView('overview')} />;
  }
  
  if (activeView === 'interviews') {
    return <InterviewFormPortal tenantSlug={tenantSlug} onBack={() => setActiveView('overview')} />;
  }
  
  if (activeView === 'responses') {
    return <ResponseDashboard tenantSlug={tenantSlug} onBack={() => setActiveView('overview')} />;
  }

  return renderOverview();
};

export default HRRecruitment;
