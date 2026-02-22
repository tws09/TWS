import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../app/providers/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  HeartIcon,
  FireIcon,
  TrophyIcon,
  CodeBracketIcon,
  LightBulbIcon,
  SparklesIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  WifiIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const TeamCollaboration = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamStats, setTeamStats] = useState({
    onlineMembers: 0,
    inMeetings: 0,
    focusMode: 0,
    totalCollaboration: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeamData();
    fetchActiveMeetings();
    fetchUpcomingEvents();
    fetchTeamStats();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await axios.get('/api/attendance/team/members');
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    }
  };

  const fetchActiveMeetings = async () => {
    try {
      const response = await axios.get('/api/attendance/team/meetings/active');
      if (response.data.success) {
        setActiveMeetings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch active meetings:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/api/attendance/team/events/upcoming');
      if (response.data.success) {
        setUpcomingEvents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await axios.get('/api/attendance/team/stats');
      if (response.data.success) {
        setTeamStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch team stats:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'busy': return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'away': return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
      case 'focus': return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>;
      case 'in-meeting': return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getWorkModeIcon = (mode) => {
    switch (mode) {
      case 'office': return BuildingOfficeIcon;
      case 'remote': return HomeIcon;
      case 'hybrid': return WifiIcon;
      default: return ComputerDesktopIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-gray-100 text-gray-800';
      case 'focus': return 'bg-purple-100 text-purple-800';
      case 'in-meeting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const joinMeeting = async (meetingId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/attendance/team/meetings/${meetingId}/join`);
      if (response.data.success) {
        toast.success('Joined meeting successfully!');
        fetchActiveMeetings();
      }
    } catch (error) {
      toast.error('Failed to join meeting');
    } finally {
      setLoading(false);
    }
  };

  const startQuickMeeting = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/attendance/team/meetings/quick-start');
      if (response.data.success) {
        toast.success('Quick meeting started!');
        fetchActiveMeetings();
      }
    } catch (error) {
      toast.error('Failed to start meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamStats.onlineMembers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Online</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <VideoCameraIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamStats.inMeetings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Meetings</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamStats.focusMode}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Focus Mode</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamStats.totalCollaboration}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Collaboration</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
            Team Members
          </h3>
          <div className="space-y-4">
            {teamMembers.map((member, index) => {
              const WorkModeIcon = getWorkModeIcon(member.workMode);
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      {getStatusIcon(member.status)}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <WorkModeIcon className="h-4 w-4 mr-1" />
                        {member.workMode} • {member.project}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                    {member.status === 'online' && (
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Meetings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <VideoCameraIcon className="h-5 w-5 mr-2 text-green-600" />
              Active Meetings
            </h3>
            <button
              onClick={startQuickMeeting}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium"
            >
              Quick Start
            </button>
          </div>
          <div className="space-y-4">
            {activeMeetings.length > 0 ? (
              activeMeetings.map((meeting, index) => (
                <div key={index} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {meeting.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {meeting.participants} participants • {meeting.duration}
                      </div>
                    </div>
                    <button
                      onClick={() => joinMeeting(meeting.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <VideoCameraIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active meetings</p>
                <p className="text-sm">Start a quick meeting to collaborate</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
          Upcoming Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {event.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.time}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {event.type} • {event.participants} attendees
              </div>
              {event.description && (
                <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCollaboration;
