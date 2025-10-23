const express=require('express')
const {getPainTypes,getInjuryPlaces}=require('../controllers/metaDataController')
const route=express.Router()

route.get('/painTypes',getPainTypes)
route.get('/injuryPlaces',getInjuryPlaces)

module.exports=route