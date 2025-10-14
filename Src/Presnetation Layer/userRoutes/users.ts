import express from 'express';
import {generateToken , verifyToken} from '../../Infrastructure Layer/Authentication/jwt.ts'
import type { InternalUserDTO } from '../../Domain Layer/DTOs/userDTOs/InternalUser.ts';
import { upload } from './userMiddlewares.ts';
import { UserCrud } from '../../Busines Logic layer/user/userCrud.ts';
import { hashPassword } from '../../Infrastructure Layer/bcrypt/bcrypt.ts';
import { userDbRepo } from '../../Infrastructure Layer/Database/userRepo.ts/userDb.ts';

const userRouter = express.Router();
const port = 3000;

userRouter.use(express.json());

userRouter.post("/upload", upload.single("image"), async (req, res) => {
  try{
    const user:InternalUserDTO =  req.body
    console.log('body -- >  ' ,user )
    user.ImagePath = req.file?.path ?? "" ;
    const userCrud = new UserCrud(new hashPassword(), new userDbRepo())
    const id:number = await userCrud.createUser(user);
    const token:string = generateToken(id , user.email , user.role);
    res.status(201).json({ token });
    console.log('---> id: ',id)
  }catch(e){
    console.error('Error: ' , e)
    res.status(400).json('Bad Request')
  }
});

userRouter.get('/login', (req, res) => {
  
  res.send('Hello from Express.js!');
});



export default userRouter;