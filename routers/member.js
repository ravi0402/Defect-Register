const express = require('express')

const router = express.Router()
const User = require('../models/user')
const user = require('./user')

router.get('/', user.isAuthenticatedUser, async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null || req.query.name == '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        if(req.user.isAdmin) {
            const members = await User.find(searchOptions)
            res.render('members/index', {
                members,
                searchOptions: req.query
            })
        } else {
            req.flash('error_msg', "You don't have access to members section")
            res.redirect('/dashboard')
        }
    } catch (e) {
        res.redirect('/')
    }
})

// router.get('/new', user.isAuthenticatedUser, (req, res) => {
//     res.render('members/new', { member: new Member() })
// })

// router.post('/', async (req, res) => {
//     const member = new Member({
//         name: req.body.name,
//         email: req.body.email,
//         mobilePhone: req.body.mobilePhone,
//         dept: req.body.dept,
//         designation: req.body.designation
//     })
//     try {
//         const newMember = await member.save()
//         res.redirect('/members')
//     } catch(e) {
//         res.redirect('/')
//     }
// })

//show the page

router.get('/show/:id', async (req, res) => {
    try {
        const member = await User.findById(req.params.id)
        res.render('members/show', {
            member
        })
    } catch (e) {
        console.log(e);
        res.redirect('/')
    }

})

//Edit the page
router.get('/:id/edit', async (req, res) => {
    try {
        const member = await User.findById(req.params.id)
        res.render('members/edit', { member: member })
    } catch(e) {
        res.redirect('/members')
    }
})

router.put('/:id', async (req, res) => {
    let member
    try {
        member = await User.findById(req.params.id)
        console.log(req.body);
        member.name = req.body.name,
            member.employee_id = req.body.employee_id,
            member.dept = req.body.dept,
            member.isVerified = req.body.isVerified
            member.designation = req.body.designation
        await member.save()
        res.redirect(`/members/show/${member.id}`)
    } catch(e) {
        res.redirect('/')
    }
})

router.delete('/:id', async (req, res) => {
    let member
    try {
        member = await User.findById(req.params.id)
        await member.remove()
        res.redirect('/members')
    } catch (e) {
        if (member) {
            res.render('members/edit', {
                member,
                errorMessage: "Could not remove book"
            })
        } else {
            res.redirect('/')
        }
    }
})




module.exports = router
