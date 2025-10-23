const jwt=require('jsonwebtoken')
const CustomError = require('../errorHandlers/customError')

const authorizeMiddleware=(req,res,next)=>{
    const authorizeToken=req.headers.authorization
    if(!authorizeToken || !authorizeToken.startsWith('Bearer')){
        next(new CustomError('not authorizrd',401))
    }
    try{
        const token=authorizeToken.split(' ')[1]
        const decoded=jwt.verify(token,process.env.JSON_SECRETKEY)
        const {email,username,name,profile,_id}=decoded
        req.user={email,username,name,profile,_id}
        next()
    }catch(error){
        next( new CustomError('not a valid token',401))
    }
}
module.exports=authorizeMiddleware