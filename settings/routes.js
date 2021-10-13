'use strict'

module.exports = (app) => {
    const passport = require('passport')
    const authCtrl = require('../Controller/AuthController')
    const disciplinesCtrl = require('./../Controller/DisciplinesController')
    const schoolCtrl = require('./../Controller/SchoolsController')
    const usersCtrl = require('../Controller/UsersController')
    const iomCtrl = require('../Controller/IomContoller')
    const mentorCtrl = require('../Controller/MentorController')
    const tagCtrl = require('../Controller/TagController')
    const libCtrl = require('../Controller/LibraryController')

    // get all users from tbl user
    app.route('/api/users').get(passport.authenticate('jwt',{
            session: false
        }),usersCtrl.getAllUsers)

    //registration
    app.route('/api/auth/signup').post(authCtrl.signup)

    // login
    app.route('/api/auth/signin').post(authCtrl.singin)

    // get school by area id
    app.route('/api/getschools/byarea').post(schoolCtrl.getSchoolsByAreaId)

    // get areas
    app.route('/api/getschools/area').post(schoolCtrl.getAreas)

    // get disciplines
    app.route('/api/get/discipines').post(disciplinesCtrl.getDisciplines)

    //get role
    app.route('/api/get/role').post(authCtrl.getRole)

    //logout
    app.route('/api/logout').post(authCtrl.logout)

    app.route('/api/sendCodeToMail').post(authCtrl.sendCodeToMail)

    app.route('/api/auth/confirmcode').post(authCtrl.confirmcode)

    app.route('/api/auth/recovery').post(authCtrl.recovery)

    app.route('/api/auth/recoverychecklink').post(authCtrl.recoverychecklink)

    app.route('/api/auth/changepassword').post(authCtrl.changepassword)

    app.route('/api/user/getUserData').post(usersCtrl.getUserData)

    app.route('/api/user/getFromTutorTbls').post(usersCtrl.getFromTutorTbls)

    app.route('/api/iom/getData').post(iomCtrl.getData)

    app.route('/api/iom/addNewIom').post(iomCtrl.addNewIom)
    app.route('/api/iom/issetIomId').post(iomCtrl.issetIomId)
    app.route('/api/iom/getExercises').post(iomCtrl.getExercises)
    app.route('/api/iom/addExercise').post(iomCtrl.addExercise)

    // get task by id
    app.route('/api/iom/getTask').post(iomCtrl.getTask)
    app.route('/api/iom/getTag').post(tagCtrl.getTag)
    app.route('/api/iom/getMentor').post(mentorCtrl.getMentorData)
    app.route('/api/iom/updateExercise').post(iomCtrl.updateExercise)
    app.route('/api/iom/deleteTask').post(iomCtrl.deleteTask)
    app.route('/api/iom/deleteIom').post(iomCtrl.deleteIom)
    app.route('/api/iom/addExerciseFromLib').post(iomCtrl.addExerciseFromLib)
    app.route('/api/library/getLibraryData').post(libCtrl.getLibraryData)
    app.route('/api/library/addExercise').post(libCtrl.addExercise)
    app.route('/api/library/getTask').post(libCtrl.getTask)
    app.route('/api/library/update').post(libCtrl.update)
    app.route('/api/library/deleteTask').post(libCtrl.deleteTask)

}

