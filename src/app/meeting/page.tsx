'use client';

import { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import {
  StreamCall,
  useStreamVideoClient,
  useCallStateHooks,
  ParticipantView,
  useCall,
  Call,
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading meeting parameters...</p>
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading...</p>
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
        const c = client.call('default', callId)
        await c.join({ create: true })
        
        // Enable camera and mic
        await c.camera.enable()
        await c.microphone.enable()
        
        setCall(c)
      } catch (e) {
        console.error('Join failed:', e)
        setError(e instanceof Error ? e.message : 'Failed to join meeting')
      }
    }

    join()
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
        <div className="text-center max-w-md w-full mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Failed to Join</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Joining meeting...</p>
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
  const [showChat, setShowChat] = useState(false) // Default to false on mobile
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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="flex-1 flex flex-col">
        <MeetingUI onToggleChat={() => setShowChat(!showChat)} showChat={showChat} />
      </div>

      {/* Chat Sidebar - overlay on mobile */}
      {showChat && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowChat(false)}
            />
          )}
          
          <div className={`
            ${isMobile ? 'fixed inset-y-0 right-0 z-50 w-full max-w-sm' : 'w-[360px]'}
            border-l bg-white shadow-2xl
          `}>
            <Chat client={chatClient} theme="messaging light">
              <Channel channel={channel}>
                <Window>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Meeting Chat</h3>
                    <button
                      onClick={() => setShowChat(false)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
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
  } = useCallStateHooks()

  const participants = useParticipants()
  const { microphone, isMute } = useMicrophoneState()
  const { camera, isMute: cameraOff } = useCameraState()

  const [meetingDuration, setMeetingDuration] = useState(0)
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

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
    if (!call) return
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        await call.screenShare.disable()
        setIsScreenSharing(false)
      } else {
        // Start screen sharing
        await call.screenShare.enable()
        setIsScreenSharing(true)
      }
    } catch (e) {
      console.error('Screen share toggle failed:', e)
      // Reset state on error
      setIsScreenSharing(false)
      
      // Provide user-friendly error message
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
      window.location.href = '/'
    } catch (e) {
      console.error('Leave failed:', e)
    }
  }

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const nameOf = (p: any) =>
    p.isLocalParticipant ? 'You' : p.name || p.userId || 'Guest'

  // Determine grid layout based on participant count
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

  // Get aspect ratio class
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b shadow-sm shrink-0">
        <h1 className="font-semibold text-base sm:text-xl text-gray-800 truncate">Meeting Room</h1>
        <div className="flex gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <Clock size={14} className="text-gray-500 sm:w-4 sm:h-4" />
            <span className="font-medium">{formatDuration(meetingDuration)}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <Users size={14} className="text-gray-500 sm:w-4 sm:h-4" />
            <span className="font-medium">{participants.length}</span>
          </div>
        </div>
      </header>

      {/* Participant Grid */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
        <div className={`grid gap-2 sm:gap-3 md:gap-4 ${getGridClass()} h-full content-start`}>
          {displayParticipants.map(p => (
            <div 
              key={p.sessionId} 
              className={`relative bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden shadow-lg ${getAspectClass()} group`}
              onClick={() => {
                if (participants.length > 1) {
                  setFocusedParticipant(focusedParticipant === p.sessionId ? null : p.sessionId)
                }
              }}
            >
              {/* Participant View */}
              <div className="absolute inset-0">
                <ParticipantView participant={p} />
              </div>

              {/* Focus/Unfocus button - show on hover for desktop, always show on mobile */}
              {participants.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFocusedParticipant(focusedParticipant === p.sessionId ? null : p.sessionId)
                  }}
                  className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/60 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                  title={focusedParticipant === p.sessionId ? "Exit focus" : "Focus on participant"}
                >
                  {focusedParticipant === p.sessionId ? (
                    <Minimize2 size={16} className="text-white sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize2 size={16} className="text-white sm:w-5 sm:h-5" />
                  )}
                </button>
              )}

              {/* Status indicators */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-10">
                {p.isLocalParticipant ? (
                  <>
                    {isMute && (
                      <div className="bg-red-500 p-1.5 sm:p-2.5 rounded-full shadow-lg">
                        <MicOff size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                    {cameraOff && (
                      <div className="bg-red-500 p-1.5 sm:p-2.5 rounded-full shadow-lg">
                        <VideoOff size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {!p.audioStream && (
                      <div className="bg-red-500 p-1.5 sm:p-2.5 rounded-full shadow-lg">
                        <MicOff size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                    {!p.videoStream && (
                      <div className="bg-red-500 p-1.5 sm:p-2.5 rounded-full shadow-lg">
                        <VideoOff size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Name badge */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/80 backdrop-blur-sm text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] truncate z-10">
                {nameOf(p)}
              </div>
            </div>
          ))}
        </div>

        {/* Show focused participant info */}
        {focusedParticipant && participants.length > 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setFocusedParticipant(null)}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Show all participants
            </button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white border-t px-2 sm:px-6 py-3 sm:py-5 shadow-lg shrink-0">
        <div className="flex justify-center items-center gap-1.5 sm:gap-3 flex-wrap">
          <button
            onClick={toggleMic}
            className={`p-3 sm:p-4 rounded-full transition-all shadow-md ${
              isMute
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={isMute ? 'Unmute' : 'Mute'}
          >
            {isMute ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={toggleCam}
            className={`p-3 sm:p-4 rounded-full transition-all shadow-md ${
              cameraOff
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {cameraOff ? <VideoOff size={18} className="sm:w-5 sm:h-5" /> : <Video size={18} className="sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 sm:p-4 rounded-full transition-all shadow-md hidden sm:flex ${
              isScreenSharing
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? <MonitorOff size={18} className="sm:w-5 sm:h-5" /> : <Monitor size={18} className="sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={onToggleChat}
            className={`p-3 sm:p-4 rounded-full transition-all shadow-md relative ${
              showChat
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Toggle chat"
          >
            <MessageSquare size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={leave}
            className="p-3 sm:p-4 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white text-red-600 transition-all ml-1 sm:ml-2 shadow-md"
            title="Leave meeting"
          >
            <PhoneOff size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button
            className="p-3 sm:p-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all shadow-md hidden sm:flex"
            title="Settings"
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}