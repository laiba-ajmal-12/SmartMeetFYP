import type { InternalUserDTO } from "../../../Domain Layer/DTOs/userDTOs/InternalUser.ts";
import  type {IUserService} from "../../../Domain Layer/InterFaces/IUserService.ts";
//@ts-ignore
import PostSQLClinet from "../dbCon.ts"

export class userDbRepo implements IUserService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClinet.getClient();
        this.postSQlClient.$connect()
    }
    async createUser(user:InternalUserDTO): Promise<InternalUserDTO> {
        console.log('inside User ---- > ' , user)

           const userInterl = {
                name: user.name,
                email: user.email,
                password: user.password,
                ImagePath: user.ImagePath ?? null,         
                active: false,
                code: user.code ?? null,                    
                accountType: user.accountType ?? null,
                role: user.role ?? null,
                codeActivationTime: user.codeActivationTime ?? null
            };
        
        const users  = await this.postSQlClient.users.create({data:userInterl})  
        return users;
    }
    async updateUser(ids : number ,user: InternalUserDTO): Promise<InternalUserDTO> {

        const userInterl = {
                name: user.name,
                email: user.email,
                password: user.password,
                ImagePath: user.ImagePath ?? null,         
                active: false,
                code: user.code ?? null,                    
                accountType: user.accountType ?? null,
                role: user.role ?? null,
                codeActivationTime: user.codeActivationTime ?? null
        };
        

        const users  = await this.postSQlClient.users.update({where:{id : ids} , data:userInterl})  
        return users;
    }
    async deleteUser(ids: number): Promise<InternalUserDTO> {
        const users  = await this.postSQlClient.users.delete({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyId(ids: number): Promise<InternalUserDTO| null> {
        const users:InternalUserDTO |null  = await this.postSQlClient.users.findUnique({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyEmail(emails: string): Promise<InternalUserDTO | null> {
        const users:InternalUserDTO |null   = await this.postSQlClient.users.findUnique({where:{email : emails}}) ; 
        return users;
    }
}