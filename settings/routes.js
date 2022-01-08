'use strict'

module.exports = (app) => {
    const passport = require('passport')
    const multer = require('multer');
    const path = require('path')
    const fs = require('fs');
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {

            console.log('destination')
            console.log(file)
            console.log(req.body)
            console.log('destinationEnd')
            if(file.fieldname === 'file') {
                cb(null, 'uploads/avatar')
            }else if(file.fieldname === 'answer') {
                if (!fs.existsSync('uploads/answer/' + file.originalname)){
                    fs.mkdirSync('uploads/answer/' + file.originalname);
                }
                cb(null, 'uploads/answer/' + file.originalname)
            }

        },
        filename: function (req, file, cb) {
            const MIME_TYPE_MAP = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'application/msword': 'doc',
                'application/doc': 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                'application/vnd.ms-excel': 'xls',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                'application/vnd.ms-powerpoint': 'ppt',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            }
            const date = new Date()
            // cb(null, file.originalname + '.'+ date.getTime() + file.mimetype.split('/')[1])
            cb(null, file.originalname + '_'+ date.getTime() + '.'+ MIME_TYPE_MAP[file.mimetype])
        }
    })
    const upload = multer({
        storage: storage,
        limits: {
            fields: 8,
            fieldNameSize: 40, // TODO: Check if this size is enough
            fieldSize: 20000, //TODO: Check if this size is enough
                                 // TODO: Change this line after compression
            fileSize: 5000000, // 5 МБ
        },
        fileFilter: function(req, file, cb){
            console.log('fileFilter')
            console.log(file)
            console.log('fileFilterEnd')
            checkFileType(file, cb);
        }
    })
    function checkFileType(file, cb){
        console.log('checkFile')
        console.log(file)
        console.log('checkFileEnd')
        if(file.fieldname === 'file'){
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
                return cb(null,true);
            }else {
                return cb('Error: Images Only!');
            }
        }else if(file.fieldname === 'answer'){
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'
                || file.mimetype === 'application/msword' || file.mimetype === 'application/pdf'
                || file.mimetype === 'application/doc' || file.mimetype === 'application/docx'
                || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' //docx
                || file.mimetype == 'application/vnd.ms-excel' ||file.mimetype == 'application/vnd.ms-excel' //xls
                || file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' //xlsx
                || file.mimetype == 'application/vnd.ms-powerpoint' //ppt
                || file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){ //pptx
                return cb(null,true);
            }else {
                return cb('Error: ONLY PDF DOC IMG formats!');
            }
        }


    }
    const authCtrl = require('../Controller/AuthController')
    const disciplinesCtrl = require('./../Controller/DisciplinesController')
    const schoolCtrl = require('./../Controller/SchoolsController')
    const usersCtrl = require('../Controller/UsersController')
    const iomCtrl = require('../Controller/IomContoller')
    const mentorCtrl = require('../Controller/MentorController')
    const tagCtrl = require('../Controller/TagController')
    const libCtrl = require('../Controller/LibraryController')
    const adminCtrl = require('../Controller/AdminController')
    const notificationCtrl = require('../Controller/NotificationController')
    const conCtrl = require('../Controller/ConversationController')
    const globalLib = require('../Controller/GlobalLibraryController')
    const studentCtrl = require('../Controller/StudentController')
    const finishedCtrl = require('../Controller/FinishedController')

    // get all users from tbl user
    // app.route('/api/users').get(usersCtrl.getAllUsers)

    app.route('/api/test').post(usersCtrl.getAllUsers)

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

    // get levels
    app.route('/api/get/levels').post(disciplinesCtrl.getLevels)

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
    app.route('/api/user/getAdminData').post(usersCtrl.getAdminData)
    app.route('/api/user/getTutorData').post(usersCtrl.getTutorData)
    app.route('/api/user/deleteTutor').post(usersCtrl.deleteTutor)
    app.route('/api/user/deleteStudent').post(usersCtrl.deleteStudent)
    app.route('/api/user/getDataAdminAccount').post(usersCtrl.getDataAdminAccount)
    app.route('/api/user/getFromTutorTbls').post(usersCtrl.getFromTutorTbls)
    app.route('/api/user/updateTutorProfile').post(usersCtrl.updateTutorProfile)
    app.route('/api/user/updateAdminProfile').post(usersCtrl.updateAdminProfile)
    app.route('/api/user/updateStudentProfile').post(usersCtrl.updateStudentProfile)

    app.route('/api/user/changeAvatar').post(upload.single('file'), usersCtrl.changeAvatar)
    // app.route('/api/user/changeAvatar').post( usersCtrl.changeAvatar)

    app.route('/api/iom/getData').post(iomCtrl.getData)
    app.route('/api/iom/getStudentAnswer').post(iomCtrl.getStudentAnswer)
    app.route('/api/iom/successTask').post(iomCtrl.successTask)
    app.route('/api/iom/correctionTask').post(iomCtrl.correctionTask)
    app.route('/api/iom/getPendingDataOrFinished').post(iomCtrl.getPendingDataOrFinished)
    app.route('/api/iom/getStatusFinished').post(iomCtrl.getStatusFinished)
    app.route('/api/iom/getStatusToPendingFinish').post(iomCtrl.getStatusToPendingFinish)
    // app.route('/api/iom/downloadFile').post(iomCtrl.downloadFile)

    app.route('/api/iom/addNewIom').post(iomCtrl.addNewIom)
    app.route('/api/iom/issetIomId').post(iomCtrl.issetIomId)
    app.route('/api/iom/getExercises').post(iomCtrl.getExercises)
    app.route('/api/iom/addExercise').post(iomCtrl.addExercise)


    //STUDENTS | TUTOR

    app.route('/api/student/getStudentsForTutor').post(studentCtrl.getStudentsForTutor)
    app.route('/api/student/getEducationLevels').post(studentCtrl.getEducationLevels)
    app.route('/api/student/getPositions').post(studentCtrl.getPositions)
    app.route('/api/student/getExperience').post(studentCtrl.getExperience)
    app.route('/api/student/getCategoryTeach').post(studentCtrl.getCategoryTeach)
    app.route('/api/student/insertOrUpdateAdditionally').post(studentCtrl.insertOrUpdateAdditionally)
    app.route('/api/student/getStudentAdditionallyOptionById').post(studentCtrl.getStudentAdditionallyOptionById)
    app.route('/api/student/getUsersFromIomFreeForEducation').post(studentCtrl.getUsersFromIomFreeForEducation)
    app.route('/api/student/addStudentInCurrentIom').post(studentCtrl.addStudentInCurrentIom)
    app.route('/api/student/deleteStudentFromIomEducation').post(studentCtrl.deleteStudentFromIomEducation)
    app.route('/api/student/getUsersFromIomEducation').post(studentCtrl.getUsersFromIomEducation)
    app.route('/api/student/getStudentsForTutorWithGender').post(studentCtrl.getStudentsForTutorWithGender)
    app.route('/api/student/getStudentsForTutorWithArea').post(studentCtrl.getStudentsForTutorWithArea)
    app.route('/api/student/getStudentsForTutorWithIom').post(studentCtrl.getStudentsForTutorWithIom)
    app.route('/api/student/getStudentsForTutorWithGenderAndIom').post(studentCtrl.getStudentsForTutorWithGenderAndIom)
    app.route('/api/student/getStudentsForTutorWithGenderAndArea').post(studentCtrl.getStudentsForTutorWithGenderAndArea)
    app.route('/api/student/getStudentsForTutorWithGenderAndAreaAndIom').post(studentCtrl.getStudentsForTutorWithGenderAndAreaAndIom)
    app.route('/api/student/getStudentsForTutorWithAreaAndIom').post(studentCtrl.getStudentsForTutorWithAreaAndIom)
    app.route('/api/student/checkIssetMyIom').post(studentCtrl.checkIssetMyIom)
    app.route('/api/student/getExercisesFromMyIom').post(studentCtrl.getExercisesFromMyIom)
    app.route('/api/student/getMyTaskById').post(studentCtrl.getMyTaskById)
    app.route('/api/student/getCommentsByTask').post(studentCtrl.getCommentsByTask)
    app.route('/api/tutor/getCommentsByTaskForTutor').post(usersCtrl.getCommentsByTaskForTutor)
    app.route('/api/tutor/sendCommentsForTaskTutor').post(usersCtrl.sendCommentsForTaskTutor)
    app.route('/api/student/getStatisticByIOM').post(studentCtrl.getStatisticByIOM)
    app.route('/api/student/sendCommentsForTask').post(studentCtrl.sendCommentsForTask)
    app.route('/api/student/insertInReportWithoutFile').post(studentCtrl.insertInReportWithoutFile)
    app.route('/api/student/insertInReportWithFile').post(upload.single('answer'), studentCtrl.insertInReportWithFile)
    app.route('/api/student/updateInReportWithoutFile').post(studentCtrl.updateInReportWithoutFile)
    app.route('/api/student/updateInReportWithFile').post(upload.single('answer'), studentCtrl.updateInReportWithFile)
    // finished education
    app.route('/api/finished/studentEducation').post(finishedCtrl.studentEducation)
    app.route('/api/finished/checkStudentIOM').post(finishedCtrl.checkStudentIOM)
    app.route('/api/finished/getFinishedCourses').post(finishedCtrl.getFinishedCourses)
    app.route('/api/finished/getStudentsForTutor').post(finishedCtrl.getStudentsForTutor)
    app.route('/api/finished/generationReportByStudentEducation').post(finishedCtrl.generationReportByStudentEducation)




    // get task by id
    app.route('/api/iom/getTask').post(iomCtrl.getTask)
    app.route('/api/iom/getDataById').post(iomCtrl.getDataById)
    app.route('/api/iom/getTag').post(tagCtrl.getTag)
    app.route('/api/iom/getSingleTag').post(tagCtrl.getSingleTag)
    app.route('/api/iom/editTag').post(tagCtrl.editTag)
    app.route('/api/iom/addNew').post(tagCtrl.addNew)
    app.route('/api/iom/deleteTag').post(tagCtrl.deleteTag)
    app.route('/api/iom/getMentor').post(mentorCtrl.getMentorData)
    app.route('/api/iom/updateExercise').post(iomCtrl.updateExercise)
    app.route('/api/iom/deleteTask').post(iomCtrl.deleteTask)
    app.route('/api/iom/deleteIom').post(iomCtrl.deleteIom)
    app.route('/api/iom/addExerciseFromLib').post(iomCtrl.addExerciseFromLib)
    app.route('/api/iom/addExerciseFromLibGlobal').post(iomCtrl.addExerciseFromLibGlobal)
    app.route('/api/library/getLibraryData').post(libCtrl.getLibraryData)
    app.route('/api/library/addExercise').post(libCtrl.addExercise)
    app.route('/api/library/getTask').post(libCtrl.getTask)
    app.route('/api/library/update').post(libCtrl.update)
    app.route('/api/library/deleteTask').post(libCtrl.deleteTask)

    //NOTIFICATION

    app.route('/api/notification/getAction').post(notificationCtrl.getAction)
    app.route('/api/notification/getRequestPendingExercise').post(notificationCtrl.getRequestPendingExercise)
    app.route('/api/notification/getRequestStudents').post(notificationCtrl.getRequestStudents)
    app.route('/api/notification/getRequestTutors').post(notificationCtrl.getRequestTutors)
    app.route('/api/notification/getIomRequest').post(notificationCtrl.getIomRequest)
    app.route('/api/notification/cancelRequest').post(notificationCtrl.cancelRequest)

    // CONVERSATION
    app.route('/api/conversation/send').post(conCtrl.send)
    app.route('/api/conversation/getCompanions').post(conCtrl.getCompanions)
    app.route('/api/conversation/getChat').post(conCtrl.getChat)
    app.route('/api/conversation/searchUser').post(conCtrl.searchUser)
    app.route('/api/conversation/createConversationWithoutInsert').post(conCtrl.createConversationWithoutInsert)
    //app.route('/api/conversation/getUsersForConversation').post(conCtrl.getUsersForConversation)


    // ADMIN

    // getData
    app.route('/api/admin/getUserCount').post(adminCtrl.getUserCount)
    app.route('/api/admin/getExercisesByIomId').post(adminCtrl.getExercisesByIomId)
    app.route('/api/admin/getAllIomDataByTutorId').post(adminCtrl.getAllIomDataByTutorId)
    app.route('/api/admin/getDataFromIOM').post(adminCtrl.getDataFromIOM)
    app.route('/api/admin/getTask').post(adminCtrl.getTask)
    app.route('/api/admin/getStatusFinished').post(adminCtrl.getStatusFinished)
    app.route('/api/admin/getStatusToPendingFinish').post(adminCtrl.getStatusToPendingFinish)
    app.route('/api/admin/getLastUsers').post(adminCtrl.getLastUsers)
    app.route('/api/admin/getUsersActive').post(adminCtrl.getUsersActive)
    app.route('/api/admin/getUsersWithDisAreaGenderFilter').post(adminCtrl.getUsersWithDisAreaGenderFilter)
    app.route('/api/admin/getUsersWithDisAreaFilter').post(adminCtrl.getUsersWithDisAreaFilter)
    app.route('/api/admin/getUsersWithDisFilter').post(adminCtrl.getUsersWithDisFilter)
    app.route('/api/admin/getUsersWithGenderFilter').post(adminCtrl.getUsersWithGenderFilter)
    app.route('/api/admin/getUsersWithAreaFilter').post(adminCtrl.getUsersWithAreaFilter)
    app.route('/api/admin/getUsersWithAreaGenderFilter').post(adminCtrl.getUsersWithAreaGenderFilter)
    app.route('/api/admin/getUsersWithDisGenderFilter').post(adminCtrl.getUsersWithDisGenderFilter)
    app.route('/api/admin/getUsersWithBanStatus').post(adminCtrl.getUsersWithBanStatus)
    app.route('/api/admin/getIomByStudentAndTutor').post(adminCtrl.getIomByStudentAndTutor)
    app.route('/api/admin/getDependenciesStudent').post(adminCtrl.getDependenciesStudent)
    app.route('/api/admin/getDependenciesTutor').post(adminCtrl.getDependenciesTutor)
    app.route('/api/admin/getProfile').post(adminCtrl.getProfile)
    app.route('/api/admin/getTutorAndCheckAtFree').post(adminCtrl.getTutorAndCheckAtFree)
    app.route('/api/admin/createGroup').post(adminCtrl.createGroup)
    app.route('/api/admin/deleteGroup').post(adminCtrl.deleteGroup)
    app.route('/api/admin/deleteInGroup').post(adminCtrl.deleteInGroup)
    app.route('/api/admin/addUserInGroupAndTutor').post(adminCtrl.addUserInGroupAndTutor)
    app.route('/api/admin/getGroupById').post(adminCtrl.getGroupById)
    app.route('/api/admin/getHistoryInfoIOM').post(adminCtrl.getHistoryInfoIOM)
    app.route('/api/admin/getAreasStatisticsByStudent').post(adminCtrl.getAreasStatisticsByStudent)
    app.route('/api/admin/getIomStatistic').post(adminCtrl.getIomStatistic)
    app.route('/api/admin/getFinishedStudentsByYear').post(adminCtrl.getFinishedStudentsByYear)
    app.route('/api/admin/getDisciplineStatisticsByStudentOrTutor').post(adminCtrl.getDisciplineStatisticsByStudentOrTutor)
    app.route('/api/admin/getGroups').post(adminCtrl.getGroups)
    app.route('/api/admin/getFreeStudentsByDisciplineId').post(adminCtrl.getFreeStudentsByDisciplineId)
    app.route('/api/admin/getAppointedStudentsCurrentGroup').post(adminCtrl.getAppointedStudentsCurrentGroup)
    app.route('/api/admin/liveSearchInput').post(adminCtrl.liveSearchInput)
    app.route('/api/admin/liveSearchInputAndArea').post(adminCtrl.liveSearchInputAndArea)
    app.route('/api/admin/liveSearchInputAndAreaAndDis').post(adminCtrl.liveSearchInputAndAreaAndDis)
    app.route('/api/admin/liveSearchInputAndDis').post(adminCtrl.liveSearchInputAndDis)
    app.route('/api/admin/getOptionFromStudents').post(adminCtrl.getOptionFromStudents)

    // GLOBAL LIBRARY
    app.route('/api/admin/globalLibrary/getData').post(globalLib.getData)
    app.route('/api/admin/globalLibrary/getDataByTutorDiscipline').post(globalLib.getDataByTutorDiscipline)
    app.route('/api/admin/globalLibrary/getDataWithFilter').post(globalLib.getDataWithFilter)
    app.route('/api/admin/globalLibrary/deleteById').post(globalLib.deleteById)
    app.route('/api/admin/globalLibrary/addInLibrary').post(globalLib.addInLibrary)
    app.route('/api/admin/globalLibrary/getDataById').post(globalLib.getDataById)
    app.route('/api/admin/globalLibrary/updateInLibrary').post(globalLib.updateInLibrary)



    // delete
    app.route('/api/admin/deleteIom').post(adminCtrl.deleteIom)

    // update
    app.route('/api/admin/activationById').post(adminCtrl.activationById)
    app.route('/api/admin/deactivationById').post(adminCtrl.deactivationById)






}

