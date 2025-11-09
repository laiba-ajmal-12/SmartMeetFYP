import type { OrganizationDTOs } from '../DTOs/OrganizationDTOs/organizationDTO.js'
import type { Member } from '../DTOs/OrganizationMemberDTOs/memberDTOs.js'

export interface IOrganizationMemberService{
       addMember(organ:Member): Promise<number>
       deleteMember(id:number): Promise<number>
       getOrganizationByMember(id:number):Promise<Member[]>
       getAllMemberByOrganiztion(id:number):Promise<Member[]>
}