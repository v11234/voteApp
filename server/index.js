const express = require('express');
const cors=require('cors');
const {connect}=require("mongoose")
require('dotenv').config();
const upload=require("express-fileupload")






const Routes=require('./routes/Routes');
const {notFound,errorHandler}=require('./middlewares/errorMiddleware');
const { addElection } = require('./controllers/ElectionControler');

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json({extended:true,limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}));
app.use(cors({credentials:true,origin:['http://localhost:5173']}));
app.use(upload())

app.use('/api',Routes);

app.use(notFound);
app.use(errorHandler);




connect(process.env.MONGO_URL).then(app.listen(PORT,()=>{
    console.log("Server running on port",PORT);
})
).catch((err)=>console.log(err));