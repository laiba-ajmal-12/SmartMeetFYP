import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.ts";
import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.ts";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.ts";
import { userValidator } from "./userChecks.ts";
export class UserCrud {

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
            console.log('User name:', user.name);
            console.log('Email correct?', this.validation.isEmailCorrect(user.email));
            console.log('Email unique?', await this.validation.isEmailUnique(user.email));
            if(
                user.name != null 
                && this.validation.isEmailCorrect(user.email) 
                &&  await this.validation.isEmailUnique(user.email)
            ){
                console.log('hel --- > ' )
                user.password = await this.hasher.hashPassword(user.password)
                return await this.dataStorage.createUser(user);
            }
            return -1;
        }catch(e){
            console.log(e);
            return -1;
        }
    }

    async LoginUser(email:string , pass:string):Promise<InternalUserDTO | null> {

        try{
            if(this.validation.isEmailCorrect(email)){
                const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email)
                if(user == null){
                    return null
                }
                const res: boolean = await this.hasher.comparePassword(pass, user.password)
                if(res == true){
                    return user;
                }
                return null
            }
        }catch(e){
            console.log(e);
        }
        finally{
            return null;
        }
    }


    
}
