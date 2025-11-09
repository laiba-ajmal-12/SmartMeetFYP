import PostSQLClinet from "../dbCon.ts"
import type { IOrganizationMemberService } from "../../../Domain Layer/InterFaces/IOrganizatiobMemberService.js";
import type { Member } from "../../../Domain Layer/DTOs/OrganizationMemberDTOs/memberDTOs.js";

export class OrganizationMemberDbRepo implements IOrganizationMemberService{
    private postSQlClient;

    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }

    async addMember(user:Member): Promise<number> {
        const users  = await this.postSQlClient.organizationMember.create({data:user})  
        return users.id;
    }

    async deleteMember(ids: number): Promise<number> {
        const users  = await this.postSQlClient.organizationMember.delete({where:{id : ids}}) ; 
        return users.id;
    }

    async getOrganizationByMember(ids: number): Promise<Member[]> {
        const organ:Member[] = await this.postSQlClient.organizationMember.findMany({where:{userId : ids}}) ; 
        return organ;
    }
    

    async getAllMemberByOrganiztion(id:number):Promise<Member[]>{
        const organ:Member[] = await this.postSQlClient.organizationMember.findMany({where:{organizationId : id}}) ; 
        return organ;
    }
}