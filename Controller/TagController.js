'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getTag = async(req,res) => {
    try {

        let exerciseSql = `SELECT id_tag, title_tag,  DATE_FORMAT(created_at, '%d-%m-%Y %H:%i:%s')
                            as created_at FROM tag`
        let [exerciseData] = await req.db.execute(exerciseSql)
        if(!exerciseData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }
    }catch (e) {

    }
}

exports.getSingleTag = async(req,res) => {
    try {
        const id = req.body.id

        let tagSql = `SELECT id_tag, title_tag,  DATE_FORMAT(created_at, '%d-%m-%Y %H:%i:%s')
                            as created_at FROM tag WHERE id_tag = ${id}`
        let [tagData] = await req.db.execute(tagSql)
        if(!tagData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                tagData,res)
            return true
        }
    }catch (e) {

    }
}

exports.editTag = async(req,res) => {
    try {
        const id = req.body.id
        const title = req.body.title

        let tagSql = `UPDATE tag  SET title_tag="${title}" WHERE id_tag = ${id}`
        let [tagData] = await req.db.execute(tagSql)

        if(!tagData.affectedRows) {
            response.status(201, {message:'Ошибка при выполнении операции'},res)
        }else {
            response.status(200,
                {message: 'Операция выполнена!'},res)
            return true
        }
    }catch (e) {

    }
}

exports.addNew = async(req,res) => {
    try {
        const title = req.body.title
        let tagSql = `INSERT INTO tag (title_tag) VALUES ("${title}")`
        let [tagData] = await req.db.execute(tagSql)
        if(!tagData.insertId) {
            response.status(201, {message:'Ошибка при выполнении операции'},res)
        }else {
            response.status(200,
                {message: 'Категория создана!'},res)
            return true
        }
    }catch (e) {

    }
}

exports.deleteTag = async(req,res) => {
    try {
        const id = req.body.id

        let tagSql = `DELETE FROM tag WHERE id_tag = ${id}`
        let [tagData] = await req.db.execute(tagSql)

        if(!tagData.affectedRows) {
            response.status(201, {message:'Ошибка при выполнении операции'},res)
        }else {
            response.status(200,
                {message: 'Категория удалена!'},res)
            return true
        }
    }catch (e) {

    }
}
