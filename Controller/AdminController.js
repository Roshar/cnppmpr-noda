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
                    WHERE (t.name LIKE "${param}%") OR (t.surname LIKE "${param}%") LIMIT 10`
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
                    WHERE t.area_id = ${areaId} AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
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
                    WHERE t.area_id = ${areaId} AND t.discipline_id = ${disId} AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
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
                    WHERE t.discipline_id = ${disId} AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`

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




