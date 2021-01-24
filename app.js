
const landingRouter = require('./routers/landing')
const userRouter = require('./routers/user')
const dashboardRouter = require('./routers/dashboard')
const memberRouter = require('./routers/member')
const defectRouter = require('./routers/defect')
const User = require('./models/user')
const expressLayouts = require('express-ejs-layouts')
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const app = express()
app.set('view engine','ejs')
app.set('views',__dirname + '/views')
app.use(bodyParser.urlencoded({extended:false}))

app.use(express.static('public'))
require('dotenv').config({path: './config.env'})
app.use(helmet())
app.use(methodOverride('_method'))

const mongoose = require('mongoose')
const router = require('./routers/member')
mongoose.connect(process.env.DATABASE ,{useUnifiedTopology : true , useNewUrlParser : true,useCreateIndex: true})

const db = mongoose.connection

db.on('error',error => console.error(error))
db.once('open',()=>{console.log('Database is connected')})

//middleware for session
app.use(session({
    secret: "Login sign up auth",
    resave: true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy({usernameField : 'email'}, User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware for flash messages
app.use(flash())

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash(('success_msg'))
    res.locals.error_msg = req.flash(('error_msg'))
    res.locals.error = req.flash(('error'));
    res.locals.currentUser = req.user;
    next()
})

function routerCheck(routePath,routerimp){
    if(routerimp === userRouter.router || routerimp == landingRouter){
        app.use(`${routePath}`,routerimp)
    }else{
        app.set('layout','layouts/layout')
        app.use(expressLayouts)
        app.use(`${routePath}`,routerimp)
    }
}   
routerCheck('/',landingRouter)
routerCheck('/',userRouter.router)
routerCheck('/dashboard',dashboardRouter)
routerCheck('/members',memberRouter)
routerCheck('/defects',defectRouter)


app.listen(process.env.PORT || 3000,(err)=>{
    if(err){
        console.log(err);
    }
    console.log("Server is started");
})