//@ts-ignore
import { generateToken, verifyToken } from '../../Infrastructure Layer/Authentication/jwt.ts';

export function verifyUser(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send("Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1]; 

    if (!token) {
        return res.status(401).send("Unauthorized: Token missing");
    }

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).send("Unauthorized: Invalid token");
    }

    req.user = payload; 
    next();
}
