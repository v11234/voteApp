const { Schema, Types,model } = require("mongoose");


const candidateSchema = new Schema({
    fullName: { type: String, required: true },
    image: { type: String, required: true },
    moto: { type: String, required: true },
    voteCount: { type: String, required: true },
    election: { type: Types.ObjectId, required: true, ref: "Election" }
})

module.exports=model("Candidate",candidateSchema)