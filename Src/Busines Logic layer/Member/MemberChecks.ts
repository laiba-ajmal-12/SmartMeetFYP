import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.js";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
import type { promises } from "dns";
import type { IOrganizationMemberService } from "../../Domain Layer/InterFaces/IOrganizatiobMemberService.js";
import type { IOrganizationService } from "../../Domain Layer/InterFaces/IOrganizationService.js";
import type { OrganizationDTOs } from "../../Domain Layer/DTOs/OrganizationDTOs/organizationDTO.js";
import type { Member } from "../../Domain Layer/DTOs/OrganizationMemberDTOs/memberDTOs.js";
export class MemberValidator {
 
    private dataStorage:IUserService;
    private organDataStorage:IOrganizationService;
    private memberService:IOrganizationMemberService;

    constructor(ds:IUserService, od: IOrganizationService , ms:IOrganizationMemberService){

            this.dataStorage= ds;
            this.organDataStorage = od;
            this.memberService = ms;
    }

    async isValidUser(id:number):Promise<boolean>{
        const user = await this.dataStorage.getUserbyId(id);
        if (user=== null){
            return false;
        }
        return true;
    }

    
    async isOrganizationExists(id:number):Promise<boolean>{
          const organ:OrganizationDTOs | null  = await this.organDataStorage.getOrganizationById(id);
          if(organ == null){
            return false;
          }
          return true;
    }
}


