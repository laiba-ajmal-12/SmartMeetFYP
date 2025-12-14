'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Clock,
  Send,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaRoutes } from "@/lib/routes";
import ParticipantVideo from "./ParticipantVideo";

interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  isHost: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  videoProducerId: string | null;
  audioProducerId: string | null;
  stream: MediaStream | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  senderId: string;
}

export default function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isMobile, setIsMobile] = useState(false);
  const [activeScreenShare, setActiveScreenShare] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mediaRoutesRef = useRef<MediaRoutes | null>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);
  const screenShareContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const participantsContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const ROOM_ID = "room1";

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setShowChat(false);
        setShowParticipants(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let socket: any;
    let mediaRoutes: MediaRoutes | null = null;

    const initializeMeeting = async () => {
      try {
        setConnectionStatus('Connecting...');
        
        const { io } = await import("socket.io-client");
        
        socket = io("http://localhost:5500/", {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        await new Promise((resolve, reject) => {
          socket.on('connect', () => {
            setConnectionStatus('Connected');
            resolve(true);
          });
          
          socket.on('connect_error', (error: Error) => {
            setConnectionStatus('Connection failed');
            reject(error);
          });
          
          setTimeout(() => {
            if (!socket.connected) {
              reject(new Error('Connection timeout'));
            }
          }, 10000);
        });
        
        let localVideo = document.getElementById("localVideo") as HTMLVideoElement;
        if (!localVideo) {
          localVideo = document.createElement("video");
          localVideo.id = "localVideo";
          localVideo.autoplay = true;
          localVideo.playsInline = true;
          localVideo.muted = true;
          localVideo.style.display = "none";
          document.body.appendChild(localVideo);
        }
        
        let remoteContainer = document.getElementById("remoteContainer") as HTMLDivElement;
        if (!remoteContainer) {
          remoteContainer = document.createElement("div");
          remoteContainer.id = "remoteContainer";
          remoteContainer.style.display = "none";
          document.body.appendChild(remoteContainer);
        }

        let screenShareContainer = document.getElementById("screenShareContainer") as HTMLDivElement;
        if (!screenShareContainer) {
          screenShareContainer = document.createElement("div");
          screenShareContainer.id = "screenShareContainer";
          screenShareContainer.className = "fixed inset-0 z-50 bg-black hidden flex items-center justify-center";
          document.body.appendChild(screenShareContainer);
        }
        
        mediaRoutes = new MediaRoutes(
          socket,
          ROOM_ID,
          localVideo,
          remoteContainer,
          screenShareContainer
        );
        
        mediaRoutesRef.current = mediaRoutes;
        
        mediaRoutes.subscribe((updatedParticipants: any[]) => {
          setParticipants(updatedParticipants.map(p => ({
            id: p.id,
            name: p.isLocal ? "You" : p.name || `User ${p.id.slice(0, 4)}`,
            isLocal: p.isLocal,
            isHost: p.isLocal,
            isMuted: p.isMuted ?? false,
            hasVideo: p.hasVideo ?? false,
            videoProducerId: p.videoProducerId,
            audioProducerId: p.audioProducerId,
            stream: p.stream
          })));
        });

        mediaRoutes.subscribeChat((messages: ChatMessage[]) => {
          setChatMessages(messages);
        });

        mediaRoutes.subscribeScreenShare((data: {isSharing: boolean, sharerId?: string}) => {
          setIsScreenSharing(data.isSharing);
          setActiveScreenShare(data.sharerId || null);
          if (screenShareContainer) {
            if (data.isSharing && data.sharerId !== socket.id) {
              screenShareContainer.style.display = 'flex';
            } else {
              screenShareContainer.style.display = 'none';
            }
          }
        });

        await mediaRoutes.joinRoom();
        await mediaRoutes.startSending();
        
        try {
          await mediaRoutes.startReceiving();
        } catch (error) {
          setTimeout(async () => {
            try {
              await mediaRoutes?.startReceiving();
            } catch (retryError) {}
          }, 500);
        }
        
      } catch (error) {
        setConnectionStatus('Failed to connect');
        console.error('Meeting initialization error:', error);
      }
    };

    initializeMeeting();

    return () => {
      if (mediaRoutesRef.current) {
        mediaRoutesRef.current.leaveRoom();
      }
    };
  }, []);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    mediaRoutesRef.current?.handleChat(chatMessage, ROOM_ID);
    setChatMessage("");
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      mediaRoutesRef.current?.leaveRoom();
      window.location.href = '/';
    }
  };

  const handleToggleMute = async () => {
    if (mediaRoutesRef.current) {
      const newState = await mediaRoutesRef.current.toggleMute();
      setIsMuted(!newState);
    }
  };

  const handleToggleVideo = async () => {
    if (mediaRoutesRef.current) {
      const newState = await mediaRoutesRef.current.toggleVideo();
      setHasVideo(newState);
    }
  };

  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      await mediaRoutesRef.current?.startScreenShare();
    } else {
      await mediaRoutesRef.current?.stopScreenShare();
    }
  };

  const closeScreenShare = () => {
    if (activeScreenShare === mediaRoutesRef.current?.service.socket.id) {
      handleScreenShare();
    }
    setActiveScreenShare(null);
    if (screenShareContainerRef.current) {
      screenShareContainerRef.current.style.display = 'none';
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getParticipantName = (socketId: string) => {
    const participant = participants.find(p => p.id === socketId);
    return participant ? participant.name : `User ${socketId.slice(0, 4)}`;
  };

  // Calculate responsive grid layout
  const getGridLayout = () => {
    const count = participants.length;
    
    if (isMobile) {
      // Mobile: Always single column for better mobile experience
      return {
        gridClass: "grid-cols-1",
        containerClass: "space-y-4"
      };
    }
    
    // Desktop responsive grid
    if (count <= 2) {
      return {
        gridClass: "grid-cols-1 md:grid-cols-2",
        containerClass: "gap-4 md:gap-6"
      };
    } else if (count <= 4) {
      return {
        gridClass: "grid-cols-1 md:grid-cols-2",
        containerClass: "gap-4 md:gap-6"
      };
    } else if (count <= 6) {
      return {
        gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        containerClass: "gap-4 md:gap-6"
      };
    } else {
      return {
        gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        containerClass: "gap-4 md:gap-6"
      };
    }
  };

  const gridLayout = getGridLayout();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col" ref={mainContainerRef}>
      <video id="localVideo" autoPlay playsInline muted className="hidden" />
      <div id="remoteContainer" ref={remoteContainerRef}></div>
      
      <div 
        id="screenShareContainer" 
        ref={screenShareContainerRef} 
        className="fixed inset-0 z-50 bg-black hidden items-center justify-center"
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={closeScreenShare}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-white text-center p-8">
          <div className="text-2xl mb-2">🎥 Screen Sharing Active</div>
          <p className="text-gray-300">Shared by {activeScreenShare ? getParticipantName(activeScreenShare) : 'Participant'}</p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            onClick={() => window.location.href = '/'}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            {!isMobile && "Leave Meeting"}
          </Button>
          <div className="hidden md:block h-6 w-px bg-gray-300 mx-2"></div>
          <h1 className="text-sm md:text-lg font-semibold text-gray-800 truncate max-w-[150px] md:max-w-none">
            Product Review Meeting
          </h1>
          <div className={`px-3 py-1 text-xs rounded-full font-medium ${
            connectionStatus === 'Connected' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : connectionStatus === 'Connecting...'
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {connectionStatus}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatDuration(meetingDuration)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4" />
            <span className="font-medium">{participants.length} Online</span>
          </div>
          <Button
            variant="destructive"
            onClick={handleLeave}
            size={isMobile ? "sm" : "default"}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <Phone className="w-4 h-4 md:mr-2 rotate-180" />
            {!isMobile && "Leave Meeting"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {participants.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">Welcome to the meeting!</h3>
                <p className="text-gray-600 mb-6">You're the first to arrive. Share the meeting link with others to get started.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-medium">Meeting ID: <span className="font-mono">{ROOM_ID}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Participants ({participants.length})</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-gray-600 hover:text-blue-600 rounded-full"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className={`grid ${gridLayout.gridClass} ${gridLayout.containerClass} overflow-auto p-1`}>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 aspect-video ${
                      participant.isLocal ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    {participant.isLocal && !participant.hasVideo && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg">
                          <div className="flex items-center space-x-2 text-white">
                            {participant.isMuted && <MicOff className="w-5 h-5 text-red-300" />}
                            {!participant.hasVideo && <VideoOff className="w-5 h-5 text-red-300" />}
                          </div>
                        </div>
                        <span className="text-white font-medium">Camera Off</span>
                      </div>
                    )}
                    
                    {participant.isLocal ? (
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={(el) => {
                          if (el) {
                            const src = (document.getElementById("localVideo") as HTMLVideoElement)?.srcObject;
                            if (src && el.srcObject !== src) el.srcObject = src;
                          }
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: participant.hasVideo ? 1 : 0 }}
                      />
                    ) : (
                      <ParticipantVideo
                        producerId={participant.videoProducerId}
                        stream={participant.stream}
                        hasVideo={participant.hasVideo}
                      />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-bold">
                              {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 md:space-x-2">
                              <span className="text-white font-semibold text-sm truncate max-w-[100px] md:max-w-[150px]">
                                {participant.name}
                              </span>
                              {activeScreenShare === participant.id && (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                  Sharing
                                </span>
                              )}
                              {participant.isLocal && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {participant.isMuted && (
                                <span className="inline-flex items-center text-xs text-red-300">
                                  <MicOff className="w-3 h-3 mr-1" /> Muted
                                </span>
                              )}
                              {!participant.hasVideo && (
                                <span className="inline-flex items-center text-xs text-red-300">
                                  <VideoOff className="w-3 h-3 mr-1" /> Camera Off
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`${isMobile ? 'fixed inset-0 z-40 bg-white' : 'w-96'} border-l border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-xl ${
          (showChat || showParticipants) ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {isMobile && (
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-semibold text-gray-800">
                {showChat ? 'Chat' : 'Participants'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChat(false);
                  setShowParticipants(false);
                }}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all duration-300 ${
                  showParticipants && !showChat
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all duration-300 ${
                  showChat
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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

          {showParticipants && !showChat && (
            <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] overflow-y-auto" ref={participantsContainerRef}>
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Participants ({participants.length})
                </h3>
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-medium text-sm">
                              {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          {participant.isMuted && (
                            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                              <MicOff className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {participant.name}
                            </span>
                            {participant.isHost && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Host</span>
                            )}
                            {activeScreenShare === participant.id && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Sharing
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {participant.isLocal && <span>• You</span>}
                            {participant.isMuted && <span>• Muted</span>}
                            {!participant.hasVideo && <span>• Camera Off</span>}
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {participant.isLocal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={participant.isMuted ? handleToggleMute : undefined}
                          >
                            {participant.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showChat && (
            <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-180px)]">
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map(message => {
                      const isOwnMessage = message.senderId === mediaRoutesRef.current?.service.socket.id;
                      return (
                        <div key={message.id} className={`rounded-2xl p-4 ${isOwnMessage ? 'bg-gradient-to-r from-blue-50 to-blue-100 ml-8' : 'bg-gray-50 mr-8'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium text-sm ${isOwnMessage ? 'text-blue-700' : 'text-gray-700'}`}>
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-sm text-gray-800">{message.text}</p>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>
              </div>
              <div className="p-4 md:p-6 border-t bg-white">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Type your message here..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-gray-50 rounded-full border-0 focus:ring-2 focus:ring-blue-500 outline-none px-4 py-3 shadow-sm"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!chatMessage.trim()}
                    className="rounded-full px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 md:px-6 py-4 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center space-x-2 md:space-x-4 lg:space-x-6">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size={isMobile ? "icon" : "lg"}
              onClick={handleToggleMute}
              className={`rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg'} transition-all duration-300`}
            >
              {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
              {!isMobile && <span className="ml-2">{isMuted ? 'Unmute' : 'Mute'}</span>}
            </Button>

            <Button
              variant={hasVideo ? "secondary" : "destructive"}
              size={isMobile ? "icon" : "lg"}
              onClick={handleToggleVideo}
              className={`rounded-full ${hasVideo ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'} transition-all duration-300`}
            >
              {hasVideo ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
              {!isMobile && <span className="ml-2">{hasVideo ? 'Stop Video' : 'Start Video'}</span>}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size={isMobile ? "icon" : "lg"}
              onClick={handleScreenShare}
              className={`rounded-full ${isScreenSharing ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg'} transition-all duration-300`}
            >
              <Monitor className="w-5 h-5 md:w-6 md:h-6" />
              {!isMobile && <span className="ml-2">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>}
            </Button>

            <Button
              variant={showChat ? "default" : "secondary"}
              size={isMobile ? "icon" : "lg"}
              onClick={() => {
                if (isMobile) {
                  setShowChat(!showChat);
                  setShowParticipants(!showChat);
                } else {
                  // On desktop, toggle between chat and participants
                  if (showChat) {
                    setShowParticipants(true);
                    setShowChat(false);
                  } else {
                    setShowChat(true);
                    setShowParticipants(false);
                  }
                }
              }}
              className={`rounded-full ${showChat ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg'} transition-all duration-300`}
            >
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
              {!isMobile && <span className="ml-2">Chat</span>}
            </Button>

            {!isMobile && (
              <>
                <Button
                  variant={showParticipants && !showChat ? "default" : "secondary"}
                  size="lg"
                  onClick={() => {
                    setShowParticipants(!showParticipants);
                    setShowChat(false);
                  }}
                  className={`rounded-full ${showParticipants && !showChat ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg'} transition-all duration-300`}
                >
                  <Users className="w-5 h-5" />
                  <span className="ml-2">Participants</span>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Settings className="w-5 h-5" />
                  <span className="ml-2">Settings</span>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
