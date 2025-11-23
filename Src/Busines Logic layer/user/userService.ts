import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.js";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
//@ts-ignore
import { userValidator } from "./userChecks.ts";
import type { UserResponseDTO } from "../../Domain Layer/DTOs/userDTOs/UserResponse.js";
import type { LoginUserDTO } from "../../Domain Layer/DTOs/userDTOs/UserLogin.js";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.ts";
import type { IEmailService } from "../../Domain Layer/InterFaces/IEmailService.js";
export class UserService {

    private hasher:IhashService;
    private dataStorage:IUserService; 
    private validation :userValidator;
    private sendingEmails: IEmailService;

    constructor(hasher:IhashService , ds:IUserService , emailService: IEmailService ){
        this.hasher = hasher;
        this.dataStorage= ds;
        this.validation = new userValidator(this.dataStorage)
        this.sendingEmails = emailService;
    }

    async createUser(user: InternalUserDTO):Promise<InternalUserDTO> {

        if(user.name == null || user.name.length < 3){
            throw new ApplicationError(400,"Bad Request")
        }
        if (!this.validation.isEmailCorrect(user.email)){
            throw new ApplicationError(400,"Bad Request");
        }
        if(!await this.validation.isEmailUnique(user.email)){
            throw new ApplicationError(400,"Bad Request");
        }
        user.code = String(this.validation.getRandomFiveDigit())
        user.codeActivationTime =new Date();
        user.code && await this.sendingEmails.sendCode(user.email , user.code)
        user.password = user.password.trim();
        user.email= user.email.trim().toLocaleLowerCase();
        user.password = await this.hasher.hashPassword(user.password)
        return await this.dataStorage.createUser(user);
    }


    async LoginUser(userCredintials:LoginUserDTO):Promise<UserResponseDTO> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(userCredintials.email.trim().toLocaleLowerCase())
        
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        const res: boolean = await this.hasher.comparePassword(userCredintials.password.trim(), user.password)
        if (res == false){
            throw new ApplicationError(403,"Forbidden")
        }

        const final: UserResponseDTO = {
            id: user.id,
            name: user.name,
            email: user.email,
            ImagePath: user.ImagePath ?? " "
        };
        return final;    
    } 

    async ActivateAccount(id:number,code:string):Promise<UserResponseDTO | null> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyId(id)
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }

        if (user?.code && code !== user.code){
            throw new ApplicationError(400,"Wrong Code ")
        }

        let activeUser:InternalUserDTO | null =null;
        if ( user.codeActivationTime
             && user.code === code && 
             Date.now() <= new Date(user.codeActivationTime).getTime() + 10 * 60 * 1000
        ){
            user.active= true;
            activeUser = await this.dataStorage.updateUser(user.id , user);
        } 
        if (activeUser){
            const final: UserResponseDTO = {
                id: activeUser.id,
                name: activeUser.name,
                email: activeUser.email,
                ImagePath: activeUser.ImagePath ?? " "
            };
            return final;
        }
        return null;
       
    } 

    async forgetPassword(email:string):Promise<boolean> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email)
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        user.code = String(this.validation.getRandomFiveDigit())
        user.codeActivationTime =new Date();
        await this.dataStorage.updateUser(user.id , user);
        await this.sendingEmails.sendCode(user.email, user.code);
        return true;
    }


     async resetPassword(email:string,code:string , newPassowrd:string):Promise<boolean> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email)
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        if (user.codeActivationTime && new Date(user.codeActivationTime).getTime()+10 * 60 * 1000 < Date.now()){
            throw new ApplicationError(400,"Activation Code is Expire! Try Again")
        }
        if(user.code !== code ){
            throw new ApplicationError(400,"Wrong Code")
        }
        user.code = null;
        user.codeActivationTime = null;
        user.password = newPassowrd.trim();
        user.password = await this.hasher.hashPassword(user.password)

        await this.dataStorage.updateUser(user.id , user);
        return true;
    }
}