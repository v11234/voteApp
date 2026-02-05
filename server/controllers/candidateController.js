const {v4:uuid}=require("uuid");
const cloudinary=require("../utiles/cloudinary")
const electionModel=require("../models/electionModel")
const path=require("path")
const HttpError = require("../models/ErrorModel");
const candidateModel=require("../models/candidateModel");
const voterModel=require("../models/voterModel")
const  mongoose  = require("mongoose");
const { Session } = require("inspector/promises");






//==================add new candidate===================================
//POST :api/candidates
//protected (admin)

const addCandidate=async(req,res,next)=>{
try {
    //     only admin can add election

if(!req.user.isAdmin){
    return next(new HttpError("Only admin can perform this action",403))  
}
const {fullName,moto,currentElection}=req.body;
if(!fullName||!moto){
     return next(new HttpError("Fill in all fields",422))  
}
 
if(!req.files.image){
     return next(new HttpError("Choose an image",422)) ; 
}

const {image}=req.files;
//check file size

//image should be less than 1mb
if(image.size>1000000){
     return next(new HttpError("file size too big .Should be less than 1mb",422))  
}

//rename the image

let fileName=image.name
fileName=fileName.split(".");
fileName=fileName[0] + uuid() +"." + fileName[fileName.length - 1]

 console.log("working up to hear")
//upload files to uplaod folder in project

await image.mv(path.join(__dirname,'..','uploads',fileName),async(err)=>{
    if(err){
         return next(new HttpError(err))  
    }
    // store image to cloudinary

    const result= await cloudinary.uploader.upload(path.join(__dirname,"..","uploads",fileName),{resource_type:"image"})
    if(!result.secure_url){
         return next(new HttpError("couldn't upload image to cloudinary",422)) ;

    }
    // save election to database

    let newCandidate= await candidateModel.create({fullName,moto,image:result.secure_url,election:currentElection});

//get election and push candidate to elction

let election= await electionModel.findById(currentElection);

const sess= await mongoose.startSession();
sess.startTransaction()
await newCandidate.save({session:sess})
election.candidate.push(newCandidate)
await election.save({session:sess})
await sess.commitTransaction()
    res.status(201).json("new  Candidate added successfuly");
})
} catch (error) {
     return next(new HttpError("Error in adding new candidate",422))  
}


}


//==================getcandidate===================================
//get :api/candidates/:id
//protected (admin)

const getCandidate=async(req,res,next)=>{
try {
    const {id}=req.params;
    const candidate=await candidateModel.findById(id)
    res.json(candidate)
} catch (error) {
    return next(new HttpError("Error in getting  candidates",422))  
} 
}




//==================add new candidate===================================
//DELETE :api/candidates/:id
//protected (admin)

const removeCandidate=async(req,res,next)=>{
try {

        //     only admin can add election

if(!req.user.isAdmin){
    return next(new HttpError("Only admin can perform this action",403))  
}
    const {id}=req.params;
    let currentCandidate=await candidateModel.findById(id).populate('election')
    if(!currentCandidate){
        return next(new HttpError("Couldn't delete candidate  candidates",422))  

    }else{
        const sess=await mongoose.startSession()
        sess.startTransaction()
        await currentCandidate.deleteOne({session:sess});
        currentCandidate.election.candidate.pull(currentCandidate)
        await currentCandidate.election.save({session:sess})
        await sess.commitTransaction()
    }
    res.status(200).json("candidate deleted successfully")
} catch (error) {
    return next(new HttpError("Error in getting  candidates",422))  
} 
}


//==================vote candidate===================================
//PATCH :api/candidates/:id
//protected 

const voteCandidate=async(req,res,next)=>{
try {
    const {id:candidateId}=req.params;
    const {selectedElection}=req.body;
    const candidate=await candidateModel.findById(candidateId);
    const newVoteCount=candidate.voteCount +1;

//update candidate votes

await candidateModel.findByIdAndUpdate(candidateId,{voteCount:newVoteCount},{new:true})

//start a session for relationshipe betwwen voter and election
const sess= await mongoose.startSession();

sess.startTransaction();
//get the current voter

let voter=await voterModel.findById(req.user.id);
await voter.save({session:sess});
//get selected election
let election=await electionModel.findById(selectedElection);
election.voters.push(voter);
voter.votedElections.push(election);
await election.save({session:sess});
await voter.save({session:sess})
await sess.commitTransaction()
    res.status(200).json(voter.votedElections)
} catch (error) {
    return next(new HttpError("Error in voting  candidates",422))  
} 
}

module.exports={addCandidate,removeCandidate,getCandidate,voteCandidate}
