'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getAction = async(req,res) => {
    try {
        const dbObj = new DB()
        let countReq = `SELECT * FROM permission_to_delete_iom`
        let result = await dbObj.create(countReq)
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

exports.getRequestStudents = async(req,res) => {
    try {
        const dbObj = new DB()
        let countReq = `SELECT COUNT(*) as id  FROM users WHERE role = "student" AND status IS NULL`
        let result = await dbObj.create(countReq)
        console.log(result)
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
        const dbObj = new DB()
        let countReq = `SELECT COUNT(*) as id  FROM users WHERE role = 'tutor' AND status IS NULL`
        let result = await dbObj.create(countReq)
        console.log(result)
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
        const dbObj = new DB()

        let iomData = `SELECT p.iom_id, p.tutor_id, t.name, t.surname, t.phone, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i:%s') as created_at
                           FROM permission_to_delete_iom as p
                           INNER JOIN tutors as t ON p.tutor_id = t.user_id`
        let result = await dbObj.create(iomData)
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