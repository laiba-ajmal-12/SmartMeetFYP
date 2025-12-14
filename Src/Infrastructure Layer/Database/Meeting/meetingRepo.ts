import type { MeetingDTOs } from "../../../Domain Layer/DTOs/MeetingDTOs/meetingDTOs.js";
import type { IMeetingService } from "../../../Domain Layer/InterFaces/IMeetingService.js";
//@ts-ignore
import PostSQLClinet from "../dbCon.ts"

export class MeetingDbRepo implements IMeetingService{
    private postSQlClient;

    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async getMeetingbyTime(time:string, organizationId:number , limit:number): Promise<MeetingDTOs[]> {
        console.log('infra [time]: ' , time);
        const date = time && !isNaN(Number(time)) ? new Date(Number(time)) : new Date(0); 

        const users = await this.postSQlClient.meeting.findMany({
            where: {
                organizationId: organizationId,
                startTime: { gt: date } 
            },
            orderBy: {
                startTime: "asc" 
            },
            ...(limit > 0 && { take: limit })
        });

        return users;
    }

   async createMeeting(meet: MeetingDTOs): Promise<MeetingDTOs> {
       const meetperisma= {
           name:meet.name,
           description:meet.description,
           organizationId:meet.organizationId,
           startTime:meet.startTime,
           daily:meet.daily,
           EnableEngagement:meet.EnableEngagement,
            weekly: meet.weekly,
            hostId:meet.hostId,
            meetingDuration:meet.meetingDuration,
            meetingLink:meet.meetingLink,
        }
        console.log('called! -- ' , meetperisma);
        const meeting = await this.postSQlClient.meeting.create({ data: meetperisma });
        return meeting;
    }

    async updateMeeting(ids : number ,meet: MeetingDTOs): Promise<MeetingDTOs> {
        const meetperisma= {
            name:meet.name,
            description:meet.description,
            organizationId:meet.organizationId,
            startTime:meet.startTime,
            daily:meet.daily,
            EnableEngagement:meet.EnableEngagement,
            weekly: meet.weekly,
            hostId:meet.hostId,
            meetingDuration:meet.meetingDuration,
            meetingLink:meet.meetingLink,
            Engagment:meet.Engagment
        }

        const meeting:MeetingDTOs = await this.postSQlClient.meeting.update({where:{id : ids} , data:meetperisma})  
        return meeting;
    }

    async deleteMeeting(ids: number): Promise<number> {
        const meeting:MeetingDTOs  = await this.postSQlClient.meeting.delete({where:{id : ids}}) ; 
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