import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain Layer/DTOs/userDTOs/InternalUser.js";
import type { IhashService } from "../../Domain Layer/InterFaces/IHashService.js";
import type { IUserService } from "../../Domain Layer/InterFaces/IUserService.js";
import { userValidator } from "./userChecks.ts";
import type { UserResponseDTO } from "../../Domain Layer/DTOs/userDTOs/UserResponse.js";
import type { LoginUserDTO } from "../../Domain Layer/DTOs/userDTOs/UserLogin.js";
import { ApplicationError } from "../ErrorHandling/appErrors.ts";
export class UserService {

    private hasher:IhashService;
    private dataStorage:IUserService; 
    private validation :userValidator;

    constructor(hasher:IhashService , ds:IUserService ){
        this.hasher = hasher;
        this.dataStorage= ds;
        this.validation = new userValidator(this.dataStorage)
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
}