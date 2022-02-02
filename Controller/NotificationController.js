'use strict'
const response = require('./../response')
const userId = require('./../use/getUserId')

/**
 * Уведомление о запросе на удаления ИОМа
 * ПРОФИЛЬ АДМИНА
 */

exports.getNotificationAction = async(req,res) => {
    try {
        let countReq = `SELECT * FROM permission_to_delete_iom`
        let [result] = await req.db.execute(countReq)

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}

/**
 *  Уведомление о завершении
 * ПРОФИЛЬ АДМИНА
 */

exports.getNotificationEnd = async(req,res) => {
    try {
        let countReq = `SELECT group_id FROM permission_to_finished_education`

        let [result] = await req.db.execute(countReq)

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}


exports.getRequestPendingExercise = async(req,res) => {
    try {
        const token = req.body.token
        const id = await userId(req.db,token)
        const tutor_id = id[0]['user_id']
        let countReq = `SELECT id  FROM a_report WHERE accepted = 0 AND tutor_id = "${tutor_id}" `
        let [result] = await req.db.execute(countReq)

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}

exports.cancelRequest = async(req,res) => {
    try {
        const idIom = req.body.idIom
        const idTutor = req.body.idTutor
        let countReq = `DELETE FROM permission_to_delete_iom WHERE iom_id="${idIom}" AND tutor_id= "${idTutor}"`
        let [result] = await req.db.execute(countReq)

        if(!result.affectedRows) {
            response.status(201, {message: 'Неизвестная ошибка, обратитесь к разработчикам'},res)
        }else {
            response.status(200,
                {message: 'Запрос на удаление ИОМа был успешно отклонен'},res)
            return true
        }
    }catch (e) {

    }
}

exports.getRequestStudents = async(req,res) => {
    try {
        let countReq = `SELECT COUNT(*) as id  FROM users WHERE role = "student" AND status IS NULL`
        let testSql = `SELECT * FROM users  WHERE role = "student" AND status IS NULL`
        let [result] = await req.db.execute(countReq)
        let [test] = await req.db.execute(testSql)

        if(!result.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}

exports.getRequestTutors = async(req,res) => {
    try {

        let countReq = `SELECT COUNT(*) as id  FROM users WHERE role = 'tutor' AND status IS NULL`
        let [result] = await req.db.execute(countReq)

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}

exports.getIomRequest = async(req,res) => {
    try {


        let iomData = `SELECT p.iom_id, p.tutor_id, t.name, t.surname, t.phone, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i:%s') as created_at
                           FROM permission_to_delete_iom as p
                           INNER JOIN tutors as t ON p.tutor_id = t.user_id`
        let [result] = await req.db.execute(iomData)
        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {

    }
}