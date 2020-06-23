const express = require('express'),
      router = express.Router()
    
router
    .get('/',(req, res) => res.render('admin/dashboard', {layout: 'admin.hbs'}))
    .get('/votacion',(req, res) => res.render('admin/votacion', {layout: 'admin.hbs'}))
	.get('/preguntas',(req, res) => res.render('admin/preguntas', {layout: 'admin.hbs'}))
	.get('/reportes',(req, res) => res.render('admin/reportes', {layout: 'admin.hbs'}))

module.exports = router