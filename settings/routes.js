'use strict'

module.exports = (app) => {
    const indexCtrl = require('./../Controller/IndexController')
    const passport = require('passport')
    const usersCtrl = require('./../Controller/UsersController')
    const disciplinesCtrl = require('./../Controller/DisciplinesController')
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

    // get disciplines
    app
        .route('/api/get/discipines')
        .post(disciplinesCtrl.getDisciplines)

    //get role
    app
        .route('/api/get/role')
        .post(usersCtrl.getRole)

    //logout
    app
        .route('/api/logout')
        .post(usersCtrl.logout)

    app
        .route('/api/sendCodeToMail')
        .post(usersCtrl.sendCodeToMail)

    app
        .route('/api/auth/confirmcode')
        .post(usersCtrl.confirmcode)

    app
        .route('/api/auth/recovery')
        .post(usersCtrl.recovery)

    app
        .route('/api/auth/recoverychecklink')
        .post(usersCtrl.recoverychecklink)

    app
        .route('/api/auth/changepassword')
        .post(usersCtrl.changepassword)


}

