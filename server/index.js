const express = require('express');
const http = require('http');
const cors=require('cors');
const {connect}=require("mongoose")
require('dotenv').config();
const upload=require("express-fileupload")
const { init } = require("./socket");






const Routes=require('./routes/Routes');
const {notFound,errorHandler}=require('./middlewares/errorMiddleware');
const { addElection } = require('./controllers/ElectionControler');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

//middlewares
app.use(express.json({extended:true,limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(upload())

app.use('/api',Routes);

app.use(notFound);
app.use(errorHandler);




connect(process.env.MONGO_URL).then(()=>{
    init(server);
    server.listen(PORT,()=>{
        console.log("Server running on port",PORT);
    })
}).catch((err)=>console.log(err));
