import type { InternalUserDTO } from "../DTOs/userDTOs/InternalUser.js"; 

export interface IUserService{
       createUser(user:InternalUserDTO): Promise<number>
       updateUser(id : number, user:InternalUserDTO): Promise<number>
       deleteUser(id:number): Promise<number>
       getUserbyId(id:number):Promise<InternalUserDTO | null>
       getUserbyEmail(email:string):Promise<InternalUserDTO | null>
}