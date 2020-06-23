const express = require('express'),
    router = express.Router(),
    pool = require('../model/connection'),
    passport = require('passport'),
    { isLoggedIn, isAuthenticated } = require('../lib/auth')
    
router
    .get('/signup', isAuthenticated, (req, res) => {
        res.render('auth/register')
    })

    .post('/signup', isAuthenticated, passport.authenticate('register', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }))

    .get('/signin', isAuthenticated, (req, res) => {
        res.render('auth/signin')
    })
    
    .post('/signin', isAuthenticated, (req, res, next) => {
        passport.authenticate('login', {
            successRedirect: '/profile',
            failureRedirect: '/signin',
            failureFlash: true
        })(req, res, next)
    })

    .get('/logout', isLoggedIn, async(req, res) => {
        const { id_user } = req.user
        await pool.query('UPDATE users SET status = 0 WHERE id_user = ?', id_user)
        req.logOut()
        res.redirect('/signin')
    })

module.exports = router