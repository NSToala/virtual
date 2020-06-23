const express = require('express'),
    router = express.Router(),
    { isLoggedIn } = require('../lib/auth')
router
    .get('/', (req, res) => {
        res.render('index', {layout: 'main.hbs'})
    })
    .get('/profile', isLoggedIn, (req, res) => {
        res.render('profile')
    })
    .get('/plenaria',isLoggedIn, (req, res) => {
        res.render('plenaria')
    })
    .get('/mundo-virtual',isLoggedIn, (req, res) => {
        res.render('mundo', { user: req.user})
    })
    .get('/chatroom',isLoggedIn, (req, res) => {
        res.render('chatroom', {layout: 'chatroom.hbs'})
    })
module.exports = router