import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || 'key123434'

export function generateToken(userId: number, email: string , role:string) {
  const token = jwt.sign(
    { "id":userId, 
    "email":email,
    "role":role
 }, 
    SECRET_KEY);
  return token;
}


export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded; 
  } catch (err) {
    return null; 
  }
}
