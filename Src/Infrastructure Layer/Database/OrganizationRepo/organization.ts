import type { OrganizationDTOs } from "../../../Domain Layer/DTOs/OrganizationDTOs/organizationDTO.js";
import PostSQLClinet from "../dbCon.ts"
import type { IOrganizationService } from "../../../Domain Layer/InterFaces/IOrganizationService.js";

export class OrganizationDbRepo implements IOrganizationService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async createOrganization(user: OrganizationDTOs): Promise<number> {
        const users  = await this.postSQlClient.organization.create({data:user})  
        return users.id;
    }
    async updateOrganization(ids : number ,user: OrganizationDTOs): Promise<number> {
        const users  = await this.postSQlClient.organization.update({where:{id : ids} , data:user})  
        return users.id;
    }
    async deleteOrganization(ids: number): Promise<number> {
        const users  = await this.postSQlClient.organization.delete({where:{id : ids}}) ; 
        return users.id;
    }
    async getOrganizationByHost(ids: number): Promise<OrganizationDTOs[]> {
        const users:OrganizationDTOs[] = await this.postSQlClient.organization.findMany({where:{ownerId : ids}}) ; 
        return users;
    }
}