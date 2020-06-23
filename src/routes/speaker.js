const express = require('express'),
    router = express.Router()

router
    .get('/votacion', (req, res) => {
        res.render('speaker/votacion', {layout: 'tvotacion'})
    })
    .get('/filtro', (req, res) => {
        res.render('speaker/filtro', {layout: 'tvotacion'})
    })
    .get('/experto', (req, res) => {
        res.render('speaker/experto', {layout: 'tvotacion'})
    })
    .get('/wordcloud', (req, res) => {
        res.render('speaker/wordcloud', {layout: 'tvotacion'})
    })
    .get('/', (req, res) => {
        res.render('speaker/votacion', {layout: 'tvotacion'})
    })
module.exports = router