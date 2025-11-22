import express from "express";
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure Layer/Database/OrganizationRepo/organization.ts";
//@ts-ignore
import { ApplicationError } from "../../Busines Logic layer/ErrorHandling/appErrors.ts";
//@ts-ignore
import { verifyUser} from "../MiddleWares/jwtAuthMiddleware.ts";
//@ts-ignore
import { MemberService } from "../../Busines Logic layer/Member/memberService.ts";
//@ts-ignore
import { userDbRepo } from "../../Infrastructure Layer/Database/userRepo.ts/userDb.ts";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../../Infrastructure Layer/Database/Member/OrganizationMember.ts";


const MemberRoute = express.Router()
MemberRoute.use(express.json());
MemberRoute.use(express.urlencoded({ extended: true }));
const memberService:MemberService = new MemberService( new OrganizationDbRepo, new OrganizationMemberDbRepo, new userDbRepo);

MemberRoute.post('/JoinOrganization',verifyUser , async (req:any , res:any ) =>{
    try{
        const code =  req.body.code
        console.log('[Body]: ' , code)
        const created = await memberService.joinOrganization(req.user.id , code)
        return res.status(201).send(created)
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

MemberRoute.delete('/leaveOrganization/:organId',verifyUser , async (req:any , res:any ) =>{
    try{
        const orId =  req.params.organId;
        const result  = await memberService.removeFromOrganization(Number(orId)  , req.user.id)
        return res.status(204).send()
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

export default MemberRoute;