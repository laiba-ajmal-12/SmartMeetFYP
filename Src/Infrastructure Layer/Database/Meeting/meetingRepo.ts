import type{ MeetingDTOs } from "../../../Domain Layer/DTOs/MeetingDTOs/meetingDTOs.js";
import type { IMeetingService } from "../../../Domain Layer/InterFaces/IMeetingService.js";
import PostSQLClinet from "../dbCon.ts"

export class MeetingDbRepo implements IMeetingService{
    private postSQlClient;

    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }

    async createMeeting(meet: MeetingDTOs): Promise<number> {
        const meeting  = await this.postSQlClient.meeting.create({data:meet})  
        return meeting.id;
    }

    async updateMeeting(ids : number ,meet: MeetingDTOs): Promise<number> {
        const meeting:MeetingDTOs  = await this.postSQlClient.meeting.update({where:{id : ids} , data:meet})  
        return meeting.id;
    }

    async deleteMeeting(ids: number): Promise<number> {
        const meeting:MeetingDTOs   = await this.postSQlClient.meeting.delete({where:{id : ids}}) ; 
        return meeting.id;
    }

    async getMeetingbyOrganization(ids: number): Promise<MeetingDTOs[]> {
        const users:MeetingDTOs[] = await this.postSQlClient.meeting.findMany({where:{organizationId : ids}}) ; 
        return users;
    }

    async getMeetingbyid(ids: number): Promise<MeetingDTOs | null> {
        const meeting:MeetingDTOs | null= await this.postSQlClient.meeting.findUnique({where:{id : ids}}) ; 
        return meeting;
    }
}