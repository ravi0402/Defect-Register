const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const async = require('async')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
//Check user is authenticated

function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Please login first to access this page')
    res.redirect('/login')
}

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'You have been logged out.')
    res.redirect('/login')
})

router.get('/forgot', (req, res) => {
    res.render('forgot')
})

router.get('/reset/:token', async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has been expired')
            res.redirect('/forgot')
        }
        res.render('newpassword', { token: req.params.token })
    } catch (error) {
        req.flash('error_msg', 'ERROR: ' + error);
        res.redirect('/forgot');
    }
})

router.get('/password/change', (req, res) => {
    res.render('changepassword')
})

//sign up post router
router.post('/signup', (req, res) => {
    const { name, password, designation, dept, employee_id } = req.body
    const userData = {
        name,
        designation,
        dept, 
        employee_id, 
        isVerified: 'Pending',
        isAdmin: false,
    }
    User.register(userData, password, (err, user) => {
        if (err) {
            req.flash('error_msg', 'ERROR: ' + err)
            res.redirect('/signup')
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success_msg', 'User is created successfully')
            res.redirect('/login')
        })
    })
})

//login post router

// router.post('/login', passport.authenticate('local', {
//     successRedirect: '/dashboard',
//     failureRedirect: '/login',
//     failureFlash: 'Invalid Employee-ID or password. Try again!!'
// }))

router.post('/login', passport.authenticate('local', {
    failureFlash: 'Invalid Employee-ID or password. Try again!!'
}), async (req, res) => {
    const user = await User.findOne({ employee_id: req.body.employee_id })
    if (["False", "Pending"].includes(user.isVerified)) {
        req.flash('error_msg', 'User account is not verified yet. Please contact administrator!')
        res.redirect('/login')
    } else {
        res.redirect('/defects')
    }
})


//handle change password

router.post('/password/change', async (req, res) => {
    if (req.body.password !== req.body.confirmpassword) {
        req.flash('error_msg', "Password don't match. Type again!");
        return res.redirect('/password/change');
    }
    try {
        const user = await User.findOne({ employee_id: req.user.employee_id })
        await user.setPassword(req.body.password, err => {
            user.save()
            req.flash('success_msg', 'Password changed successfully.');
            res.redirect('/defects');
        })

    } catch (error) {
        req.flash('error_msg', 'ERROR: ' + error);
        res.redirect('/password/change');
    }
})

//handle forgot password
router.post('/forgot', (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex')
                done(err, token)
            })
        },
        async (token, done) => {
            try {
                const user = await User.findOne({ employee_id: req.body.employee_id })
                if (!user) {
                    req.flash('error_msg', 'User does not exist with this employee_id.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 1800000;

                user.save(err => {
                    done(err, token, user);
                });

            } catch (error) {
                req.flash('error_msg', 'ERROR: ' + error);
                res.redirect('/forgot');
            }
        },
        (token, user) => {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_EMAIL,
                    pass: process.env.GMAIL_PASSWORD
                }
            });

            let mailOptions = {
                to: user.email,
                from: 'Bug Tracker ardorfresh@gmail.com',
                subject: 'Recovery Email from Bug Tracker',
                text: 'Please click the following link to recover your passoword: \n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email.'
            };
            smtpTransport.sendMail(mailOptions, err => {
                req.flash('success_msg', 'Email send with further instructions. Please check that.');
                res.redirect('/forgot');
            });
        }
    ], err => {
        if (err) res.redirect('/forgot')
    })

})

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        async (done) => {
            try {
                const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
                if (!user) {
                    req.flash('error_msg', 'Password reset token in invalid or has been expired.');
                    res.redirect('/forgot');
                }

                if (req.body.password !== req.body.confirmpassword) {
                    req.flash('error_msg', "Password don't match.");
                    return res.redirect('/forgot');
                }

                user.setPassword(req.body.password, err => {
                    user.resetPasswordToken = undefined
                    user.resetPasswordExpires = undefined

                    user.save(err => {
                        req.logIn(user, err => {
                            done(err, user);
                        })
                    })
                })

            } catch (error) {
                req.flash('error_msg', 'ERROR: ' + error);
                res.redirect('/forgot');
            }

        },
        (user) => {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_EMAIL,
                    pass: process.env.GMAIL_PASSWORD
                }
            })

            let mailOptions = {
                to: user.email,
                from: 'Bug Tracker ardorfresh@gmail.com',
                subject: 'Your password is changed',
                text: 'Hello, ' + user.name + '\n\n' +
                    'This is the confirmation that the password for your account ' + user.email + ' has been changed.'
            }

            smtpTransport.sendMail(mailOptions, err => {
                req.flash('success_msg', 'Your password has been changed successfully.')
                res.redirect('/login')
            })
        }
    ], err => {
        if (err) res.redirect('/login')
    })
})

module.exports = {
    router,
    isAuthenticatedUser
} 
