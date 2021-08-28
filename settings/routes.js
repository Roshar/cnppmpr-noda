'use strict'

module.exports = (app) => {
    const indexCtrl = require('./../Controller/IndexController')
    const passport = require('passport')
    const usersCtrl = require('./../Controller/UsersController')

    app
        .route('/api/users')
        .get(passport.authenticate('jwt',{
            session: false
        }),usersCtrl.getAllUsers)
    app
        .route('/api/auth/signup')
        .post(usersCtrl.signup)

    app
        .route('/api/auth/signin')
        .post(usersCtrl.singin)
}

