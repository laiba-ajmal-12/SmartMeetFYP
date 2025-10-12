import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.js";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
export class userValidator {
 
    private dataStorage:IUserService;

    constructor(ds:IUserService ){
            this.dataStorage= ds;
    }
    isEmailCorrect(email:string):boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(emailRegex.test(email)){
            return true;
        }
        return false;
    }

    async isEmailUnique(email:string):Promise<boolean>{
        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email);
        if(user){
            return true;
        }
        return false;
    }
    
}


