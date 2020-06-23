require('./lib/passport')

const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
	socket = require('./socket/SocketManager'),
    morgan = require('morgan'),
    exphbs = require('express-handlebars'),
    path = require('path'),
    session = require('express-session'),
    mysqlStore = require('express-mysql-session'),
    passport = require('passport'),
    flash = require('connect-flash'),
    { database } = require('./model/db-conf'),
    port = process.env.PORT || 3000

app
    .set('views', path.join(__dirname, 'views'))
    .engine('.hbs', exphbs({
        defaultLayout: 'template',
        layoutsDir: path.join(app.get('views'), 'layouts'),
        partialDir: path.join(app.get('views'), 'partials'),
        extname: '.hbs',
        helpers: require('./lib/handlebars')
    }))
    .set('view engine', '.hbs')
//Middlewares
    .use(session({
        secret: 'joCyYoMrspz_Ft1jtR6hl2a831Zrz3kZu1FeSgti',
        resave: false,
        saveUninitialized: false,
        store: new mysqlStore(database)
    }))
    .use(flash())
    .use(morgan('dev'))
    .use(express.urlencoded({ extended:false }))
    .use(express.json())
    .use(passport.initialize())
    .use(passport.session())
//Global Variable
    .use((req, res, next) => {
        app.locals.success = req.flash('success')
        app.locals.message = req.flash('message')
        app.locals.user = req.user
        next()
    })
//Routes
    .use(require('./routes'))
    .use(require('./routes/authentication'))
    .use('/speaker', require('./routes/speaker'))
    .use('/admin', require('./routes/admin'))
//Public
    .use(express.static(path.join(__dirname,'public')))

//Start server
http.listen(port, () => {
	console.log('iniciando express y socket.io en el localhost:%d', port)
})

socket.listen(http)
