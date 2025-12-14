import type { MeetingDTOs } from "../DTOs/MeetingDTOs/meetingDTOs.js"

export interface IMeetingService{
       createMeeting(organ:MeetingDTOs): Promise<MeetingDTOs>
       updateMeeting(id : number, organ:MeetingDTOs): Promise<MeetingDTOs>
       deleteMeeting(id:number): Promise<number>
       getMeetingbyOrganization(id:number):Promise<MeetingDTOs[]>
       getMeetingbyid(id:number):Promise<MeetingDTOs | null>
       getMeetingbyTime(int:string , organId:number , limit:number):Promise<MeetingDTOs[]>
}