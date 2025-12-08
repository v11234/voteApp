import mongoose, { Mongoose } from "mongoose";

const userSchema=new mongoose.Schema(
{
  username:{
    type:String,
    required:true
  },
  email:{
        type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    require:true
  },
  profilePic:{
    type:String,
  },
  phoneNumber:{
     type:String,
  }

},{timestamps:true}
);

const User=mongoose.model("User",userSchema);
export default User;