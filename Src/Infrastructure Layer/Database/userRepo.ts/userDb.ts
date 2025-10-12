import type { InternalUserDTO } from "../../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import  type {IUserService} from "../../../Domain Layer/InterFaces/IUserService.js";
import PostSQLClinet from "../dbCon.js"

class userDbRepo implements IUserService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async createUser(user: InternalUserDTO): Promise<number> {

        const users  = await this.postSQlClient.user.create({data:user})  
        return users.id;
    }
    async updateUser(ids : number ,user: InternalUserDTO): Promise<number> {
        const users  = await this.postSQlClient.user.update({where:{id : ids} , data:user})  
        return users.id;
    }
    async deleteUser(ids: number): Promise<number> {
        const users  = await this.postSQlClient.user.delete({where:{id : ids}}) ; 
        return users.id;
    }
    async getUserbyId(ids: number): Promise<InternalUserDTO | null> {
        const users  = await this.postSQlClient.user.findUnique({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyEmail(emails: string): Promise<InternalUserDTO | null> {
        const users  = await this.postSQlClient.user.findUnique({where:{email : emails}}) ; 
        return users;
    }
}