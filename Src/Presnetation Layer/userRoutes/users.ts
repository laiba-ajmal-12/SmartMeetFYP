import express from 'express';
import {generateToken , verifyToken} from '../../Infrastructure Layer/Authentication/jwt.ts'
import type { InternalUserDTO } from '../../Domain Layer/DTOs/userDTOs/InternalUser.ts';
import { upload } from './userMiddlewares.ts';
import { UserService } from '../../Busines Logic layer/user/userService.ts';
import { hashPassword } from '../../Infrastructure Layer/bcrypt/bcrypt.ts';
import { userDbRepo } from '../../Infrastructure Layer/Database/userRepo.ts/userDb.ts';
import type { LoginUserDTO } from '../../Domain Layer/DTOs/userDTOs/UserLogin.js';
import type { UserResponseDTO } from '../../Domain Layer/DTOs/userDTOs/UserResponse.js';
import fs from 'fs/promises';
import { ApplicationError } from '../../Busines Logic layer/ErrorHandling/appErrors.ts';

const userRouter = express.Router();
const port = 3000;

userRouter.use(express.json());
const userService = new UserService(new hashPassword(), new userDbRepo())

userRouter.post("/signup", upload.single("image"), async (req, res) => {
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
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});

userRouter.post('/login', async (req, res) => {
  try{

      const user:LoginUserDTO = req.body;
      console.log('body -- > ' ,user)
      const userRes:UserResponseDTO = await userService.LoginUser(user);
      console.log('user Response: ' , userRes)
      const token:string = generateToken(userRes?.id, userRes?.email);
      return res.status(200).json({"Token":token, user:userRes});

  }catch(err){
    if (err instanceof ApplicationError){
      return res.status(err.status).json({"message":err.message})
    }
    console.error("[Error] ", err)
    return res.status(500).json({ "message": "Internal Server Error" })
  }
});



export default userRouter;