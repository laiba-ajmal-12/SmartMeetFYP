'use client';

import { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MessageSquare, 
  Users, 
  Phone, 
  Settings,
  MoreVertical,
  ArrowLeft,
  BarChart3,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  hasVideo: boolean;
}

export default function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');

  const participants: Participant[] = [
    { id: '1', name: 'You', isHost: true, isMuted: false, hasVideo: true },
    { id: '2', name: 'Sarah Chen', isHost: false, isMuted: false, hasVideo: true },
    { id: '3', name: 'Michael Rodriguez', isHost: false, isMuted: true, hasVideo: true },
    { id: '4', name: 'Emily Johnson', isHost: false, isMuted: false, hasVideo: false },
    { id: '5', name: 'David Kim', isHost: false, isMuted: true, hasVideo: true },
  ];

  const chatMessages = [
    { id: '1', sender: 'Sarah Chen', message: 'Great presentation so far!', time: '2:34 PM' },
    { id: '2', sender: 'Michael Rodriguez', message: 'Could you share those analytics again?', time: '2:35 PM' },
    { id: '3', sender: 'You', message: 'Sure, I\'ll share the screen now', time: '2:35 PM' },
  ];

  // Meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle sending message
      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      window.location.href = '/';
    }
  };

  return (
    <div className="h-screen bg-alice-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-alice-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-onyx-gray hover:text-royal-blue"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Meeting
          </Button>
          <div className="h-6 w-px bg-alice-white mx-2"></div>
          <h1 className="text-lg font-semibold text-rich-black">Product Review Meeting</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-onyx-gray">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(meetingDuration)}</span>
          </div>
          <Button
            variant="destructive"
            onClick={handleLeave}
            className="bg-deep-wine hover:bg-deep-wine/90 text-white"
          >
            <Phone className="w-4 h-4 mr-2 rotate-180" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-6">
          {/* Main Video Grid */}
          <div className="h-full bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {participants.slice(0, 6).map((participant, index) => (
                <div
                  key={participant.id}
                  className={`relative bg-gradient-to-br from-royal-blue/10 to-deep-wine/10 rounded-2xl overflow-hidden ${
                    index === 0 && participants.length > 1 ? 'md:col-span-2 lg:col-span-1' : ''
                  } ${
                    participant.isHost ? 'ring-2 ring-royal-blue animate-pulse-glow' : ''
                  }`}
                >
                  {/* Video Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {participant.hasVideo ? (
                      <div className="w-20 h-20 bg-royal-blue rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-onyx-gray rounded-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Participant Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium text-sm">{participant.name}</span>
                        {participant.isHost && (
                          <span className="bg-royal-blue text-white text-xs px-2 py-1 rounded">Host</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                        {!participant.hasVideo && <VideoOff className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Speaking Indicator */}
                  {!participant.isMuted && Math.random() > 0.7 && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-green-500 rounded-full p-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`w-80 bg-white shadow-lg border-l border-alice-white transition-all duration-300 ${
          showChat || showParticipants ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Sidebar Tabs */}
          <div className="border-b border-alice-white">
            <div className="flex">
              <button
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  showParticipants && !showChat
                    ? 'border-royal-blue text-royal-blue'
                    : 'border-transparent text-onyx-gray hover:text-royal-blue'
                }`}
                onClick={() => {
                  setShowParticipants(true);
                  setShowChat(false);
                }}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Participants ({participants.length})
              </button>
              <button
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  showChat
                    ? 'border-royal-blue text-royal-blue'
                    : 'border-transparent text-onyx-gray hover:text-royal-blue'
                }`}
                onClick={() => {
                  setShowChat(true);
                  setShowParticipants(false);
                }}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Chat
              </button>
            </div>
          </div>

          {/* Participants Panel */}
          {showParticipants && !showChat && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-rich-black mb-6">Participants ({participants.length})</h3>
              <div className="space-y-3">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-alice-white transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-royal-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-rich-black">{participant.name}</span>
                          {participant.isHost && (
                            <span className="bg-royal-blue text-white text-xs px-2 py-0.5 rounded">Host</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {participant.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                          {!participant.hasVideo && <VideoOff className="w-3 h-3 text-red-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {chatMessages.map(message => (
                    <div key={message.id} className="bg-alice-white rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-rich-black text-sm">{message.sender}</span>
                        <span className="text-xs text-onyx-gray/60">{message.time}</span>
                      </div>
                      <p className="text-sm text-onyx-gray">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-alice-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 bg-alice-white rounded-xl border-0 focus:ring-2 focus:ring-royal-blue outline-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-royal-blue hover:bg-deep-wine text-white px-4"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-alice-white px-6 py-4">
        <div className="flex justify-center items-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={hasVideo ? "secondary" : "destructive"}
            size="lg"
            onClick={() => setHasVideo(!hasVideo)}
            className={`w-12 h-12 rounded-full ${
              !hasVideo 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray'
            }`}
          >
            {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-12 h-12 rounded-full ${
              isScreenSharing 
                ? 'bg-royal-blue hover:bg-deep-wine text-white' 
                : 'bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setShowChat(!showChat);
              if (showChat) setShowParticipants(true);
            }}
            className="w-12 h-12 rounded-full bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-12 h-12 rounded-full bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-12 h-12 rounded-full bg-alice-white hover:bg-royal-blue hover:text-white text-onyx-gray"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}