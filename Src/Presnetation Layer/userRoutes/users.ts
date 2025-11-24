
import express from 'express';
//@ts-ignore
import {generateToken } from '../../Infrastructure Layer/Authentication/jwt.ts'
//@ts-ignore
import verifyUser from '../MiddleWares/jwtAuthMiddleware.ts';
import type { InternalUserDTO } from '../../Domain Layer/DTOs/userDTOs/InternalUser.ts';
//@ts-ignore
import { upload } from '../MiddleWares/ImageMiddleware.ts';
//@ts-ignore
import { UserService } from '../../Busines Logic layer/user/userService.ts';
//@ts-ignore
import { hashPassword } from '../../Infrastructure Layer/bcrypt/bcrypt.ts';
//@ts-ignore
import { userDbRepo } from '../../Infrastructure Layer/Database/userRepo.ts/userDb.ts';
import type { LoginUserDTO } from '../../Domain Layer/DTOs/userDTOs/UserLogin.js';
import type { UserResponseDTO } from '../../Domain Layer/DTOs/userDTOs/UserResponse.js';
import fs from 'fs/promises';
//@ts-ignore
import { ApplicationError } from '../../Busines Logic layer/ErrorHandling/appErrors.ts';
//@ts-ignore
import {BrevoEmail} from '../../Infrastructure Layer/Email/email.ts'

const userRoute = express.Router();
const port = 3000;


userRoute.use(express.json());
const userService = new UserService(new hashPassword(), new userDbRepo() , new BrevoEmail("smartmeet07@gmail.com"))

userRoute.post("/signup", upload.single("image"), async (req, res) => {
  try{
    const user:InternalUserDTO =  req.body
    user.ImagePath = req.file?.path ?? "" ;
    const createdUser:InternalUserDTO = await userService.createUser(user);
    const token:string = generateToken(createdUser.id , createdUser.email);
    return res.status(201).json({"Token":token});
  }
  catch(err){
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (err instanceof ApplicationError){
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error]", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});

userRoute.post('/login', async (req, res) => {
  try{

      const user:LoginUserDTO = req.body;
      console.log('body -- > ' ,user)
      const userRes:UserResponseDTO = await userService.LoginUser(user);
      console.log('user Response: ' , userRes)
      const token:string = generateToken(userRes?.id, userRes?.email);
      return res.status(200).json({"Token":token, user:userRes});

  }catch(err){
    if (err instanceof ApplicationError){
      console.error("[Error] ", err)
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});


userRoute.post('/activateAccount',verifyUser,   async (req:any, res:any) => {
  try{

      const code = req.body;
      console.log('Activate: ' , code)
      const userRes:UserResponseDTO = await userService.ActivateAccount(req.user.id , code.code)
      return res.status(200).json({user:userRes});

  }catch(err){
    if (err instanceof ApplicationError){
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});

userRoute.post('/ForgetPassword',  async (req:any, res:any) => {
  try{

      const email = req.body;
      const resObj:boolean = await userService.forgetPassword(email)
      if (!res){
        return res.status(400).send('Error while Processing')
      }
      return res.status(200);

  }catch(err){
    if (err instanceof ApplicationError){
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});


userRoute.post('/resetPassword',  async (req:any, res:any) => {
  try{

      const {email,code, password} = req.body;
      const resObj:boolean = await userService.resetPassword(email , code , password);
      if (!res){
        return res.status(400).send('Error while Processing')
      }
      return res.status(200);

  }catch(err){
    if (err instanceof ApplicationError){
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});

export default userRoute;