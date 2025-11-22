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
        const meeting:MeetingDTOs =  req.body
        console.log('[Body]: '  , meeting)
        const created = await meetingService.createMeeting(meeting)
        return res.status(201).send(created)
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})


MeetingRoute.put('/UpdateMeeting', verifyUser, async (req , res ) =>{
    try{
        
        const meeting:MeetingDTOs =  req.body
        const updated = await meetingService.updateMeeting(meeting)
        return res.status(204).send(updated)

    }catch(error){
        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

MeetingRoute.delete('/DeleteMeeting/:meetingID',verifyUser, async (req:any, res:any) =>{
    try{
        const meeting:number = Number(req.params.meetingID)
        const result = await meetingService.cancelMeeting(req.user.id , meeting)
        return res.status(204).send()

    }catch(error){
        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})



export default MeetingRoute;