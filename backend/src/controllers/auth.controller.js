import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { generateToken } from "../lib/utils.js";
import User from "../model/User.js";
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
dotenv.config();
export async function  signup(req,res){
 const {username,email,password}=req.body; // requesting username,email,password from the server
 if(!username||!email||!password){
  return res.status(400).json({message:"All fieled reauired"}); // checking if user missed any field
}
const user=await User.findOne({email}); // geting the signed in user

if(user)   return res.status(400).json({message:"Email already exist"}); //checking if user already in the database
if(password.length<6){ 
  return res.status(400).json({message:"Password length must be atlease 6 characters"});
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;
if (!emailRegex.test(email)) {
  return res.status (400).json({message: "invalid email format"}); //checking email format
}
const salt=await bcrypt.genSalt(10);
const hashedPassword=await bcrypt.hash(password,salt); //hashing user password

const newUser=  User({ // creating new user
  username,
  email,
  password:hashedPassword
})

if(newUser){
  const saveUser=await newUser.save();
  generateToken(saveUser._id,res); // generating a 7days expiration jwt token

  res.status(201).json({ // response to get request 
    _id:newUser._id,
    username:newUser.username,
    email:newUser.email,
    password:newUser.password
  })

  try {
    await sendWelcomeEmail(saveUser.email,saveUser.username,process.env.CLIENT_URL) // calling email function from the email config
  } catch (error) {
    console.error("Error in sending email",error);
  }
}
}
export async function login(req,res){
 const {email,password}=req.body; // requesting username,email,password from the server
 if(!email||!password){
  return res.status(400).json({message:"All fieled reauired"}); // checking if user missed any field
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;
if (!emailRegex.test(email)) {
  return res.status (400).json({message: "invalid email format"}); //checking email format
}
const user=await User.findOne({email}); // geting the signed in user

try {
  if(!user)   return res.status(400).json({message:"invalide credential"}); //checking if user already in the database
  const isCorrectPassword= await bcrypt.compare(password,user.password);
if(!isCorrectPassword)return res.status(400).json({message:"invalide credential"});
res.status(200).json({
  _id:user._id,
  username:user.username,
  email:user.email,
  phoneNumber:user.phoneNumber


})
} catch (error) {
  console.log("Error at authcontroller")
}


}

export async function logout(_,res){
  res.cookie("jwt","",{maxAge:0})
  res.status(200).json({message:"successfully loged out"})
}