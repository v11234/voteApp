


//register new voter
//post:api/voters/register

const HttpError = require("../models/ErrorModel");
const voterModel = require("../models/voterModel");
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const  registerVoter=async(req,res,next)=>{
try {
    const {fullName,email,password,password2}=req.body;

    if(!fullName||!email||!password||!password2){
            return next(new HttpError("All fields required",422))
    }

    const newEmail=email.toLowerCase();

    //check if user email already exist

    const emailExist=await voterModel.findOne({email:newEmail});
    if(emailExist){
    return next(new HttpError("Email already exist",422))
    }

    //make sur paswsword 6
    if((password.trim().length)<6){
            return next(new HttpError("Password should be altlease 6 character",422))
    }
    if(password !=password2){
            return next(new HttpError("Password donot match",422))
    }
    const salt= await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);

    //no voter or user should be admin except for one with "admin@gmail.com"

    let isAdmin=false

    if(newEmail=="admin@gmail.com" || "nicolineeyong1@gmail.com"){
        isAdmin=true;
    }

    //save user to database

    const newVoter=await voterModel.create({
        fullName,
        email:newEmail,
        password:hashedPassword,
        isAdmin
    })
    newVoter.save()
    res.status(201).json({
        fullName:fullName,
        email:newEmail,
        password:hashedPassword,
        isAdmin:isAdmin
    })
} catch (error) {
    return next(new HttpError("Voter registration failed",422))
}
}

   


//function to generate token

const generateToken=(payload)=>{
    const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1d"});
    return token;

}



//login  voter
//post:api/voters/login

const  loginVoter=async(req,res,next)=>{
try {

    const {email,password}=req.body;
    
    if(!email||!password){
     return next(new HttpError("All fields required",422))
    }
  

    const newEmail=email.toLowerCase()

    const voter=await voterModel.findOne({email:newEmail});
    if(!voter){
         return next(new HttpError("Invalid credentials.",422))
    }

    //compare password 

    const comparePassword=await bcrypt.compare(password,voter.password)
    if(!comparePassword) {
        return next(new HttpError("Invalid credential",422))
    }

        const {_id:id,isAdmin,votedElections}=voter;
        const token=generateToken({id,isAdmin});

        res.json({token,id,votedElections,isAdmin})
} catch (error) {
    return next(new HttpError("Login failed. Please check your credentials or try again later",422)) 
}
}


//get  voter
//get:api/voters/:id

const  getVoter=async(req,res,next)=>{

try {
    const {id}=req.params;
    const voter= await voterModel.findById(id).select("-password")
    res.json(voter)
} catch (error) {
  return next(new HttpError("Couldn't get voter",404)) 
}


}




module.exports={registerVoter,loginVoter,getVoter}