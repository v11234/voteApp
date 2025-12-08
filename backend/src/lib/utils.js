import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config();

export const generateToken=(userId,res)=>{
const JWT_SECRET=process.env.JWT_SECRET;
if(!JWT_SECRET) throw new error("JWT_SECRET is not configured");

const token=jwt.sign({userId},JWT_SECRET,{
  expiresIn:"7d"
})
res.cookie("jwt",token,{
  maxAge:7*24*60*60*1000,//7d days expirating days
  httpOnly:true,
  sameSite:"strict",
  secure:process.env.JWT_SECRET="development"?false:true

})
}