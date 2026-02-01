const { Schema, Types, model } = require("mongoose");


const voterSchema=new Schema({
    fullName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    votedElections:[{type:Types.ObjectId,ref:"election",required:true}],
    isAdmin:{type:Boolean,default:false}
},{timestamps:true})


module.exports= model("Voter",voterSchema)