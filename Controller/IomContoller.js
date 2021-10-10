'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

// CHECK AND GET
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
exports.getData = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT * FROM ${tblCollection.iom}`
        let iomData = await userObj.create(iomSql)
        // console.log(iomData)
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

// INSERT DATA

exports.addNewIom = async(req, res) => {
    try {

        const userObj = new DB()
        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || null
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const iomSql = `INSERT INTO ${tblCollection.iom} (iom_id, title, description) VALUES ("${iomId}","${titleIom}","${description}")`
        let result = await userObj.create(iomSql)
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
exports.addExercise = async(req, res) => {
    try {
        let {title, description = '', link = '', mentor=0, tag, term } = req.body.values
        term = term ? term : '1000-01-01'
        const tblName = req.body.tbl
        const iom_id = req.body.values.iomId
        const activeObj = new DB()
        const sql = `INSERT INTO ${tblName} (iom_id, title, description, link, mentor, term, tag_id) VALUES ("${iom_id}","${title}","${description}","${link}",${mentor},"${term}","${tag}")`
        let result = await activeObj.create(sql)
        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

//GET DATA

exports.getExercises = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let exerciseSql = `SELECT 
                            id_exercises,
                            iom_id,
                            title,
                            description,
                            link,
                            mentor,
                            DATE_FORMAT(term, '%d.%m.%Y') as term,
                            tag_id
        FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${req.body.payload.id}"`
        let exerciseData = await userObj.create(exerciseSql)
        console.log(exerciseData)
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
exports.getTask = async(req, res) => {
    const iomId = req.body.payload.param.id
    const taskId = req.body.payload.param.task
    let taskSql;
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const tbl = tblCollection.subTypeTableIom
        //taskSql = `SELECT ${tbl}.id_exercises, ${tbl}.iom_id, ${tbl}.title, ${tbl}.description, ${tbl}.link, ${tbl}.mentor, ${tbl}.term, ${tbl}.tag_id, mentor.id, mentor.mentor_name FROM ${tbl} INNER JOIN mentor ON mentor.id = ${tbl}.mentor  WHERE ${tbl}.iom_id = "${iomId}" AND ${tbl}.id_exercises = "${taskId}"`
        let taskSql = `SELECT    
                            id_exercises,
                            iom_id,
                            title,
                            description,
                            link,
                            mentor,
                            DATE_FORMAT(term, '%d.%m.%Y') as term,
                            tag_id FROM ${tbl} WHERE ${tbl}.iom_id = "${iomId}" AND ${tbl}.id_exercises = "${taskId}"`
        let taskData = await userObj.create(taskSql)
        if(!taskData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                taskData[0],res)
            return true
        }
    }catch (e) {
        return e
    }
}

// UPDATE AND DELETE
exports.updateExercise = async(req, res) => {
    try {
        console.log(req.body)
        const {id_exercise, title, description = '', link = '', mentor = 0, tag} = req.body.values
        const term = '1000-01-01'
        const tblName = req.body.tbl
        const iom_id = req.body.values.iomId
        const activeObj = new DB()
        const sql = `UPDATE  ${tblName} SET title ="${title}" , description = "${description}", link="${link}", mentor=${mentor}, term="${term}", tag_id=${tag} WHERE iom_id="${iom_id}" AND id_exercises = ${id_exercise}`
        let result = await activeObj.create(sql)
        if(!result.affectedRows) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно изменено"},res)
        }

    }catch (e) {
        console.log(e)
    }
}