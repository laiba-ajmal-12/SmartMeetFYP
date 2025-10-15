import type{ OrganizationDTOs } from "../DTOs/OrganizationDTOs/organizationDTO.js"

export interface IOrganizationService{
       createOrganization(organ:OrganizationDTOs): Promise<number>
       updateOrganization(id : number, organ:OrganizationDTOs): Promise<number>
       deleteOrganization(id:number): Promise<number>
       getOrganizationByHost(id:number):Promise<OrganizationDTOs[]>
}