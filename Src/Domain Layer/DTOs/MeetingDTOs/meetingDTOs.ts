export interface MeetingDTOs{
  id:number
  name:string
  description:string| null
  organizationId:number 
  startTime:Date
  daily: boolean 
  EnableEngagement:boolean
  weekly: boolean
  hostId:number
  meetingDuration:number
  meetingLink:string
  Engagment:number
}
