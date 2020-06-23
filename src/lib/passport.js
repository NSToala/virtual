const passport = require('passport'),
    Strategy = require('passport-local').Strategy,
    pool = require('../model/connection'),
    helpers = require('./helpers')

passport.use('login', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username])

    if( rows.length > 0 ) {
        const user = rows[0]
        const validPassword = await helpers.comparePassword(password, user.password)
        if(validPassword) {
            await pool.query('UPDATE users SET status = 1 WHERE id_user = ?', user.id_user)
            done(null, user, req.flash('success',`Welcome ${user.username}`))
        }else
            done(null, false, req.flash('message','Incorrect password'))
    }else {
        done(null, false, req.flash('message','No user found.'))
    }
}))

passport.use('register', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const {fullname, email } = req.body

    const user = {
        fullname,
        username,
        email,
        password
    }
    user.password = await helpers.encryptPassword(password)
    const result = await pool.query('INSERT INTO users SET ?', [user])
    user.id_user = result.insertId

    return done(null, user)
}))

passport.serializeUser((user, done) => {
    done(null, user.id_user)
})

passport.deserializeUser(async (id, done) => {
    const row = await pool.query('SELECT * FROM users WHERE id_user = ?', [id])
    done(null, row[0])
})