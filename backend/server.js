const express=require('express')
const fs = require('fs');
const cors=require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

const database=require("./utils/database")


const app=express()

app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cors())


const start=async()=>{
    try{
        const connect=await database()
        app.listen(process.env.PORT,()=>{
            console.log('server is listening...')
        })
    }catch(error){
        console.log(error)
    }

}
start()