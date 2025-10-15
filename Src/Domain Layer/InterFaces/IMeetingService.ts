import type { MeetingDTOs } from "../DTOs/MeetingDTOs/meetingDTOs.js"

export interface IMeetingService{
       createMeeting(organ:MeetingDTOs): Promise<number>
       updateMeeting(id : number, organ:MeetingDTOs): Promise<number>
       deleteMeeting(id:number): Promise<number>
       getMeetingbyOrganization(id:number):Promise<MeetingDTOs[]>
       getMeetingbyid(id:number):Promise<MeetingDTOs | null>
}