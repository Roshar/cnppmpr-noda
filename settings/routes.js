'use strict'

module.exports = (app) => {
    const indexCtrl = require('./../Controller/IndexController')
    const usersCtrl = require('./../Controller/UsersController')

    app
        .route('/api/users')
        .get(usersCtrl.getAllUsers)
    app
        .route('/api/auth/signup')
        .post(usersCtrl.signup)
}

