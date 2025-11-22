import type { IOrganizationService } from "../../Domain Layer/InterFaces/IOrganizationService.ts";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.ts";
import type { IMeetingService } from "../../Domain Layer/InterFaces/IMeetingService.ts";
import type { MeetingDTOs } from "../../Domain Layer/DTOs/MeetingDTOs/meetingDTOs.ts";
//@ts-ignore
import { MeetingValidator } from "./meetingChecks.ts";
export class MeetingService {

    private meetingDataStorage:IMeetingService;
    private validation: MeetingValidator;

    constructor(OD:IOrganizationService , MS: IMeetingService){
        this.meetingDataStorage = MS;
        this.validation = new MeetingValidator(OD)
    }

    async createMeeting(meeting:MeetingDTOs ):Promise<MeetingDTOs> {
        const startTime = meeting.startTime instanceof Date ? meeting.startTime : new Date(meeting.startTime);
        const endTime = meeting.endTime ? (meeting.endTime instanceof Date ? meeting.endTime : new Date(meeting.endTime)) : null;

        const validTime = this.validation.isTimeValid(startTime);
        const organization =await this.validation.isOrganizationExists(meeting.organizationId);
        if (endTime){
            const validEndTime = this.validation.isValidEndTime(startTime , endTime)
            if (!validEndTime){
                throw new ApplicationError(400,"End time is Not Valid!")
            }
        }

        if (!validTime ){
            throw new ApplicationError(400 , "Start Time is not Valid");
        }
        if (!organization){
            throw new ApplicationError(400 , "Organization Not Exists");
        }
        const meet:MeetingDTOs = await this.meetingDataStorage.createMeeting(meeting);
        return meet;
    }

    async updateMeeting(meeting:MeetingDTOs ):Promise<MeetingDTOs> {
        const validTime = this.validation.isTimeValid(meeting.startTime);
        const organization =await this.validation.isOrganizationExists(meeting.organizationId);
        if (meeting.endTime){
            const validEndTime = this.validation.isValidEndTime(meeting.startTime , meeting.endTime)
            if (!validEndTime){
                throw new ApplicationError(400,"End Time is not Valid")
            }
        }

        if (!validTime ){
            throw new ApplicationError(400 , "End Time is not valid");
        }
        if (!organization){
            throw new ApplicationError(400 , "organization Not Exists");
        }
        const meet:MeetingDTOs = await this.meetingDataStorage.updateMeeting(meeting.id,meeting);
        return meet;
    }

    async cancelMeeting(userId:number,meetingId:number):Promise<boolean>{
        
        const meetingDB:MeetingDTOs | null = await this.meetingDataStorage.getMeetingbyid(meetingId);    
        if(meetingDB == null){
            throw new ApplicationError(404,"Meeting Not Found")
        }

        const organization =await this.validation.isOrganizationExists(meetingDB.organizationId);
        if (!organization){
            throw new ApplicationError(400 , "Organization is not Valid");
        }

        if(userId !=meetingDB.hostId){
            throw new ApplicationError(403 , "UnAutherized");
        }

        const del:number = await this.meetingDataStorage.deleteMeeting(meetingDB.id);
        return del != 0;
    }
    
}