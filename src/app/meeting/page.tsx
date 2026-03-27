'use client';

import { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import {
  StreamCall,
  useStreamVideoClient,
  useCallStateHooks,
  ParticipantView,
  useCall,
  Call,
  hasAudio,
  hasVideo,
  hasScreenShare,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'

import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  useChatContext,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'

import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Users,
  Settings,
  Clock,
  Loader2,
  Monitor,
  MonitorOff,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  User,
  ScreenShare,
} from 'lucide-react'

import StreamVideoWrapper from './stream'
import { useSearchParams } from 'next/navigation'

interface MeetingHandlers {
  leave: () => Promise<void>
  cameraOff: () => Promise<void>
  cameraOn: () => Promise<void>
}

declare global {
  interface Window {
    __meetingHandlers?: MeetingHandlers
  }
}

function MeetingPage() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState('')
  const [meetingId, setMeetingId] = useState('')

  useEffect(() => {
    const userIdParam = searchParams.get('userId')
    const meetingIdParam = searchParams.get('meetingId')
    
    if (userIdParam) setUserId(String(userIdParam))
    if (meetingIdParam) setMeetingId(String(meetingIdParam))
  }, [searchParams])

  const callId = meetingId

  if (!userId || !meetingId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-alice-white via-white to-alice-white">
        <div className="absolute top-20 left-20 w-72 h-72 bg-royal-blue/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-deep-wine/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-royal-blue/10 to-deep-wine/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-12 h-12 text-royal-blue animate-spin" />
          </div>
          <p className="text-2xl font-bold text-rich-black mb-2">Preparing meeting...</p>
          <p className="text-sm text-onyx-gray/60">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <StreamVideoWrapper 
      userId={userId} 
      meetingId={callId}
      onLeave={() => {}}
      onCameraOff={() => {}}
      onCameraOn={() => {}}
      onEnd={async () => {}}
    >
      <MeetingRoom callId={callId} meetingId={meetingId} />
    </StreamVideoWrapper>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-alice-white via-white to-alice-white">
        <div className="absolute top-20 left-20 w-72 h-72 bg-royal-blue/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-deep-wine/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-royal-blue/10 to-deep-wine/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-12 h-12 text-royal-blue animate-spin" />
          </div>
          <p className="text-2xl font-bold text-rich-black">Loading...</p>
        </div>
      </div>
    }>
    <MeetingPage />
    </Suspense>
  )
}

function MeetingRoom({ callId, meetingId }: { callId: string; meetingId: string }) {
  const client = useStreamVideoClient()
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)
  const joinedRef = useRef(false)

  useEffect(() => {
    if (!client || joinedRef.current) return
    joinedRef.current = true

    const join = async () => {
      try {
        const preferencesString = sessionStorage.getItem('meetingPreferences');
        let micEnabled = false;
        let videoEnabled = false;

        if (preferencesString) {
          try {
            const preferences = JSON.parse(preferencesString);
            micEnabled = preferences.micEnabled || false;
            videoEnabled = preferences.videoEnabled || false;
            sessionStorage.removeItem('meetingPreferences');
          } catch (error) {
            console.error('Error parsing preferences:', error);
          }
        }

        const c = client.call('default', callId);

        // Disable both devices BEFORE joining so the call starts in the correct state
        await c.camera.disable();
        await c.microphone.disable();

        // Join the call — other participants will immediately see correct mute/video state
        await c.join({ create: true });

        // Selectively enable based on user's pre-join preferences
        if (videoEnabled) {
          await c.camera.enable();
        }

        if (micEnabled) {
          await c.microphone.enable();
        }

        // Only render the call UI after everything is configured
        setCall(c);

      } catch (e) {
        console.error('Join failed:', e);
        setError(e instanceof Error ? e.message : 'Failed to join meeting');
      }
    };

    join();
  }, [client, callId])

  useEffect(() => {
    return () => {
      if (call) {
        call.leave().catch((e: Error) => console.error('Leave error:', e))
      }
    }
  }, [call])

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 px-4">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="text-center max-w-md w-full mx-auto p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <X className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-rich-black mb-3">Failed to Join Meeting</h3>
          <p className="text-onyx-gray/70 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-royal-blue to-deep-wine hover:from-deep-wine hover:to-royal-blue text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-alice-white via-white to-alice-white">
        <div className="absolute top-20 left-20 w-72 h-72 bg-royal-blue/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-deep-wine/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-royal-blue/10 to-deep-wine/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-12 h-12 text-royal-blue animate-spin" />
          </div>
          <p className="text-2xl font-bold text-rich-black mb-2">Joining meeting...</p>
          <p className="text-sm text-onyx-gray/60">Connecting to video call</p>
        </div>
      </div>
    )
  }

  return (
    <StreamCall call={call}>
      <MeetingWithChat meetingId={meetingId} />
    </StreamCall>
  )
}

function MeetingWithChat({ meetingId }: { meetingId: string }) {
  const { client: chatClient } = useChatContext()
  const [showChat, setShowChat] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowChat(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const channel = useMemo(() => {
    if (!chatClient) return null
    return chatClient.channel('messaging', meetingId)
  }, [chatClient, meetingId])

  useEffect(() => {
    if (!channel) return
    channel.watch().catch(console.error)
  }, [channel])

  if (!channel) return null

  return (
    <div className="h-screen flex bg-gradient-to-br from-alice-white to-white relative overflow-hidden">
      <div className="flex-1 flex flex-col">
        <MeetingUI onToggleChat={() => setShowChat(!showChat)} showChat={showChat} />
      </div>

      {showChat && (
        <>
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setShowChat(false)}
            />
          )}
          
          <div className={`
            ${isMobile ? 'fixed inset-y-0 right-0 z-50 w-full max-w-sm' : 'w-[380px]'}
            border-l border-gray-200 bg-white shadow-2xl
          `}>
            <Chat client={chatClient} theme="messaging light">
              <Channel channel={channel}>
                <Window>
                  <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-royal-blue/5 to-deep-wine/5">
                    <h3 className="font-bold text-gray-800 text-lg">Meeting Chat</h3>
                    <button
                      onClick={() => setShowChat(false)}
                      className="p-2 hover:bg-gray-200 rounded-xl transition-all duration-200"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  </div>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          </div>
        </>
      )}
    </div>
  )
}

function MeetingUI({ 
  onToggleChat, 
  showChat,
}: { 
  onToggleChat: () => void
  showChat: boolean
}) {
  const call = useCall()

  const {
    useParticipants,
    useMicrophoneState,
    useCameraState,
    useScreenShareState,  
  } = useCallStateHooks()

  const participants = useParticipants()
  const { microphone, isMute } = useMicrophoneState()
  const { camera, isMute: cameraOff } = useCameraState()
  const { screenShare, isMute: isNotSharing } = useScreenShareState() 
  const isLocalUserSharing = !isNotSharing  

  const [meetingDuration, setMeetingDuration] = useState(0)
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null)

  useEffect(() => {
    const t = setInterval(() => setMeetingDuration(v => v + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const toggleMic = async () => {
    try {
      if (isMute) {
        await microphone.enable()
      } else {
        await microphone.disable()
      }
    } catch (e) {
      console.error('Mic toggle failed:', e)
    }
  }

  const toggleCam = async () => {
    try {
      if (cameraOff) {
        await camera.enable()
      } else {
        await camera.disable()
      }
    } catch (e) {
      console.error('Camera toggle failed:', e)
    }
  } 

  const toggleScreenShare = async () => {
    try {
      if (isLocalUserSharing) {
        await screenShare.disable()
      } else {
        await screenShare.enable()
      }
    } catch (e) {
      console.error('Screen share toggle failed:', e)
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        alert('Screen share permission was denied. Please allow screen sharing in your browser settings.')
      } else if (errorMessage.includes('not supported')) {
        alert('Screen sharing is not supported in your browser. Please use Chrome, Edge, or Firefox.')
      } else {
        alert('Failed to share screen: ' + errorMessage)
      }
    }
  }

  const leave = async () => {
    if (!call) return
    if (!confirm('Are you sure you want to leave this meeting?')) return
    
    try {
      await call.leave()
      window.location.href = '/main'
    } catch (e) {
      console.error('Leave failed:', e)
    }
  }

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const nameOf = (p: any) =>
    p.isLocalParticipant ? 'You' : p.name || p.userId || 'Guest'

  const getGridClass = () => {
    const count = participants.length
    if (focusedParticipant) return 'grid-cols-1'
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2'
    if (count <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  const getAspectClass = () => {
    const count = participants.length
    if (focusedParticipant || count === 1) return 'aspect-video'
    if (count === 2) return 'aspect-video'
    return 'aspect-video'
  }

  const displayParticipants = focusedParticipant
    ? participants.filter(p => p.sessionId === focusedParticipant)
    : participants

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-lg px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-royal-blue to-deep-wine rounded-xl flex items-center justify-center shadow-md">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg sm:text-xl text-rich-black">Meeting Room</h1>
        </div>
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-royal-blue/10 to-deep-wine/10 px-3 sm:px-4 py-2 rounded-xl border border-royal-blue/20">
            <Clock size={16} className="text-royal-blue sm:w-[18px] sm:h-[18px]" />
            <span className="font-semibold text-rich-black">{formatDuration(meetingDuration)}</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-royal-blue/10 to-deep-wine/10 px-3 sm:px-4 py-2 rounded-xl border border-royal-blue/20">
            <Users size={16} className="text-deep-wine sm:w-[18px] sm:h-[18px]" />
            <span className="font-semibold text-rich-black">{participants.length}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-auto">
        <div className={`grid gap-3 sm:gap-4 md:gap-5 ${getGridClass()} h-full content-start`}>
          {displayParticipants.map(p => {
            const isVideoOff = p.isLocalParticipant ? cameraOff : !hasVideo(p)
            const isAudioOff = p.isLocalParticipant ? isMute : !hasAudio(p)
            const isSharingScreen = hasScreenShare(p)
            
            return (
              <div 
                key={p.sessionId} 
                className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl ${getAspectClass()} group transition-all duration-300 hover:shadow-royal-blue/20 hover:scale-[1.02]`}
                onClick={() => {
                  if (participants.length > 1) {
                    setFocusedParticipant(focusedParticipant === p.sessionId ? null : p.sessionId)
                  }
                }}
              >
                {isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-royal-blue/20 via-deep-wine/10 to-royal-blue/20">
                    <div className="text-center">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 bg-gradient-to-br from-royal-blue to-deep-wine rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-white/10">
                        <User className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
                      </div>
                      <p className="text-white text-base sm:text-xl font-bold drop-shadow-lg">{nameOf(p)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <ParticipantView participant={p} />
                  </div>
                )}

                {participants.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFocusedParticipant(focusedParticipant === p.sessionId ? null : p.sessionId)
                    }}
                    className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/70 backdrop-blur-md p-2 sm:p-2.5 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 hover:bg-black/90 hover:scale-110"
                    title={focusedParticipant === p.sessionId ? "Exit focus" : "Focus on participant"}
                  >
                    {focusedParticipant === p.sessionId ? (
                      <Minimize2 size={18} className="text-white sm:w-5 sm:h-5" />
                    ) : (
                      <Maximize2 size={18} className="text-white sm:w-5 sm:h-5" />
                    )}
                  </button>
                )}

                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 z-10">
                  {isSharingScreen && (
                    <div className="bg-green-500 p-2 sm:p-2.5 rounded-xl shadow-lg animate-pulse">
                      <ScreenShare size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                  )}
                  {isAudioOff && (
                    <div className="bg-red-500 p-2 sm:p-2.5 rounded-xl shadow-lg">
                      <MicOff size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                  )}
                  {isVideoOff && (
                    <div className="bg-red-500 p-2 sm:p-2.5 rounded-xl shadow-lg">
                      <VideoOff size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/80 backdrop-blur-md text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xl max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2rem)] truncate z-10 border border-white/10">
                  {nameOf(p)}
                </div>
              </div>
            )
          })}
        </div>

        {focusedParticipant && participants.length > 1 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setFocusedParticipant(null)}
              className="text-sm sm:text-base text-royal-blue hover:text-deep-wine font-semibold underline transition-colors"
            >
              Show all participants
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 px-3 sm:px-8 py-4 sm:py-6 shadow-2xl shrink-0">
        <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={toggleMic}
            className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 ${
              isMute
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            }`}
            title={isMute ? 'Unmute' : 'Mute'}
          >
            {isMute ? <MicOff size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={toggleCam}
            className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 ${
              cameraOff
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            }`}
            title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {cameraOff ? <VideoOff size={20} className="sm:w-6 sm:h-6" /> : <Video size={20} className="sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 hidden sm:flex ${
              isLocalUserSharing
                ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            }`}
            title={isLocalUserSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isLocalUserSharing ? <MonitorOff size={20} className="sm:w-6 sm:h-6" /> : <Monitor size={20} className="sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={onToggleChat}
            className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 ${
              showChat
                ? 'bg-gradient-to-br from-royal-blue to-deep-wine text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            }`}
            title="Toggle chat"
          >
            <MessageSquare size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="hidden sm:block w-px h-12 bg-gray-300 mx-2"></div>

          <button
            onClick={leave}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            title="Leave meeting"
          >
            <PhoneOff size={20} className="sm:w-6 sm:h-6" />
          </button>

          <button
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 hidden sm:flex"
            title="Settings"
          >
            <Settings size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}