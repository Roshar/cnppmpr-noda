'use strict'

module.exports = (app) => {
    const indexCtrl = require('./../Controller/IndexController')
    const passport = require('passport')
    const usersCtrl = require('./../Controller/UsersController')
    const schoolCtrl = require('./../Controller/SchoolsController')

    // get all users from tbl user
    app
        .route('/api/users')
        .get(passport.authenticate('jwt',{
            session: false
        }),usersCtrl.getAllUsers)

    //registration
    app
        .route('/api/auth/signup')
        .post(usersCtrl.signup)

    // login
    app
        .route('/api/auth/signin')
        .post(usersCtrl.singin)

    // get school by area id
    app
        .route('/api/getschools/byarea')
        .post(schoolCtrl.getSchoolsByAreaId)

    // get areas
    app
        .route('/api/getschools/area')
        .post(schoolCtrl.getAreas)

    //get role
    app
        .route('/api/get/role')
        .post(usersCtrl.getRole)

    //logout
    app
        .route('/api/logout')
        .post(usersCtrl.logout)
}

