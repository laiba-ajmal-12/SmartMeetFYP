import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
import { organizationValidator } from "./orginzationChecks.ts";
import type { OrganizationDTOs } from "../../Domain Layer/DTOs/OrganizationDTOs/organizationDTO.js";
import type { IOrganizationService } from "../../Domain Layer/InterFaces/IOrganizationService.js";
import type { Member } from "../../Domain Layer/DTOs/OrganizationMemberDTOs/memberDTOs.js";
import type { IOrganizationMemberService } from "../../Domain Layer/InterFaces/IOrganizatiobMemberService.js";
import { ApplicationError } from "../ErrorHandling/appErrors.js";
export class OrganizationService {

    private userdataStorage:IUserService; 
    private OrganDataStorage:IOrganizationService;
    private validation: organizationValidator;
    private memberStorage: IOrganizationMemberService;

    constructor(OD:IOrganizationService, ds:IUserService , ms:IOrganizationMemberService ){
        this.userdataStorage= ds;
        this.memberStorage = ms;
        this.OrganDataStorage = OD;
        this.validation = new organizationValidator(this.userdataStorage , this.OrganDataStorage)
    }

    async createOrganization(organ:OrganizationDTOs ):Promise<OrganizationDTOs> {
        if(organ.name == null){
            throw new ApplicationError(400,"Bad Request")
        } 
        let crOrgan:OrganizationDTOs =  await this.OrganDataStorage.createOrganization(organ);
        crOrgan.organizationCode =  String(crOrgan.id)+String(this.validation.getRandomFiveDigit());
        await this.updateOrganization(crOrgan)
        return crOrgan;
    }

    async updateOrganization(organ:OrganizationDTOs ):Promise<OrganizationDTOs> {
        const organExists =  await this.validation.isOrganizationExists(organ.id)
        const haveOnwerShip =  await this.validation.checkOwnership(organ.id, organ.ownerId)
        if (!organExists){
            throw new ApplicationError(404,"Not Found")
        }

        if (!haveOnwerShip){
            throw new ApplicationError(403,"Forbidden")
        }

        let organization:OrganizationDTOs =  await this.OrganDataStorage.updateOrganization(organ.id,organ);
        return organization;
    }

    async updateOrganizationCode(id:number , ownerId:number):Promise<OrganizationDTOs>{
        
        const organ:OrganizationDTOs | null = await this.OrganDataStorage.getOrganizationById(id);
        
        if (organ==  null){
            throw new ApplicationError(404,"Not Found")
        }
        if(ownerId != organ.ownerId){
            throw new ApplicationError(403,"Forbidden")
        }

        organ.organizationCode = String(organ.id) + String(this.validation.getRandomFiveDigit());
        await this.updateOrganization(organ);
        return organ;        
    }


    async deleteOrganization(organ:OrganizationDTOs ):Promise<OrganizationDTOs>{

        const organExists =  await this.validation.isOrganizationExists(organ.id)
        const haveOnwerShip =  await this.validation.checkOwnership(organ.id, organ.ownerId)

        if (!organExists){
            throw new ApplicationError(404,"Not Found")
        }
        if (!haveOnwerShip){
            throw new ApplicationError(403,"Forbidden")
        }

        const obj =  await this.OrganDataStorage.deleteOrganization(organ.id);
        const memebers:Member[] =await this.memberStorage.getAllMemberByOrganiztion(organ.id)
        await Promise.all(memebers.map(mem => this.memberStorage.deleteMember(mem.userId)));
        return obj;
    }

    

    

    
}