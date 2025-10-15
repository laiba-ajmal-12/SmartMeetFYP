import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.ts";
import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.ts";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.ts";
import { userValidator } from "./userChecks.ts";
import type { UserResponseDTO } from "../../Domain Layer/DTOs/userDTOs/UserResponse.js";
import type { LoginUserDTO } from "../../Domain Layer/DTOs/userDTOs/UserLogin.js";
export class UserCrud {

    private hasher:IhashService;
    private dataStorage:IUserService; 
    private validation :userValidator;

    constructor(hasher:IhashService , ds:IUserService ){
        this.hasher = hasher;
        this.dataStorage= ds;
        this.validation = new userValidator(this.dataStorage)
    }

    async createUser(user: InternalUserDTO):Promise<number | null> {

        try{
            if(
                user.name != null 
                && this.validation.isEmailCorrect(user.email) 
                &&  await this.validation.isEmailUnique(user.email)
                && this.validation.isvalidRole(user.role)
            ){
                user.password = user.password.trim();
                user.email= user.email.trim().toLocaleLowerCase();
                user.password = await this.hasher.hashPassword(user.password)

                return await this.dataStorage.createUser(user);
            }
            return null;
        }catch(e){
            console.log(e);
            return null;
        }
    }

    async LoginUser(userCredintials:LoginUserDTO):Promise<UserResponseDTO | null> {

        try{
            if(this.validation.isEmailCorrect(userCredintials.email)){
                console.log('Email Correct! ');
                const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(userCredintials.email.trim().toLocaleLowerCase())
                if(user == null){
                    console.error("user"," not Found!")
                    return null
                }
                const res: boolean = await this.hasher.comparePassword(userCredintials.password.trim(), user.password)
                if(res == true){
                    console.error("password:","Match" )
                    const final: UserResponseDTO = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        ImagePath: user.ImagePath ?? " "
                    };
                   console.log( "final --- > ",final)
                   return final;
                }
                console.error("password:","misMatch" )
                return null
            }
        }catch(e){
            console.log(e);
            return null
        }
        return null;
        
    }


    
}