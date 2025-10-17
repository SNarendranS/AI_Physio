const express=require('express')
const { getUser, getUserById, updateUser}=require('../controllers/userController')
const authorizeMiddleware = require('../middlewares/authorize')
const route=express.Router()

route.post('/update',authorizeMiddleware,updateUser)
route.get('/',authorizeMiddleware,getUser)
route.get('/:id',getUserById)
 


module.exports=route