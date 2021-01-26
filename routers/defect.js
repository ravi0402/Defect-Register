const express = require('express')

const router = express.Router()
const Defect = require('../models/defect')
const Member = require('../models/member')
const user = require('./user')

const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true })


router.get('/',user.isAuthenticatedUser,async (req,res)=>{
    let query = Defect.find({}).populate('member')
    if(req.query.number){
        query = query.regex('number',req.query.number)
    }
    try {
        const defects = await query.exec()
        res.render('defects/index',{
            defects,
            searchOptions : req.query
        })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
    
})

router.get('/new',user.isAuthenticatedUser,async(req,res)=>{
    try {
        const defect = new Defect()
        const members = await Member.find({})
        res.render('defects/new',{
            defect,
            members,
        })
        
    } catch(e) {
        res.redirect('/defects')
    }
})

router.post('/',urlencodedParser,async (req,res)=>{
    const defect = new Defect({
        dept_referred_to: req.body.dept_referred_to,
        observer: req.body.observer,
        priority: req.body.priority,
        createdOn: req.body.createdOn,
        state: req.body.state,
        equipment: req.body.equipment,
        nature: req.body.nature,
        title: req.body.title,
        description: req.body.description
    })
    try {
        const newDefect = await defect.save()
        res.redirect('/defects')
    } catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

router.get('/show/:id',urlencodedParser,async (req,res)=>{
    try {
        const members = await Member.find({})
        const defect = await Defect.findById(req.params.id).populate('member').exec()
        res.render('defects/show',{defect, members})
    } catch(e) {
        res.redirect('/defects')
    }
})

router.get('/:id/edit',urlencodedParser,async (req,res)=>{
    try {
        const members = await Member.find({})
        const defect = await Defect.findById(req.params.id).populate('member').exec()
        res.render('defects/edit',{defect, members})
    } catch(e) {
        res.redirect('/defects')
    }
})

router.put('/:id',async (req,res)=>{
    let defect
    try {
        defect = await Defect.findById(req.params.id)
        defect.dept_referred_to = req.body.dept_referred_to,
        defect.observer = req.body.observer,
        defect.priority = req.body.priority,
        defect.createdOn = req.body.createdOn,
        defect.state = req.body.state,
        defect.equipment = req.body.equipment,
        defect.nature = req.body.nature,
        defect.title= req.body.title,
        defect.description= req.body.description
        await defect.save()
        res.redirect(`/defects/show/${defect.id}`)
    } catch(e) {
        res.redirect('/')
    }
})

router.delete('/:id',urlencodedParser,async (req,res)=>{
    let defect
    try {
        defect = await Defect.findById(req.params.id)
        console.log("Defect is THE ==== "+defect)
        await defect.remove()
        res.redirect('/defects')
    } catch(e) {
        console.log("Error of DELETE ////|||||\\\\",e);
        if(defect){
            res.render('defects/edit',{
                defect,
                errorMessage :"Could not remove book"
            })
        }else{
            console.log("------------REDIRECTED------")
            res.redirect('/')
        }
    }
})


module.exports = router