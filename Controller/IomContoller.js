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
                         t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id
        FROM ${tblCollection.subTypeTableIom} as t INNER JOIN tag ON t.tag_id = tag.id_tag  WHERE t.iom_id = "${req.body.payload.id}" ORDER BY tag.id_tag ASC`
        let exerciseData = await userObj.create(exerciseSql)
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
    console.log(req.body)
    const iomId = req.body.payload.param.id
    const taskId = req.body.payload.param.task
    let taskSql;
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const tbl = tblCollection.subTypeTableIom
        let taskSql = `SELECT    
                            t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id FROM ${tbl} as t INNER JOIN tag ON t.tag_id = tag.id_tag WHERE t.iom_id = "${iomId}" AND t.id_exercises = "${taskId}"`
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

// DELETE

exports.deleteTask = async(req, res) => {
    // console.log(req.body.tbl)
    const {id, task} = req.body.param
    console.log(id)
    const {subTypeTableIom,report,student} = req.body.tbl
    const checkAssignedStudentSql = `SELECT COUNT(*) FROM ${student} WHERE iom_id = "${id}"`
    const checkHasReportFromStudentSql = `SELECT COUNT(*) FROM ${report} WHERE iom_id = "${id}" AND exercises_id = ${task}`;
    const deleteTaskSql = `DELETE FROM ${subTypeTableIom} WHERE iom_id = "${id}" AND id_exercises = ${task}`
    const activeObj = new DB()
    const checkAssignedStudent = await activeObj.create(checkAssignedStudentSql)
    const checkHasReportFromStudent = await activeObj.create(checkHasReportFromStudentSql)
    let deleteResult = {};

    if(!checkAssignedStudent[0]['COUNT(*)'] && !checkHasReportFromStudent[0]['COUNT(*)']) {
        deleteResult = await activeObj.create(deleteTaskSql)
    }

    if(!deleteResult.affectedRows) {
        response.status(200,{message:'Данное задание невозможно удалить, т.к. обучающийся приступил к его выполнению. Обратитесь к администратору'},res)
    }else {
        response.status(201, {message:'Задание удалено!'},res)
    }
}