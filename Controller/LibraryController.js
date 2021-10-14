'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getLibraryData  = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let libDataSql = `SELECT
                            l.id,
                            l.user_id,
                            l.title,
                            l.link,
                            l.description,
                            l.tag_id,
                            tag.id_tag,
                            tag.title_tag
        FROM ${tblCollection.library} as l INNER JOIN tag ON l.tag_id = tag.id_tag`
        let libData = await userObj.create(libDataSql)
        if(!libData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                libData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.addExercise = async(req, res) => {
    try {
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let {title, description = '', link = '', tag } = req.body.values
        const activeObj = new DB()
        const sql = `INSERT INTO ${tblCollection.library} (user_id, title,link, description,tag_id) VALUES ("${id[0]['user_id']}","${title}","${description}","${link}","${tag}")`
        let result = await activeObj.create(sql)
        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

exports.getTask = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const taskId = req.body.id
        const tbl = tblCollection.library
        let taskSql = `SELECT
                            t.id,
                            t.user_id,
                            t.title,
                            t.link,
                            t.description,
                            tag.id_tag,
                            tag.title_tag,
                            t.tag_id FROM ${tbl} as t INNER JOIN tag ON t.tag_id = tag.id_tag WHERE t.id = ${taskId}`
        let taskData = await userObj.create(taskSql)
        console.log(taskData)
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

exports.update = async(req, res) => {
    try {
        const idU = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
        const {id, title, description = '', link = '',  tag} = req.body.values
        const tblName = tblCollection.library
        const activeObj = new DB()
        const sql = `UPDATE  ${tblName} SET title ="${title}" , description = "${description}", link="${link}", tag_id=${tag} WHERE id="${id}"`
        let result = await activeObj.create(sql)
        if(!result.affectedRows) {
            response.status(400, {message:"Ошибка при обновлении"},res)
        }else {
            response.status(200,{message:"Задание успешно изменено"},res)
        }

    }catch (e) {
        console.log(e)
    }
}

exports.deleteTask = async(req, res) => {
    const idU = await userId(req.body.token)
    const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
    const id = req.body.id
    const deleteTaskSql = `DELETE FROM ${tblCollection.library} WHERE id = "${id}"`
    console.log(deleteTaskSql)
    const activeObj = new DB()
    const deleteResult = await activeObj.create(deleteTaskSql)
    console.log(deleteResult)
    if(!deleteResult.affectedRows) {
        response.status(200,{message:'Ошибка при удалении'},res)
    }else {
        response.status(201, {message:'Задание удалено!'},res)
    }
}