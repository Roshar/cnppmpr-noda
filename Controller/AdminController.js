'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getUserCount = async(req,res) => {
    try {
        const tblName = req.body.tbl
        const userObj = new DB()
        let sql = `SELECT COUNT(*) FROM ${tblName}`
        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData[0]['COUNT(*)'],res)
            return true
        }
    }catch (e) {

    }
}

exports.getLastUsers = async (req, res) => {
    try {

        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData;
        let sql;
        if(tblName === 'students') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE  u.status IS NULL or u.status = 'on'  ORDER by u.created_at DESC`
        }else if(tblName === 'tutors'){
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, 
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE  u.status IS NULL or u.status = 'on'  ORDER by u.created_at DESC`
        }

            sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getUsersActive = async (req, res) => {
    try {
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(tblName === 'students') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'on'`
        } else if(tblName === 'tutors') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'on'`
        }

        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getProfile = async (req, res) => {
    try {
        const userId = req.body.userId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if (tblName === 'students') {
             sql =
                `SELECT    
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender,t.avatar, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday,TIMESTAMPDIFF(YEAR, t.birthday, CURDATE()) as age, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status, u.login, DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update, DATE_FORMAT(u.auth_update, '%d.%m.%Y в %H:%i') as last_active,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user
                WHERE u.status = 'on' AND u.id_user = "${userId}"`
        }else if(tblName === 'tutors') {
            sql =
                `SELECT    
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender,t.avatar, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday,TIMESTAMPDIFF(YEAR, t.birthday, CURDATE()) as age, t.discipline_id, 
                d.title_discipline,
                u.status, u.login, DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update, DATE_FORMAT(u.auth_update, '%d.%m.%Y в %H:%i') as last_active, 
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user
                WHERE u.status = 'on' AND u.id_user = "${userId}"`
        }

        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getDependenciesStudent = async (req, res) => {
    try {
        const userId = req.body.userId
        const userObj = new DB()
        let sql =  `SELECT rts.group_id, rts.s_user_id, rts.t_user_id, t.name, t.surname, t.patronymic, t.discipline_id,
                    g.title
                    FROM relationship_tutor_student as rts
                    INNER JOIN tutors as t ON rts.t_user_id = t.user_id
                    INNER JOIN groups as g ON rts.group_id = g.id
                    WHERE s_user_id = "${userId}"`
        let sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getDependenciesTutor = async (req, res) => {
    try {
        const userId = req.body.userId
        const userObj = new DB()
        const tblCollection = tblMethod.tbleCollection(userId)
        let gender = ''

        let sql =  `SELECT gr.group_id, gr.tutor_id, g.title
                    FROM groups_relationship as gr 
                    INNER JOIN groups as g ON gr.group_id = g.id 
                    WHERE gr.tutor_id = "${userId}"`
        let groupData = await userObj.create(sql)


        let sql2 = `SELECT COUNT(id) as students FROM relationship_tutor_student WHERE t_user_id = "${userId}"`
        let countStudents = await userObj.create(sql2)

        if(countStudents[0]['students']) {
            let sql5 = `SELECT COUNT(s1.id) as id FROM ${tblCollection.student} as s1 
                        INNER JOIN students as s2 ON s1.student_id = s2.user_id WHERE s2.gender = 'man'`
             gender = await userObj.create(sql5)
        }

        let sql3 = `SELECT COUNT(id) as reports FROM report WHERE tutor_id = "${userId}"`
        let countReports = await userObj.create(sql3)



        let sql4 = `SELECT COUNT(id) as ioms FROM ${tblCollection.iom}`
        let iomData = await userObj.create(sql4)

        response.status(200,{groupData, countStudents, iomData, gender, countReports},res)
    }catch (e) {

    }
}

exports.getUsersWithBanStatus = async (req, res) => {
    try {

        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'ban'`
            sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

// area gender discipline
exports.getUsersWithDisAreaGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} AND  t.gender = "${gender}" `
        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

// area
exports.getUsersWithAreaFilter = async (req, res) => {
    try {
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' `
        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

//area gender
exports.getUsersWithAreaGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND  t.gender = "${gender}" `
        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

// area discipline
exports.getUsersWithDisAreaFilter = async (req, res) => {
    try {

        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} `
        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

//  gender
exports.getUsersWithGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.gender = "${gender}" AND u.status = 'on' `

        }else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE t.gender = "${gender}" AND u.status = 'on' `
        }
        sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

// discipline
exports.getUsersWithDisFilter = async (req, res) => {
    try {

        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' `
        } else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' `
        }

        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

// discipline gender
exports.getUsersWithDisGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql

        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' AND  t.gender = "${gender}" `
        }else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' AND  t.gender = "${gender}"`
        }

        sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.liveSearchInput = async (req, res) => {
    try {
        const param = req.body.param
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(param) {
            sql =  `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name, 
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                    INNER JOIN users as u ON t.user_id = u.id_user 
                    WHERE u.status = 'on' AND (t.name LIKE "${param}%" OR t.surname LIKE "${param}%") LIMIT 10`
            sqlData = await userObj.create(sql)
        }
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getTutorAndCheckAtFree = async(req, res) => {
    try {
        const userObj = new DB()
        let sql = `SELECT user_id, name, surname,patronymic, discipline_id FROM tutors WHERE user_id NOT IN (SELECT tutor_id FROM groups_relationship)`
        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.liveSearchInputAndArea = async (req, res) => {
    try {
        const param = req.body.param
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(param) {
            sql = `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                    INNER JOIN users as u ON t.user_id = u.id_user  
                    WHERE t.area_id = ${areaId} AND u.status = 'on' AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
            sqlData = await userObj.create(sql)
        }
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.liveSearchInputAndAreaAndDis = async (req, res) => {
    try {
        const param = req.body.param
        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(param) {
            sql = `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                    INNER JOIN users as u ON t.user_id = u.id_user 
                    WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
            sqlData = await userObj.create(sql)
        }
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.liveSearchInputAndDis = async (req, res) => {
    try {
        const param = req.body.param
        const disId = req.body.disId
        const tblName = req.body.tbl
        const userObj = new DB()
        let sqlData
        let sql
        if(param) {
            sql =  `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday , t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                    INNER JOIN users as u ON t.user_id = u.id_user
                    WHERE t.discipline_id = ${disId} AND u.status = 'on' AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`

            sqlData = await userObj.create(sql)
        }
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getOptionFromStudents = async(req,res) => {
    try {
        const userObj = new DB()
        const column = req.body.column
        const tbl = req.body.table
        const value = req.body.value?.val
        const parameter = req.body.value.parameter
        let optionSql
        if(parameter == 'age'){
            optionSql = `SELECT COUNT(id) as 'COUNT(${column})' FROM students 
                         WHERE TIMESTAMPDIFF(YEAR, birthday, CURDATE())  >= ${value.start} 
                         AND TIMESTAMPDIFF(YEAR, birthday, CURDATE())  < ${value.end}`
        }else if(parameter == 'number') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = ${value}`;
        }else if(parameter == 'string') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = "${value}"`
        }else if(parameter == 'none') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl}`
        }
        let optionData = await userObj.create(optionSql)
        if(!optionData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                optionData[0][`COUNT(${column})`],res)
            return true
        }
    }catch (e) {

    }
}

exports.deleteIom = async(req,res) => {
    try {
        const iomId = req.body.iomId
        const tutorId = req.body.userId
        const tblCollection = tblMethod.tbleCollection(tutorId)
        const userObj = new DB()
        let sql1 = `DELETE FROM permission_to_delete_iom WHERE iom_id = "${iomId}" AND tutor_id = "${tutorId}" `
        let sql2 = `DELETE FROM ${tblCollection.iom} WHERE iom_id = "${iomId}"`
        let sql3 = `DELETE FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${iomId}"`
        let sql4 = `DELETE FROM count_iom WHERE iom_id = "${iomId}" AND tutor_id = "${tutorId}" `
        let sqlData1 = await userObj.create(sql1)
        let sqlData2 = await userObj.create(sql2)
                       await userObj.create(sql3)
                       await userObj.create(sql4)

        if(!sqlData1.affectedRows && !sqlData2.affectedRows) {
            response.status(201,{message:'Данный ИОМ невозможно удалить. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'ИОМ удален!'},res)
        }
    }catch (e) {

    }
}

exports.activationById = async(req,res) => {
    try {
        const userId = req.body.userId
        const userObj = new DB()
        const sql  = 'UPDATE `users` SET `status`= "on" WHERE `id_user` = "' + userId +'"';
        const sqlSession  = 'UPDATE `authorization` SET `status`= "on" WHERE `user_id` = "' + userId +'"';
        let sqlData1 = await userObj.create(sql)
        await userObj.create(sqlSession)

        if(!sqlData1.affectedRows) {
            response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'Пользователь активирован'},res)
        }
    }catch (e) {

    }
}

exports.deactivationById = async(req,res) => {
    try {
        const userId = req.body.userId
        const userObj = new DB()
        const sqlUser  = 'UPDATE `users` SET `status`= "ban" WHERE `id_user` = "' + userId +'"';
        const sqlSession  = 'UPDATE `authorization` SET `status`= "ban" WHERE `user_id` = "' + userId +'"';
        let sqlData1 = await userObj.create(sqlUser)
        let sqlData2 = await userObj.create(sqlSession)

        if(!sqlData1.affectedRows ) {
            response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'Пользователь деактивирован'},res)
        }
    }catch (e) {

    }
}

exports.createGroup = async(req, res) => {
    try {
        const tutorId = req.body.tutor
        const title = req.body.title
        const description = req.body.description
        const userObj = new DB()
        const insertSqlG = `INSERT INTO groups (title, description) VALUES ("${title}", "${description}")`
        let insertSqlGR;
        let result2;
        const result = await userObj.create(insertSqlG)
        if(result.insertId) {
            insertSqlGR = `INSERT INTO groups_relationship (group_id, tutor_id) VALUES (${result.insertId}, "${tutorId}")`
            result2 = await userObj.create(insertSqlGR)
        }
        if(!result2.insertId) {
            response.status(201, {message:'Ошибка при создании группы. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Учебная группа создана'},res)
        }
    }catch (e) {

    }
}

exports.deleteGroup = async(req, res) => {
    try {
        const id = req.body.id
        const userObj = new DB()
        const sql = `SELECT COUNT(id) as id FROM relationship_tutor_student WHERE group_id = ${id}`
        const result = await userObj.create(sql)
        if(!result[0].id) {
            const sql2 = `DELETE FROM groups WHERE id = ${id}`
            const result2 = await userObj.create(sql2)
            const sql3 = `DELETE FROM groups_relationship WHERE group_id = ${id}`
            await userObj.create(sql3)
            if(!result2.affectedRows) {
                response.status(201, {message:'Ошибка при выполнении операции. '},res)
            }else {
                response.status(200,{message:'Группа удалена'},res)
            }
        }else {
            response.status(201, {message:'И всё-таки мы склонны думать, что Вы поспешили. Поговорите с разработчиками  '},res)
        }


        // if(!result.insertId) {
        //     response.status(201, {message:'Ошибка при создании группы. Обратитесь к разработчикам'},res)
        // }else {
        //     response.status(200,{message:'Учебная группа создана'},res)
        // }
    }catch (e) {

    }
}

exports.deleteInGroup = async(req, res) => {
    try {
        const user = req.body.user
        const groupId = req.body.groupId
        const userObj = new DB()
        const sql1 = `SELECT COUNT(id) as id FROM relationship_student_iom WHERE user_id = "${user}"`
        const result1 = await userObj.create(sql1)
        if(!result1[0].id){
            const sql = `DELETE FROM relationship_tutor_student WHERE s_user_id = "${user}" AND group_id = ${groupId}`
            const result = await userObj.create(sql)
            if(!result.affectedRows) {
                response.status(201, {message:'Ошибка при выполнении операции. '},res)
            }else {
                response.status(200, {message:'Пользователь удален из группы'},res)
            }
        }else {
            response.status(201, {message:'Пользователя нельзя удалить из группы. Пользователю назначен ИОМ '},res)
        }

    }catch (e) {

    }
}

exports.addUserInGroupAndTutor = async(req, res) => {
    try {
        const tutorId = req.body.tutor
        const studentId = req.body.student
        const groupId = req.body.group
        const userObj = new DB()
        const insertSql = `INSERT INTO relationship_tutor_student (s_user_id, t_user_id, group_id) VALUES ("${studentId}", "${tutorId}", ${groupId} )`
        const result = await userObj.create(insertSql)
        if(!result.insertId) {
            response.status(201, {message:'Ошибка при добавлении в  группу. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Пользователь добавлен в текущую группу'},res)
        }
    }catch (e) {

    }
}

exports.getGroups = async(req,res) => {
    try {
        const userObj = new DB()
        let sql = `SELECT g.id, g.title, g.description, DATE_FORMAT(g.created_at, '%d.%m.%Y %H:%i') as created_at, gr.tutor_id, t.name, t.surname, t.patronymic, d.title_discipline
                   FROM groups as g 
                   INNER JOIN groups_relationship as gr ON g.id = gr.group_id
                   INNER JOIN tutors as t ON gr.tutor_id = t.user_id
                   INNER JOIN discipline as d ON t.discipline_id = d.id_dis`

        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getGroupById =  async(req,res) => {
    try {
        const groupId = req.body.groupId
        const userObj = new DB()
        let sql = `SELECT g.id, g.title, g.description, DATE_FORMAT(g.created_at, '%d.%m.%Y %H:%i') as created_at, gr.tutor_id, t.name, t.surname, t.patronymic, d.title_discipline, d.id_dis
                   FROM groups as g 
                   INNER JOIN groups_relationship as gr ON g.id = gr.group_id
                   INNER JOIN tutors as t ON gr.tutor_id = t.user_id
                   INNER JOIN discipline as d ON t.discipline_id = d.id_dis WHERE g.id = ${groupId}`
        let sqlData = await userObj.create(sql)
        if (!sqlData.length) {
            response.status(201, {}, res)
        } else {
            response.status(200,
                sqlData[0], res)
            return true
        }
    } catch (e) {

    }
}

exports.getAppointedStudentsCurrentGroup = async(req, res) => {
    try {
        const tutorId = req.body.tutorId
        const groupId = req.body.groupId
        const userObj = new DB()
        let sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, a.title_area, sch.school_name,
        s.gender, isset.isset_iom, isset.finish_iom  FROM students as s 
        INNER JOIN area as a ON s.area_id = a.id_area
        INNER JOIN schools as sch ON s.school_id = sch.id_school
        INNER JOIN admin_student_iom_status as isset ON isset.student_id = s.user_id
        INNER JOIN relationship_tutor_student as rsi ON s.user_id = rsi.s_user_id
        WHERE rsi.t_user_id  = "${tutorId}" AND rsi.group_id = ${groupId}`
        let sqlData = await userObj.create(sql)

        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getIomByStudentAndTutor = async(req, res) => {
    try {
        const tutorId = req.body.tutor
        const studentId = req.body.student
        const userObj = new DB()
        const tblCollection = tblMethod.tbleCollection(tutorId)
        const sql = `SELECT rsi.iom_id,rsi.status, iom.iom_id, iom.title FROM relationship_student_iom as rsi
                     INNER JOIN ${tblCollection.iom} as iom WHERE rsi.user_id = "${studentId}"`;
        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getFreeStudentsByDisciplineId = async(req, res) => {
    try {

        const disciplineId = req.body.disId
        const areaId = req.body.areaId ? req.body.areaId : ''
        const gender = req.body.gender ? req.body.gender : ''
        let sql;
        if(areaId && gender == '0') {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.area_id = ${areaId}`
        }else if(areaId == '0' && gender) {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.gender = "${gender}"`
        }else if(areaId && gender) {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.gender = "${gender}"
            AND s.area_id = ${areaId}`
        }
        else {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}`
        }

        const userObj = new DB()

        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}




