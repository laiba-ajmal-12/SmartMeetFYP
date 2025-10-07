'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileSpreadsheet, Calendar, Clock, Users, TrendingUp, Eye, Target, Award, ChartBar as BarChart3, ChartPie as PieChart, Activity, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, Share2, Filter, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  joinTime: string;
  leaveTime: string;
  duration: string;
  engagement: number;
  status: 'high' | 'moderate' | 'low';
  gazeScore: number;
  presenceScore: number;
  focusScore: number;
  sparklineData: number[];
}

interface EngagementPoint {
  time: string;
  engagement: number;
  participants: number;
}

export default function ReportPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('full');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');

  // Dummy data
  const meetingData = {
    title: 'Q1 Strategy Planning Session',
    date: '2024-01-15',
    startTime: '2:00 PM',
    endTime: '3:45 PM',
    duration: '1h 45m',
    totalParticipants: 12,
    averageEngagement: 87,
    peakEngagement: 95,
    lowestEngagement: 72
  };

  const engagementData: EngagementPoint[] = [
    { time: '2:00', engagement: 85, participants: 8 },
    { time: '2:15', engagement: 92, participants: 10 },
    { time: '2:30', engagement: 88, participants: 12 },
    { time: '2:45', engagement: 95, participants: 12 },
    { time: '3:00', engagement: 82, participants: 11 },
    { time: '3:15', engagement: 89, participants: 12 },
    { time: '3:30', engagement: 91, participants: 12 },
    { time: '3:45', engagement: 87, participants: 10 }
  ];

  const participants: Participant[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC',
      joinTime: '2:00 PM',
      leaveTime: '3:45 PM',
      duration: '1h 45m',
      engagement: 94,
      status: 'high',
      gazeScore: 92,
      presenceScore: 98,
      focusScore: 91,
      sparklineData: [85, 90, 95, 92, 88, 94, 96, 94]
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      avatar: 'MR',
      joinTime: '2:05 PM',
      leaveTime: '3:45 PM',
      duration: '1h 40m',
      engagement: 89,
      status: 'high',
      gazeScore: 87,
      presenceScore: 95,
      focusScore: 86,
      sparklineData: [80, 85, 90, 88, 92, 89, 91, 89]
    },
    {
      id: '3',
      name: 'Emily Johnson',
      avatar: 'EJ',
      joinTime: '2:00 PM',
      leaveTime: '3:30 PM',
      duration: '1h 30m',
      engagement: 91,
      status: 'high',
      gazeScore: 89,
      presenceScore: 92,
      focusScore: 93,
      sparklineData: [88, 92, 89, 95, 90, 91, 88, 91]
    },
    {
      id: '4',
      name: 'David Kim',
      avatar: 'DK',
      joinTime: '2:10 PM',
      leaveTime: '3:45 PM',
      duration: '1h 35m',
      engagement: 76,
      status: 'moderate',
      gazeScore: 74,
      presenceScore: 88,
      focusScore: 72,
      sparklineData: [70, 75, 80, 76, 72, 78, 74, 76]
    },
    {
      id: '5',
      name: 'Lisa Wang',
      avatar: 'LW',
      joinTime: '2:00 PM',
      leaveTime: '3:45 PM',
      duration: '1h 45m',
      engagement: 88,
      status: 'high',
      gazeScore: 85,
      presenceScore: 94,
      focusScore: 87,
      sparklineData: [82, 88, 85, 90, 86, 89, 91, 88]
    },
    {
      id: '6',
      name: 'James Wilson',
      avatar: 'JW',
      joinTime: '2:15 PM',
      leaveTime: '3:20 PM',
      duration: '1h 5m',
      engagement: 65,
      status: 'low',
      gazeScore: 62,
      presenceScore: 75,
      focusScore: 68,
      sparklineData: [60, 65, 68, 62, 70, 65, 63, 65]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-onyx-gray bg-alice-white border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <CheckCircle className="w-4 h-4" />;
      case 'moderate':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    // Handle export functionality
    console.log(`Exporting as ${type}`);
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-alice-white to-white">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-royal-blue/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-deep-wine/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-alice-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/dashboard'}
                className="text-onyx-gray hover:text-royal-blue hover:bg-royal-blue/5 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-alice-white"></div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-rich-black">Meeting Report</h1>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-onyx-gray/70">
                  <span>Dashboard › Reports › {meetingData.title}</span>
                  <div className="w-1 h-1 bg-onyx-gray/30 rounded-full"></div>
                  <span>Generated 2 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-alice-white/50">
                <div className="flex space-x-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'participants', label: 'Participants', icon: Users },
                    { id: 'timeline', label: 'Timeline', icon: Clock }
                  ].map((view) => {
                    const Icon = view.icon;
                    return (
                      <button
                        key={view.id}
                        onClick={() => setSelectedView(view.id)}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedView === view.id
                            ? 'bg-royal-blue text-white shadow-sm'
                            : 'text-onyx-gray hover:text-royal-blue hover:bg-royal-blue/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {view.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="border-royal-blue/20 text-royal-blue hover:bg-royal-blue/5 hover:border-royal-blue/40 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-alice-white/50 py-2 z-50">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 text-onyx-gray hover:bg-alice-white hover:text-royal-blue transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2 text-onyx-gray hover:bg-alice-white hover:text-deep-wine transition-colors flex items-center"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-3" />
                      Export to Excel
                    </button>
                  </div>
                )}
              </div>
              
              <Button
                className="bg-gradient-to-r from-royal-blue to-royal-blue/90 hover:from-deep-wine hover:to-deep-wine/90 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Meeting Summary Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 card-shadow-hover border border-white/50 mb-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-rich-black mb-3">{meetingData.title}</h2>
            <div className="flex flex-wrap items-center gap-6 text-onyx-gray/70">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(meetingData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{meetingData.startTime} - {meetingData.endTime}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{meetingData.totalParticipants} participants</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-royal-blue/5 to-royal-blue/10 rounded-2xl p-6 border border-royal-blue/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-royal-blue/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-royal-blue" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-rich-black">{meetingData.totalParticipants}</div>
                  <div className="text-sm text-onyx-gray/60">Participants</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-deep-wine/5 to-deep-wine/10 rounded-2xl p-6 border border-deep-wine/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-deep-wine/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-deep-wine" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-rich-black">{meetingData.averageEngagement}%</div>
                  <div className="text-sm text-onyx-gray/60">Avg Engagement</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-2xl p-6 border border-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-rich-black">{meetingData.peakEngagement}%</div>
                  <div className="text-sm text-onyx-gray/60">Peak Engagement</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-2xl p-6 border border-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-rich-black">{meetingData.duration}</div>
                  <div className="text-sm text-onyx-gray/60">Duration</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Chart & Attendance */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Engagement Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 card-shadow-hover border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-rich-black mb-2">Engagement Over Time</h3>
                  <p className="text-onyx-gray/60">Real-time participant engagement throughout the session</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-royal-blue rounded-full"></div>
                    <span className="text-onyx-gray/60">Engagement %</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-deep-wine rounded-full"></div>
                    <span className="text-onyx-gray/60">Participants</span>
                  </div>
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="h-96 bg-gradient-to-br from-alice-white to-royal-blue/5 rounded-2xl p-6 relative overflow-hidden border border-royal-blue/10">
                
                {/* Mock Chart */}
                <div className="relative h-full flex items-end justify-between space-x-2">
                  {engagementData.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full bg-gradient-to-t from-royal-blue via-royal-blue to-deep-wine rounded-t-lg transition-all duration-500 group-hover:shadow-lg group-hover:scale-105 relative"
                        style={{ height: `${point.engagement}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-rich-black px-4 py-3 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-royal-blue/20 whitespace-nowrap">
                          <div className="font-bold text-royal-blue">{point.engagement}% Engagement</div>
                          <div className="text-onyx-gray/70">{point.participants} participants active</div>
                          <div className="text-xs text-onyx-gray/50 mt-1">Time: {point.time}</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-white/95"></div>
                        </div>
                      </div>
                      <div className="text-sm text-onyx-gray/70 mt-3 font-medium group-hover:text-royal-blue transition-colors">{point.time}</div>
                    </div>
                  ))}
                </div>
                
                {/* Chart Grid Lines */}
                <div className="absolute inset-6 pointer-events-none">
                  {[25, 50, 75].map((line) => (
                    <div
                      key={line}
                      className="absolute left-0 right-0 border-t border-onyx-gray/10"
                      style={{ bottom: `${line}%` }}
                    >
                      <span className="absolute -left-8 -top-2 text-xs text-onyx-gray/40">{line}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 card-shadow-hover border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-rich-black">Session Highlights</h3>
                <Award className="w-5 h-5 text-royal-blue" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-rich-black">Peak Engagement</div>
                      <div className="text-sm text-onyx-gray/60">Highest recorded point</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{meetingData.peakEngagement}%</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-royal-blue/10 rounded-2xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-royal-blue" />
                    </div>
                    <div>
                      <div className="font-bold text-rich-black">Average Focus</div>
                      <div className="text-sm text-onyx-gray/60">Overall session</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-royal-blue">{meetingData.averageEngagement}%</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-deep-wine/10 rounded-2xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-deep-wine" />
                    </div>
                    <div>
                      <div className="font-bold text-rich-black">Consistency</div>
                      <div className="text-sm text-onyx-gray/60">Engagement stability</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-deep-wine">92%</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 card-shadow-hover border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-rich-black">Attendance Summary</h3>
                <Users className="w-5 h-5 text-royal-blue" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-onyx-gray">On Time</span>
                  </div>
                  <span className="font-bold text-green-600">8 participants</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-onyx-gray">Late (5+ min)</span>
                  </div>
                  <span className="font-bold text-yellow-600">3 participants</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-onyx-gray">Early Leave</span>
                  </div>
                  <span className="font-bold text-red-500">1 participant</span>
                </div>
              </div>
              
              {/* Attendance Rate Visualization */}
              <div className="mt-6 pt-4 border-t border-alice-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-onyx-gray">Overall Attendance Rate</span>
                  <span className="text-lg font-bold text-royal-blue">92%</span>
                </div>
                <div className="w-full bg-alice-white rounded-full h-3">
                  <div className="bg-gradient-to-r from-royal-blue to-deep-wine h-3 rounded-full w-[92%] transition-all duration-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Insights */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 card-shadow-hover border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-rich-black mb-2">Participant Insights</h3>
              <p className="text-onyx-gray/60">Individual performance breakdown and engagement metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-onyx-gray/60">High (90%+)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-onyx-gray/60">Moderate (70-89%)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-onyx-gray/60">Low (-70%)</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="group bg-gradient-to-br from-white to-alice-white/50 rounded-3xl p-6 border border-white/50 hover:border-royal-blue/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-royal-blue to-deep-wine rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-rich-black group-hover:text-royal-blue transition-colors text-lg">
                      {participant.name}
                    </h4>
                    <div className="text-sm text-onyx-gray/60 font-medium">{participant.duration}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(participant.status)}`}>
                    {getStatusIcon(participant.status)}
                    <span className="capitalize">{participant.status}</span>
                  </div>
                </div>
                
                {/* Engagement Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-onyx-gray">Overall Engagement</span>
                    <span className="text-xl font-bold text-royal-blue">{participant.engagement}%</span>
                  </div>
                  <div className="w-full bg-alice-white rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-royal-blue to-deep-wine h-4 rounded-full transition-all duration-1000 group-hover:shadow-lg relative overflow-hidden"
                      style={{ width: `${participant.engagement}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Metrics */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-lg font-bold text-rich-black">{participant.gazeScore}%</div>
                    <div className="text-xs text-onyx-gray/60 font-medium">Gaze</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rich-black">{participant.presenceScore}%</div>
                    <div className="text-xs text-onyx-gray/60 font-medium">Presence</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rich-black">{participant.focusScore}%</div>
                    <div className="text-xs text-onyx-gray/60 font-medium">Focus</div>
                  </div>
                </div>
                
                {/* Sparkline */}
                <div className="h-10 flex items-end justify-between space-x-1 bg-alice-white/50 rounded-xl p-2">
                  {participant.sparklineData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-royal-blue/40 to-royal-blue/80 rounded-sm transition-all duration-500 group-hover:from-deep-wine/40 group-hover:to-deep-wine/80 hover:scale-110"
                      style={{ height: `${(value / 100) * 80}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Attendance Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl card-shadow-hover border border-white/50">
          <div className="p-8 border-b border-alice-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-rich-black mb-2">Detailed Attendance</h3>
                <p className="text-onyx-gray/60">Complete breakdown of participant attendance and engagement metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-royal-blue border-royal-blue/20 hover:bg-royal-blue/5"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-deep-wine border-deep-wine/20 hover:bg-deep-wine/5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-alice-white/50 bg-alice-white/30">
                  <th className="text-left py-6 px-8 text-sm font-bold text-rich-black uppercase tracking-wider">Participant</th>
                  <th className="text-left py-6 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Join Time</th>
                  <th className="text-left py-6 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Leave Time</th>
                  <th className="text-left py-6 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Duration</th>
                  <th className="text-left py-6 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Engagement</th>
                  <th className="text-left py-6 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id} className="border-b border-alice-white/30 hover:bg-gradient-to-r hover:from-royal-blue/5 hover:to-deep-wine/5 transition-all duration-300 group">
                    <td className="py-6 px-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-royal-blue to-deep-wine rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {participant.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-rich-black group-hover:text-royal-blue transition-colors">
                            {participant.name}
                          </div>
                          <div className="text-sm text-onyx-gray/60">Participant</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-semibold text-rich-black">{participant.joinTime}</div>
                      <div className="text-sm text-onyx-gray/60">Entry time</div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-semibold text-rich-black">{participant.leaveTime}</div>
                      <div className="text-sm text-onyx-gray/60">Exit time</div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-semibold text-rich-black">{participant.duration}</div>
                      <div className="text-sm text-onyx-gray/60">Total time</div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 bg-alice-white rounded-full h-3 shadow-inner">
                          <div
                            className={`h-3 rounded-full transition-all duration-700 ${
                              participant.engagement >= 90 ? 'bg-green-500' :
                              participant.engagement >= 75 ? 'bg-royal-blue' :
                              participant.engagement >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${participant.engagement}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-lg text-rich-black">{participant.engagement}%</span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(participant.status)}`}>
                        {getStatusIcon(participant.status)}
                        <span className="capitalize">{participant.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="p-6 bg-alice-white/30 border-t border-alice-white/50">
            <div className="flex items-center justify-between text-sm text-onyx-gray/60">
              <span>Showing {participants.length} participants</span>
              <div className="flex items-center space-x-4">
                <span>Average session time: 1h 32m</span>
                <span>•</span>
                <span>Overall engagement: {meetingData.averageEngagement}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}