/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
import { validateUserToken } from "../utils/token.js";
export function authenticationMiddleare(req,res,next){
    const authHeader=req.headers['authorization']
    if(!authHeader)return next()
    if(!authHeader.startsWith('Bearer'))return res.status(400).json({error: `Auth header must start with Bearer`});
    const [_,token]=authHeader.split(' ')
    const payload=validateUserToken(token)
    req.user=payload
    next();
}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */

export function ensureAuthenticated(req,res,next){
    if(!req.user || !req.user.id){
        return res.status(401).json({error:'Log in'})
    }
    next();
}
