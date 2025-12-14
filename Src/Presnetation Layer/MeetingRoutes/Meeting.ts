import express from "express";
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure Layer/Database/OrganizationRepo/organization.ts";
//@ts-ignore
import { ApplicationError } from "../../Busines Logic layer/ErrorHandling/appErrors.ts";
import fs from 'fs/promises';
//@ts-ignore
import { verifyUser} from "../MiddleWares/jwtAuthMiddleware.ts";
//@ts-ignore
import { MeetingService } from "../../Busines Logic layer/meetings/meetingService.ts";
//@ts-ignore
import { MeetingDbRepo } from "../../Infrastructure Layer/Database/Meeting/meetingRepo.ts";
import type { MeetingDTOs } from "../../Domain Layer/DTOs/MeetingDTOs/meetingDTOs.ts";


const MeetingRoute = express.Router()
const meetingService:MeetingService = new MeetingService(new OrganizationDbRepo , new MeetingDbRepo)

MeetingRoute.post('/CreateMeeting',verifyUser , async (req , res ) =>{
    try{
        const meeting =  req.body
        console.log('[Body]: '  , meeting)

        const meetingCreated:MeetingDTOs = {
            id:meeting.id,
            name:meeting.name,
            description:meeting.description,
            organizationId:Number(meeting.organizationId),
            startTime:new Date(`${meeting.date}T${meeting.time}:00`),
            daily: Boolean(meeting.daily) ,
            EnableEngagement: Boolean(meeting.EnableEngagement),
            weekly: meeting.weekly,
            hostId:Number(meeting.hostId),
            meetingDuration: Number(meeting.meetingDuration),
            meetingLink:meeting.meetingLink,
            Engagment:Number(meeting.Engagment),
        }
        const created = await meetingService.createMeeting(meetingCreated)
        return res.status(201).json(created)
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).json({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).json({"message":"Internal Server Error"})
        }
    }
})


MeetingRoute.put('/UpdateMeeting', verifyUser, async (req , res ) =>{
    try{
        
        const meeting:MeetingDTOs =  req.body
        const updated = await meetingService.updateMeeting(meeting)
        return res.status(204).json(updated)

    }catch(error){
        if (error instanceof ApplicationError){
            return res.status(error.status).json({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).json({"message":"Internal Server Error"})
        }
    }
})

MeetingRoute.delete('/DeleteMeeting/:meetingID',verifyUser, async (req:any, res:any) =>{
    try{
        const meeting:number = Number(req.params.meetingID)
        const result = await meetingService.cancelMeeting(req.user.id , meeting)
        return res.status(204).json({'message':'Deleted!'})

    }catch(error){
        if (error instanceof ApplicationError){
            return res.status(error.status).js({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).json({"message":"Internal Server Error"})
        }
    }
})



export default MeetingRoute;