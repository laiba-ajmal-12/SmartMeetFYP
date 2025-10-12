import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.js";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
import { userValidator } from "./userChecks.js";
class UserCrud {

    private hasher:IhashService;
    private dataStorage:IUserService; 
    private validation :userValidator;
    constructor(hasher:IhashService , ds:IUserService ){
        this.hasher = hasher;
        this.dataStorage= ds;
        this.validation = new userValidator(this.dataStorage)
    }

    async createUser(user: InternalUserDTO):Promise<number> {

        try{
            if(
                user.name != null 
                && this.validation.isEmailCorrect(user.email) 
                &&  await this.validation.isEmailUnique(user.email)
            ){
                user.passwordHash = await this.hasher.hashPassword(user.passwordHash)
                return await this.dataStorage.createUser(user);
            }
        }catch(e){
            console.log(e);
        }
        finally{
            return -1;
        }
    }

    async LoginUser(email:string , pass:string):Promise<boolean> {

        try{
            if(this.validation.isEmailCorrect(email)){
                const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email)
                if(user == null){
                    return false
                }
                const res: boolean = await this.hasher.comparePassword(pass, user.passwordHash)
                return res;
                
            }
        }catch(e){
            console.log(e);
        }
        finally{
            return false;
        }
    }


    
}