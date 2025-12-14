import express from "express";
//@ts-ignore
import { OrganizationService } from "../../Busines Logic layer/organization/organService.ts";
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure Layer/Database/OrganizationRepo/organization.ts";
//@ts-ignore
import { userDbRepo } from "../../Infrastructure Layer/Database/userRepo.ts/userDb.ts";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../../Infrastructure Layer/Database/Member/OrganizationMember.ts";
//@ts-ignore
import { ApplicationError } from "../../Busines Logic layer/ErrorHandling/appErrors.ts";
//@ts-ignore
import type { OrganizationDTOs } from "../../Domain Layer/DTOs/OrganizationDTOs/organizationDTO.ts";
//@ts-ignore
import { upload } from '../MiddleWares/ImageMiddleware.ts';
import fs from 'fs/promises';
//@ts-ignore
import { verifyUser} from "../MiddleWares/jwtAuthMiddleware.ts";
//@ts-ignore
import { MeetingDbRepo } from "../../Infrastructure Layer/Database/Meeting/meetingRepo.ts";


const organRoute = express.Router()
organRoute.use(express.json());
const OrganService: OrganizationService = new OrganizationService(new OrganizationDbRepo() , new userDbRepo() , new OrganizationMemberDbRepo(),new MeetingDbRepo);

organRoute.post('/CreateOrganization',verifyUser ,upload.single("image"),  async (req:any , res:any) =>{
    try{
        const organ:OrganizationDTOs =  req.body
        organ.ImagePath = req.file?.path?? null;
        organ.ownerId = req.user.id
        console.log("[Object Recivied]: " , organ)
        organ.domainRestrictionFlag = Boolean(organ.domainRestrictionFlag);
        const created:OrganizationDTOs = await OrganService.createOrganization(organ)
        return res.status(201).json({"Organization":created});
    }catch(error){

        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

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


organRoute.put('/UpdateOrganization', verifyUser, upload.single("image") , async (req:any , res:any) =>{
    try{
        const organ:OrganizationDTOs =  req.body
        organ.ImagePath = req.file?.path?? null;
        organ.id = Number(organ.id);
        organ.ownerId= req.user.id;
        organ.domainRestrictionFlag = Boolean(organ.domainRestrictionFlag);
        const updated:OrganizationDTOs = await OrganService.updateOrganization(organ);
        return res.status(200).send(updated)

    }catch(error){
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
            
        }
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

organRoute.get('/changeOrganizationCode/:id',verifyUser, async (req:any, res:any) =>{
    try{
        const code = await OrganService.updateOrganizationCode(Number(req.params.id) , req.user.id)
        return res.status(200).json({"organizationCode": code})

    }catch(error){
        if (error instanceof ApplicationError){
            console.error('[Error]: ' , error.message)
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})


organRoute.delete('/DeleteOrganization/:id',verifyUser ,upload.single("image"),  async (req:any, res:any ) =>{
    try{
        await OrganService.deleteOrganization(Number(req.params.id) , req.user.id)
        return res.status(204).send()
    }catch(error){

        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

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



export default organRoute;