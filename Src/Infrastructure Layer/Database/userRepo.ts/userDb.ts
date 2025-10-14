import type { InternalUserDTO } from "../../../Domain Layer/DTOs/userDTOs/InternalUser.ts";
import  type {IUserService} from "../../../Domain Layer/InterFaces/IUserService.ts";
import PostSQLClinet from "../dbCon.ts"

export class userDbRepo implements IUserService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async createUser(user: InternalUserDTO): Promise<number> {
        console.log('inside User ---- > ' , user)
        const users  = await this.postSQlClient.users.create({data:user})  
        return users.id;
    }
    async updateUser(ids : number ,user: InternalUserDTO): Promise<number> {
        const users  = await this.postSQlClient.users.update({where:{id : ids} , data:user})  
        return users.id;
    }
    async deleteUser(ids: number): Promise<number> {
        const users  = await this.postSQlClient.users.delete({where:{id : ids}}) ; 
        return users.id;
    }
    async getUserbyId(ids: number): Promise<InternalUserDTO | null> {
        const users:InternalUserDTO |null  = await this.postSQlClient.users.findUnique({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyEmail(emails: string): Promise<InternalUserDTO | null> {
        const users:InternalUserDTO |null   = await this.postSQlClient.users.findUnique({where:{email : emails}}) ; 
        return users;
    }
}