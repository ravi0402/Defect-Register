const express = require('express')

const router = express.Router()
const user = require('./user')

router.get('/',user.isAuthenticatedUser,(req,res)=>{
    res.render('dashboard')
})


module.exports = router
