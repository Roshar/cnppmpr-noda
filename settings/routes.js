'use strict'

module.exports = (app) => {
    const passport = require('passport')
    const authCtrl = require('../Controller/AuthController')
    const disciplinesCtrl = require('./../Controller/DisciplinesController')
    const schoolCtrl = require('./../Controller/SchoolsController')
    const usersCtrl = require('../Controller/UsersController')

    // get all users from tbl user
    app
        .route('/api/users')
        .get(passport.authenticate('jwt',{
            session: false
        }),usersCtrl.getAllUsers)

    //registration
    app
        .route('/api/auth/signup')
        .post(authCtrl.signup)

    // login
    app
        .route('/api/auth/signin')
        .post(authCtrl.singin)

    // get school by area id
    app
        .route('/api/getschools/byarea')
        .post(schoolCtrl.getSchoolsByAreaId)

    // get areas
    app
        .route('/api/getschools/area')
        .post(schoolCtrl.getAreas)

    // get disciplines
    app
        .route('/api/get/discipines')
        .post(disciplinesCtrl.getDisciplines)

    //get role
    app
        .route('/api/get/role')
        .post(authCtrl.getRole)

    //logout
    app
        .route('/api/logout')
        .post(authCtrl.logout)

    app
        .route('/api/sendCodeToMail')
        .post(authCtrl.sendCodeToMail)

    app
        .route('/api/auth/confirmcode')
        .post(authCtrl.confirmcode)

    app
        .route('/api/auth/recovery')
        .post(authCtrl.recovery)

    app
        .route('/api/auth/recoverychecklink')
        .post(authCtrl.recoverychecklink)

    app
        .route('/api/auth/changepassword')
        .post(authCtrl.changepassword)

    app
        .route('/api/user/getUserData')
        .post(usersCtrl.getUserData)


}

