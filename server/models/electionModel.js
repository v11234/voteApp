const { Types, model,Schema } = require("mongoose");



const electionSchema=new Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    thumbnail:{type:String,required:true},
    candidate:[{type:Types.ObjectId,required:true,ref:"Candidate"}],
    voters:[{type:Types.ObjectId,required:true,ref:"Voter"}],
})

module.exports=model("Election",electionSchema)