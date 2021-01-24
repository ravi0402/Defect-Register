const express = require('express')

const router = express.Router()
const Member = require('../models/member')
const user = require('./user')

router.get('/',user.isAuthenticatedUser,async (req,res)=>{
    let searchOptions = {}
    if(req.query.name != null || req.query.name == ''){
       searchOptions.name = new RegExp(req.query.name,'i')
    }
    try {
        const members = await Member.find(searchOptions)
        res.render('members/index',{
            members,
            searchOptions : req.query
        })

    } catch {
        res.redirect('/')
    }
})

router.get('/new',user.isAuthenticatedUser,(req,res)=>{
    res.render('members/new',{member : new Member()})
})

router.post('/',async (req,res)=>{
    const member = new Member({
        name : req.body.name,
        email : req.body.email,
        mobilePhone : req.body.mobilePhone,
        workPhone : req.body.workPhone,
        location:req.body.location,
        position: req.body.position
    })
    try {
        const newMember = await member.save()
        res.redirect('/members')
    } catch {
        res.redirect('/')
    }
})

//show the page

router.get('/:id',async (req,res)=>{
    try {
        const member = await Member.findById(req.params.id)
        res.render('members/show',{
            member
        })
    } catch(e){
        console.log(e);
        res.redirect('/')
    }
   
})

//Edit the page
router.get('/:id/edit',async (req,res)=>{
    try {
        const member = await Member.findById(req.params.id)
        res.render('members/edit',{member : member})
    } catch {
        res.redirect('/members')
    }
})

router.put('/:id',async (req,res)=>{
    let member
    try {
        member = await Member.findById(req.params.id)
        member.name = req.body.name,
        member.email = req.body.email,
        member.mobilePhone = req.body.mobilePhone,
        member.workPhone = req.body.workPhone,
        member.location=req.body.location,
        member.position= req.body.position
        await member.save()
        res.redirect(`/members/${member.id}`)
    } catch {
        res.redirect('/')
    }
})

router.delete('/:id',async (req,res)=>{
    let member
    try {
        member = await Member.findById(req.params.id)
        await member.remove()
        res.redirect('/members')
    } catch(e) {
        if(member){
            res.render('members/edit',{
                member,
                errorMessage :"Could not remove book"
            })
        }else{
            res.redirect('/')
        }
    }
})




module.exports = router
