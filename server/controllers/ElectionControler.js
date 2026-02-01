const {v4:uuid}=require("uuid");
const cloudinary=require("../utiles/cloudinary")
const electionModel=require("../models/electionModel")
const path=require("path")
const HttpError = require("../models/ErrorModel");
const candidateModel=require("../models/candidateModel")
//==================add new election===================================
//POST :api/elections
//protected (admin)

const addElection=async(req,res,next)=>{
try {
//     only admin can add election

// if(!req.user.isAdmin){
//     return next(new HttpError("Only admin can perform this action",403))  
//}
const {title,description}=req.body;
if(!title||!description){
    return next(new HttpError("All fields required",422)) ;
}

if(!req.files.thumbnail){
    return next(new HttpError("Choose a thumbnail",422))  
}

const {thumbnail}=req.files;
//image should be less than 1mb
if(thumbnail.size>1000000){
     return next(new HttpError("file size too big .Should be less than 1mb",422))  
}
console.log("working")
//rename the image

let fileName=thumbnail.fileName
fileName=fileName.split(".");
fileName=fileName[0] + uuid() +"." + fileName[fileName.length - 1]

//upload files to uplaod folder in project

await thumbnail.mv(path.join(__dirname,'..','uploads',fileName),async(err)=>{
    if(err){
         return next(new HttpError(err))  
    }
    // store image to cloudinary

    const result= await cloudinary.uploader.upload(path.join(__dirname,"..","uploads",fileName),{resource_type:"image"})
    if(!result.secure_url){
         return next(new HttpError("couldn't upload image to cloudinary",422)) ;

    }
    // save election to database

    const newElection= await electionModel.create({title,description,thumbnail:result.secure_url});
    res.json(newElection);
})
res.json(req.body)
} catch (error) {
     return next(new HttpError("Error in creating new election",422))  
}

}




//==================GET ALL election===================================
//GET :api/elections
//PROTED

const getElections=async(req,res,next)=>{
try {
     const elections=await electionModel.find();
     res.status(200).json(elections)
} catch (error) {
     return next(new HttpError("Error in getting all  election",422))   
}
}





//==================get single  election===================================
//GET :api/elections:id
//protected 

const getElection=async(req,res,next)=>{
try {
     const {id}=req.param;
     const election=await electionModel.findById(id)
      res.status(200).json(election)
} catch (error) {
      return next(new HttpError("Error in getting  election",422))   

}
}





//==================getelection candidate===================================
//POST :api/elections/:id/canadidate
//protected

const getCandidateOfElection=async(req,res,next)=>{
try {
      const {id}=req.param;
      const candidate= await candidateModel.find({election:id})
       res.status(200).json(candidate)
} catch (error) {
      return next(new HttpError("Error in getting  election cadidates",422))   
}
}











//==================get election voters===================================
//POST :api/elections/:id/voters
//protected 

const getElectionVoters=async(req,res,next)=>{
try {
      const {id}=req.param;
      const response=await electionModel.findById(id).populate('voters')
      res.status(200).json(response.voters)

} catch (error) {
     return next(new HttpError("Error in getting  election voters",422))    
}
}










//==================remove election===================================
//Delete :api/elections/:id
//protected (admin)

const removeElection=async(req,res,next)=>{
res.json("remove election")
}














//==================add new election===================================
//PATCH :api/elections
//protected (admin)

const updateElection=async(req,res,next)=>{
try {
     //     only admin can add election

// if(!req.user.isAdmin){
//     return next(new HttpError("Only admin can perform this action",403))  
//}

const {id}=req.params;
const {title,description}=req.body;
if(!title||!description){
      return next(new HttpError("All fields required",422))    
}
if(req.files.thumbnail){
const {thumbnail}=req.files;
//image sizeshould be 1mb

if(thumbnail.size>1000000){
      return next(new HttpError("image sise too large",422))    
}
//rename the image

let fileName=thumbnail.fileName
fileName=fileName.split(".");
fileName=fileName[0] + uuid() +"." + fileName[fileName.length - 1]

//upload files to uplaod folder in project

await thumbnail.mv(path.join(__dirname,'..','uploads',fileName),async(err)=>{
    if(err){
         return next(new HttpError(err))  
    }
    // store image to cloudinary

    const result= await cloudinary.uploader.upload(path.join(__dirname,"..","uploads",fileName),{resource_type:"image"})
    if(!result.secure_url){
         return next(new HttpError("couldn't upload image to cloudinary",422)) ;

    }
    await electionModel.findByIdAndUpdate(id,{title,description,thumbnail:result.secure_url});
    res.json("Election updated successfully")

})
}
} catch (error) {
      return next(new HttpError("Error in updating  election ",422))    
}
}








module.exports={getCandidateOfElection,getElection,updateElection,removeElection,getElectionVoters,getElections,addElection}





