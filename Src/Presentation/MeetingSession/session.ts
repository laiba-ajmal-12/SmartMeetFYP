
export type ParticipantStats = {
  userId: number
  name: string
  isActive: boolean
  cameraOn: boolean
  currentJoinTime: Date | null
  totalActiveSeconds: number
  attentionSum: number
  gazeSum: number
  faceSum: number
  samples: number
}

export type MeetingSession = {
  meetingId: string
  hostId: number
  startTime: number
  endTime?: number
  participants: Map<number, ParticipantStats>
}

const meetings = new Map<string, MeetingSession>()

export function createMeeting(meetingId: string, hostId: number) {
  meetings.set(meetingId, {
    meetingId,
    hostId,
    startTime: Date.now(),
    participants: new Map()
  })
}

export function getMeeting(meetingId: string) {
  return meetings.get(meetingId)
}

export function endMeeting(meetingId: string) {
  meetings.delete(meetingId)
}
