'use client';

import { useEffect, useState } from 'react';
import { Video, Plus, Users, ChartBar as BarChart3, FileText, Calendar, Clock, Eye, Settings, LogOut, Copy, ExternalLink, TrendingUp, Award, Target, Bell, Search, Filter, MoveHorizontal as MoreHorizontal, ArrowUpRight, Zap, Shield, Globe , ArrowLeft} from 'lucide-react';
import { Button } from '@/components/ui/button';
import organCard from '@/components/ui/organizationCard'
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from '@/components/ui/loader';

interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: number;
  engagement: number;
  duration: string;
  status: 'completed' | 'upcoming' | 'in-progress';
}

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend: string;
  trendUp: boolean;
  color:string;
}

interface Oganization{
  id: number;
  name: string;
  description: string;
  imagePath?: string;
}

export default function Dashboard() {
  const router = useRouter();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [data , setData] = useState(null);
  const [memberOrganizations , setMemberOrganizations] = useState(null);
  const [ownOrganizations , setOwnOrganizations] = useState(null);
  const [loading , setloading]= useState(true);
  const [upcoming , setupcoming] = useState<any[]>([]);
  const [runing, setRunningMeetings] = useState<any[]>([]);

  useEffect(()=>{

    const fectData = async ()=>{ 
      const now = Date.now(); 
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;
      const query = `{ getUserbyId { id name email ImagePath member { organization { id name  totalParticipants createAt ownerId  meeting(time: "${twoHoursAgo}" , limit: 2){id name  startTime  meetingDuration}  } } ownedOrganizations { id name  totalParticipants createAt ownerId meeting(time: "${twoHoursAgo}" , limit: 2){id name  startTime  meetingDuration} } }}`

        try{
        console.log('token: ' , localStorage.getItem("token"))

        const result = await axios.post(
            "http://localhost:4000/graphql",
            { 'query':query },
            {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            }
          )
          setData(result.data.data.getUserbyId);
          setloading(false);
          let meet = [];
          const upcomingMeetings: any[] = [];
          const runningMeetings: any[] = [];

          console.log('data ===== > ' , result.data.data.getUserbyId.member)
          if( result.data.data.getUserbyId.member && result.data.data.getUserbyId.member.length > 0){
            meet = result.data.data.getUserbyId.member.flatMap(org => org.organization.meeting);
            setMemberOrganizations(result.data.data.getUserbyId.member);
          }
          if( result.data.data.getUserbyId.ownedOrganizations && result.data.data.getUserbyId.ownedOrganizations.length > 0){
            meet = meet.concat(result.data.data.getUserbyId.ownedOrganizations.flatMap(org => org.meeting));
            setOwnOrganizations(result.data.data.getUserbyId.ownedOrganizations);
            setupcoming(result.data.data.getUserbyId.ownedOrganizations.meeting)
          }

          meet.forEach(item => {
            const meetingStart = new Date(Number(item.startTime));
            const meetingEnd = new Date(meetingStart.getTime() + Number(item.meetingDuration) * 60000);
            const now = new Date();

            if (now >= meetingStart && now <= meetingEnd) {
              runningMeetings.push(item);
            } else if (now < meetingStart) {
              upcomingMeetings.push(item);
            }
          });
          
          upcomingMeetings.sort((a, b) => Number(a.startTime) - Number(b.startTime)) 
          setupcoming(upcomingMeetings);
          setRunningMeetings(runningMeetings);

        }catch(error){
          //@ts-ignore
          console.error('[Error]: ' ,error.message)
        }

  }
  fectData();


  },[])

  if(loading){
    return (
      <div className='w-screen h-screen flex justify-center items-center'>
        <Loader/>
      </div>
    )
  }

  const handleViewMeeting = (userId: number, orgId: number) => {
      router.push(`/dashboard?userId=${userId}&organizationId=${orgId}`);
}

  console.log('[data]: ',data)

  // Dummy data
  const stats: StatCard[] = [
    {
      title: 'Meetings Hosted',
      value: '47',
      subtitle: 'This month (+12 from last)',
      icon: Video,
      trend: '+12%',
      trendUp: true,
      color: 'from-royal-blue/20 to-royal-blue/10'
    },
    {
      title: 'Average Engagement',
      value: '87%',
      subtitle: 'Across all meetings (+5% up)',
      icon: Target,
      trend: '+5%',
      trendUp: true,
      color: 'from-green-500/20 to-green-400/10'
    },
    {
      title: 'Total Participants',
      value: '324',
      subtitle: 'Unique attendees (+18% growth)',
      icon: Users,
      trend: '+18%',
      trendUp: true,
      color: 'from-deep-wine/20 to-deep-wine/10'
    },
    {
      title: 'Reports Generated',
      value: '42',
      subtitle: 'Automated insights (+8 new)',
      icon: FileText,
      trend: '+8%',
      trendUp: true,
      color: 'from-purple-500/20 to-purple-400/10'
    }
  ];


  const upcomingMeetings = [
    { id: '1', title: 'Q1 Strategy Review', time: '2:00 PM', participants: 8, type: 'important' },
    { id: '2', title: 'Design System Update', time: '4:30 PM', participants: 5, type: 'regular' },
    { id: '3', title: 'Client Presentation', time: 'Tomorrow 10:00 AM', participants: 12, type: 'client' }
  ];


    function formatMeetingTime(meetingTime: string | number | Date): string {
    const date = new Date(Number(meetingTime));
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const pad = (n: number) => n.toString().padStart(2, "0");
    const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    // Today
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `Today at ${timeStr}`;
    }

    // Tomorrow
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow at ${timeStr}`;
    }

    // This week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday

    if (date >= weekStart && date <= weekEnd) {
      return `${dayNames[date.getDay()]} at ${timeStr}`;
    }

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${timeStr}`;
  }

  function getRemainingMinutes(startTime: string | number, meetingDuration: number): number {
    const start = new Date(Number(startTime)); 
    const durationMs = Number(meetingDuration) * 60000; 
    const end = new Date(start.getTime() + durationMs); 
    const now = new Date();
    const timeLeftMs = end.getTime() - now.getTime();

    return timeLeftMs > 0 ? Math.ceil(timeLeftMs / 60000) : 0; 
  }

  function getImageUrl(imagePath: string): string {
    const normalizedPath = imagePath.replace(/\\/g, "/");
    return `http://localhost:4000/${normalizedPath}`;
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-alice-white to-white">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-royal-blue/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-deep-wine/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-alice-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-royal-wine rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-rich-black">
                Smart<span className="text-gradient">Meet</span>
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-onyx-gray/40" />
                  <input
                    type="text"
                    placeholder="Search meetings..."
                    className="pl-10 pr-4 py-2 w-64 bg-alice-white/50 border border-alice-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
                  />
                </div>
                
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-royal-blue hover:text-white hover:bg-royal-blue border-royal-blue/20 hover:border-royal-blue transition-all duration-200"
                  onClick={() => window.location.href = `/reports/123`}
                >
                  <Bell className="w-4 h-4" />
                  
                </Button>
              </div>

              <Button
                className="bg-gradient-to-r from-royal-blue to-royal-blue/90 hover:from-deep-wine hover:to-deep-wine/90 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                onClick={() => window.location.href = '/create-organization'}
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Organization
              </Button>

              <Button
                className="bg-gradient-to-r from-royal-blue to-royal-blue/90 hover:from-deep-wine hover:to-deep-wine/90 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                onClick={() => window.location.href = '/join-organization'}
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Join 
              </Button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  className="w-10 h-10 bg-gradient-to-br from-royal-blue to-deep-wine rounded-xl flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {/*@ts-ignore*/}
                  {data && data.name[0]}
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-alice-white/50 py-3 z-50">
                    <div className="px-4 py-2 border-b border-alice-white">
                      <p className="font-semibold text-rich-black">{data && data.name}</p>
                      <p className="text-sm text-onyx-gray">{data && data.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-onyx-gray hover:bg-alice-white hover:text-royal-blue transition-colors flex items-center">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-onyx-gray hover:bg-alice-white hover:text-deep-wine transition-colors flex items-center">
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Welcome Header */}
        <div className="mb-12">



          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
               <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-onyx-gray hover:text-royal-blue"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
              <h1 className="text-4xl font-bold text-rich-black mb-3">
                Welcome {data && data.name}
              </h1>
              <p className="text-xl text-onyx-gray/70 mb-4">
                Here's a quick look at your recent meetings and engagement trends.
              </p>
              <div className="flex items-center space-x-6 text-sm text-onyx-gray/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Last sync: 2 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
            

        {/* Stats Cards */}
        <div className="grid mt-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {runing.map((stat, index) => {
            const Icon = Video;
            return (
              <div
                key={stat.id}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 transform hover:-translate-y-2 border border-white/50 relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-royal-blue/20 to-royal-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br from-royal-blue/20 to-royal-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-royal-blue" />
                    </div>
                    <div className={`flex items-center text-sm font-bold px-3 py-1 rounded-full text-red-700 bg-red-100`}>
                      {getRemainingMinutes(stat.startTime , stat.meetingDuration) }min Left
                    </div>
                  </div>
                  <div className="text-sm text-onyx-gray/70 leading-relaxed">
                    {stat.name}
                  </div>
                  <div className="w-full mt-3 text-sm text-onyx-gray/70 leading-relaxed">
                 <Button
                    className="bg-gradient-to-r  from-royal-blue to-royal-blue/90 hover:from-deep-wine hover:to-deep-wine/90 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                     onClick={() => {
                        window.location.href = "https://superformidable-briella-ergodic.ngrok-free.dev/meeting";
                   }}
                  >
                    Join Meeting
                  </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Meetings */}
          <div className="lg:col-span-2">
            
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl card-shadow border border-white/50">
                
                {<div className="p-6 border-b border-alice-white/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-rich-black">Your Organizations</h2>
                    <Button
                      variant="outline"
                      className="text-royal-blue hover:text-deep-wine"
                    >
                      View All
                    </Button>
                  </div>
                </div>}

                {<div className="overflow-x-auto">

                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-alice-white/50">
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Meeting</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Date</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Participants</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/*@ts-ignore*/}
                        {ownOrganizations && ownOrganizations.map((organ) => (
                          <tr key={organ.id} className="border-b border-alice-white/30 hover:bg-royal-blue/5 transition-all duration-200 group">
                            <td className="py-5 px-6">
                              <div>
                                <div className="font-semibold text-rich-black group-hover:text-royal-blue transition-colors">{organ.name}</div>
                                <div className="text-sm text-onyx-gray/70 mt-1">{organ.duration}</div>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-onyx-gray font-medium">
                              {new Date(parseInt(organ.createAt)).toLocaleDateString()}
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center text-onyx-gray font-medium">
                                <Users className="w-4 h-4 mr-2" />
                                {organ.totalParticipants}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <Button
                                  className="bg-royal-blue hover:bg-deep-wine text-white transition-all duration-200"
                                  onClick={()=> handleViewMeeting(data.id, organ.id)}
                                >
                                  View Meeting
                            </Button>
                              
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>}

                {memberOrganizations && <div className="p-6 border-b border-alice-white/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-rich-black">Joined</h2>
                    <Button
                      variant="outline"
                      className="text-royal-blue hover:text-deep-wine"
                    >
                      View All
                    </Button>
                  </div>
                </div>}

                {memberOrganizations && <div className="overflow-x-auto">

                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-alice-white/50">
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Meeting</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Date</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Participants</th>
                          <th className="text-left py-5 px-6 text-sm font-bold text-rich-black uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/*@ts-ignore*/}
                        {memberOrganizations.map((organ) => (
                          <tr key={organ.organization.id} className="border-b border-alice-white/30 hover:bg-royal-blue/5 transition-all duration-200 group">
                            <td className="py-5 px-6">
                              <div>
                                <div className="font-semibold text-rich-black group-hover:text-royal-blue transition-colors">{organ.organization.name}</div>
                                <div className="text-sm text-onyx-gray/70 mt-1">{organ.duration}</div>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-onyx-gray font-medium">
                              {new Date(parseInt(organ.organization.createAt)).toLocaleDateString()}
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center text-onyx-gray font-medium">
                                <Users className="w-4 h-4 mr-2" />
                                {organ.organization.totalParticipants}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <Button
                                  className="bg-royal-blue hover:bg-deep-wine text-white transition-all duration-200"
                                  onClick={()=> handleViewMeeting(data.id, organ.organization.id)}
                                >
                                  View Meeting
                            </Button>
                              
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>}
            
            </div>
          </div>



          

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Engagement Trends */}

              {/* Upcoming Meetings */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 card-shadow border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-rich-black">Upcoming</h3>
                  <Calendar className="w-5 h-5 text-royal-blue" />
                </div>
                <div className="space-y-4">
                  {upcoming && upcoming.map((meet) => (
                    <div key={meet.id} className="group p-4 rounded-2xl hover:bg-royal-blue/5 transition-all duration-200 border border-transparent hover:border-royal-blue/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-rich-black group-hover:text-royal-blue transition-colors text-sm">
                            {meet.name}
                          </h4>
                          <div className="flex items-center space-x-3 mt-2">
                            <div className="flex items-center text-xs text-onyx-gray/60">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatMeetingTime(meet.startTime)}
                            </div>
                            <div className="flex items-center text-xs text-onyx-gray/60">
                              <Clock className="w-3 h-3 mr-1" />
                              {meet.meetingDuration} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 card-shadow border border-white/50">
                <h3 className="text-xl font-bold text-rich-black mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-onyx-gray hover:text-white hover:bg-royal-blue group transition-all duration-200 h-12 rounded-xl"
                  >
                    <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Schedule Meeting
                    <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-onyx-gray hover:text-white hover:bg-deep-wine group transition-all duration-200 h-12 rounded-xl"
                  >
                    <BarChart3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    View Analytics
                    <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-onyx-gray hover:text-white hover:bg-purple-600 group transition-all duration-200 h-12 rounded-xl"
                  >
                    <Award className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Export Reports
                    <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section - Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 card-shadow border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-rich-black mb-2">Recent Activity</h2>
              <p className="text-onyx-gray/70">Stay updated with your latest meeting activities</p>
            </div>
            <Button variant="outline" className="text-royal-blue border-royal-blue/20 hover:bg-royal-blue hover:text-white">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-royal-blue/5 to-royal-blue/10 hover:from-royal-blue/10 hover:to-royal-blue/20 transition-all duration-300 border border-royal-blue/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-royal-blue/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-royal-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-rich-black">High Engagement</h3>
                  <p className="text-sm text-onyx-gray/70">Product Review Meeting</p>
                </div>
              </div>
              <p className="text-sm text-onyx-gray/80">Achieved 95% engagement rate with 12 participants</p>
              <div className="mt-4 text-xs text-royal-blue font-medium">2 hours ago</div>
            </div>

            <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/20 transition-all duration-300 border border-green-500/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-rich-black">Report Generated</h3>
                  <p className="text-sm text-onyx-gray/70">Weekly Team Standup</p>
                </div>
              </div>
              <p className="text-sm text-onyx-gray/80">Automated meeting summary and action items ready</p>
              <div className="mt-4 text-xs text-green-600 font-medium">5 hours ago</div>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-deep-wine/5 to-deep-wine/10 hover:from-deep-wine/10 hover:to-deep-wine/20 transition-all duration-300 border border-deep-wine/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-deep-wine/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-deep-wine" />
                </div>
                <div>
                  <h3 className="font-semibold text-rich-black">Security Update</h3>
                  <p className="text-sm text-onyx-gray/70">Account Settings</p>
                </div>
              </div>
              <p className="text-sm text-onyx-gray/80">Two-factor authentication enabled successfully</p>
              <div className="mt-4 text-xs text-deep-wine font-medium">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}