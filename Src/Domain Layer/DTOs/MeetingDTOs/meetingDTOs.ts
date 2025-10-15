export interface MeetingDTOs{
  id:number
  name:string
  description:string| null
  organizationId:number 
  startTime:Date
  endTime:Date | null
}
