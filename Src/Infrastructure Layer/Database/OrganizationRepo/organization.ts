import PostSQLClinet from "../dbCon.ts"
import type { IOrganizationService } from "../../../Domain Layer/InterFaces/IOrganizationService.js";
import type { OrganizationDTOs } from "../../../Domain Layer/DTOs/OrganizationDTOs/organizationDTO.js";

export class OrganizationDbRepo implements IOrganizationService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async createOrganization(user: OrganizationDTOs): Promise<OrganizationDTOs> {
        const users  = await this.postSQlClient.organization.create({data:user})  
        return users;
    }
    async updateOrganization(ids : number ,user: OrganizationDTOs): Promise<OrganizationDTOs> {
        const users  = await this.postSQlClient.organization.update({where:{id : ids} , data:user})  
        return users;
    }
    async getOrganizationById(id:number):Promise<OrganizationDTOs | null>{
        const user:OrganizationDTOs | null  = await this.postSQlClient.organization.findUnique({where:{id : id}})
        return user;
    }
    async deleteOrganization(ids: number): Promise<OrganizationDTOs> {
        const users  = await this.postSQlClient.organization.delete({where:{id : ids}}) ; 
        return users;
    }
    async getOrganizationByHost(ids: number): Promise<OrganizationDTOs[]> {
        const users:OrganizationDTOs[] = await this.postSQlClient.organization.findMany({where:{ownerId : ids}}) ; 
        return users;
    }
}