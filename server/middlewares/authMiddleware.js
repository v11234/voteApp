const jwt = require("jsonwebtoken");
const HttpError = require("../models/ErrorModel");
const voterModel = require("../models/voterModel");



const authMiddleware=async(req,res,next)=>{
const Authorization= req.headers.Authorization || req.headers.authorization;

if(Authorization && Authorization.startsWith("Bearer")){
    const token=Authorization.split(' ')[1];

    try{
        const info = jwt.verify(token,process.env.JWT_SECRET);
        const user = await voterModel.findById(info.id);
        if(!user){
            return next(new HttpError("Unauthorized.User not found.",403))
        }
        if(!user.isVerified || !user.isApproved){
            return next(new HttpError("Unauthorized.User not verified or approved.",403))
        }
        req.user={
            id:user._id,
            isAdmin:user.isAdmin,
            role:user.role
        };
        next()
    } catch (err) {
        return next(new HttpError("Unauthorized.Invalid token.",403))
    }
}
else{
    return next(new HttpError("Unauthorized.NO token.",403))
}
}

module.exports=authMiddleware;
