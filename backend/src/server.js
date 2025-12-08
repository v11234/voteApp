import express from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js";
import authRoute from "./routes/auth.route.js"
dotenv.config();
const PORT=process.env.PORT || 3000;
const app=express();
app.use(express.json());
app.use("/auth",authRoute);

app.listen(PORT,()=>{
  connectDB();
  console.log("server runing on PORT ",PORT);
})