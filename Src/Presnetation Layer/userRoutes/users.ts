import express from 'express';
import {generateToken , verifyToken} from '../../Infrastructure Layer/Authentication/jwt.ts'
import type { InternalUserDTO } from '../../Domain Layer/DTOs/userDTOs/InternalUser.ts';
import { upload } from './userMiddlewares.ts';
import { UserCrud } from '../../Busines Logic layer/user/userCrud.ts';
import { hashPassword } from '../../Infrastructure Layer/bcrypt/bcrypt.ts';
import { userDbRepo } from '../../Infrastructure Layer/Database/userRepo.ts/userDb.ts';
import type { LoginUserDTO } from '../../Domain Layer/DTOs/userDTOs/UserLogin.js';
import type { UserResponseDTO } from '../../Domain Layer/DTOs/userDTOs/UserResponse.js';
import fs from 'fs/promises';

const userRouter = express.Router();
const port = 3000;

userRouter.use(express.json());
const userCrud = new UserCrud(new hashPassword(), new userDbRepo())

userRouter.post("/signup", upload.single("image"), async (req, res) => {
  try{
    const user:InternalUserDTO =  req.body
    user.ImagePath = req.file?.path ?? "" ;
    const id:number | null = await userCrud.createUser(user);
    if(id == null){
        fs.unlink(user.ImagePath);
        return res.status(400).json('Missing feilds or Email is already used! ')
    }
    const token:string = generateToken(id , user.email , user.role);
    return res.status(201).json({ token });
  }catch(e){
    console.error('Error: ' , e)
    res.status(400).json('Bad Request')
  }
});

userRouter.post('/login', async (req, res) => {
  try{

      const user:LoginUserDTO = req.body;
      console.log('body -- > ' ,user)
      const userRes:UserResponseDTO| null = await userCrud.LoginUser(user);
      console.log('user Response: ' , userRes)
      if (userRes == null){
        return res.status(401).json('Invalid credentials');
      }
      const token:string = generateToken(userRes?.id, userRes?.email  , userRes?.role);
      return res.status(200).json({token:token, user:userRes});

  }catch(e){
    res.status(500).send('Internal Server Error!')
    console.error('Error: ' , e)
  }
});



export default userRouter;