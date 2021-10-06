'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getData = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT * FROM ${tblCollection.iom}`
        let iomData = await userObj.create(iomSql)
        console.log(iomData)
        if(!iomData.length) {
            response.status(200, {message:"пусто"},res)
        }else {
            response.status(200,
                iomData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.addNewIom = async(req, res) => {
    try {
        const userObj = new DB()
        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || null
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const iomSql = `INSERT INTO ${tblCollection.iom} (iom_id, title,description) VALUES ("${iomId}","${titleIom}","${description}")`
        let result = await userObj.create(iomSql)
        // console.log(result)
        if(!result) {
            response.status(400,{message:'Ошибка при создании ИОМа'},res)
        }else {
            response.status(200,
                    {message: 'Индвидуальный образовательный маршрут создан', iomId: iomId },res)
            return true
        }

    }catch (e) {
        return e
    }
}
exports.issetIomId = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT id FROM ${tblCollection.iom} WHERE iom_id = "${req.body.payload.id}"`
        let iomData = await userObj.create(iomSql)
        let result = [tblCollection,iomData]
        if(!iomData) {
            response.status(401, {message:"не существующий маршрут"},res)
        }else {
            response.status(200,
                result,res)
            return true
        }

    }catch (e) {
        return e
    }
}
exports.getExercise = async(req, res) => {
    try {
        console.log(req.body)
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let exerciseSql = `SELECT * FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${req.body.payload.id}"`
        let exerciseData = await userObj.create(exerciseSql)
        console.log(exerciseData.length)
        if(!exerciseData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.addExercise = async(req, res) => {
    try {
        console.log(req.body)
        const {title, description, link, author, tag,  status = 1,mentor_id = 0 } = req.body.values
        const term = '1000-01-01'
        const tblName = req.body.tbl
        const iom_id = req.body.values.iom.id

        const activeObj = new DB()
        const sql = `INSERT INTO ${tblName} (iom_id, title, description, link, author, term, tag_id, mentor_id, status) VALUES ("${iom_id}","${title}","${description}","${link}","${author}","${term}","${tag}","${mentor_id}","${status}")`
        let result = await activeObj.create(sql)
        console.log(result.insertId)
        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            // console.log('success')
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }

    }catch (e) {
        // return e
    }
}