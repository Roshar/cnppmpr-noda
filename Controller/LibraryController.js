'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

/**
 * получить все элементы из локальной библиотеки
 * профиль ТЬЮТОР
 */

exports.getLibraryData  = async(req, res) => {
    try {
        const id = await userId(req.db,req.body.token)
        const tutorId = id[0]['user_id']
        let libDataSql = `SELECT
                            l.id,
                            l.tutor_id,
                            l.title,
                            l.link,
                            l.description,
                            l.tag_id,
                            tag.id_tag,
                            tag.title_tag,
                            level.title as level_title, 
                            level.id as level_id 
        FROM a_library as l 
        INNER JOIN tag ON l.tag_id = tag.id_tag
        INNER JOIN global_iom_levels as level ON l.iom_level_id = level.id WHERE l.tutor_id = "${tutorId}"`
        const [libData] = await req.db.execute(libDataSql)

        if(!libData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                libData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

// exports.getLibraryData  = async(req, res) => {
//     try {
//
//         const id = await userId(req.db,req.body.token)
//         const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
//         let libDataSql = `SELECT
//                             l.id,
//                             l.user_id,
//                             l.title,
//                             l.link,
//                             l.description,
//                             l.tag_id,
//                             tag.id_tag,
//                             tag.title_tag,
//                             level.title as level_title,
//                             level.id as level_id
//         FROM ${tblCollection.library} as l
//         INNER JOIN tag ON l.tag_id = tag.id_tag
//         INNER JOIN global_iom_levels as level ON l.iom_level_id = level.id`
//
//         const [libData] = await req.db.execute(libDataSql)
//
//         if(!libData.length) {
//             response.status(201, {},res)
//         }else {
//             response.status(200,
//                 libData,res)
//             return true
//         }
//     }catch (e) {
//         return e
//     }
// }


/**
 * добавить задание в бибилиотеку тьютора
 * ПРОФИЛЬ ТЬЮТОРА
 */

exports.addExercise = async(req, res) => {
    try {
        const id = await userId(req.db,req.body.token)
        const tutor_id = id[0]['user_id'];
        let {title, description='', link='', category, level } = req.body.values

        const sql = `INSERT INTO a_library (tutor_id, title,link, description, tag_id, iom_level_id) 
                     VALUES ("${tutor_id}","${title}","${link}","${description}",${category},${level})`
        let [result] = await req.db.execute(sql)

        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

/**
 * получить задание из библиотеки по id и tutor_id
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.getTask = async(req, res) => {
    try {

        const id = await userId(req.db,req.body.token)
        const taskId = req.body.id
        const tutorId = id[0]['user_id'];

        let taskSql = `SELECT
                            t.id,
                            t.tutor_id,
                            t.title,
                            t.link,
                            t.description,
                            tag.id_tag,
                            tag.title_tag,
                            level.title as level_title, 
                            level.id as level_id,
                            t.tag_id FROM a_library as t 
                            INNER JOIN tag ON t.tag_id = tag.id_tag
                            INNER JOIN global_iom_levels as level ON t.iom_level_id = level.id 
                            WHERE t.id = ${taskId} AND t.tutor_id = "${tutorId}"`
        let [taskData] = await req.db.execute(taskSql)

        if(!taskData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                taskData[0],res)
            return true
        }
    }catch (e) {
        console.log(e.message)
        return e
    }
}
/**
 * обновить задание по id и tutor_id
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.update = async(req, res) => {
    try {
        const idU = await userId(req.db,req.body.token)
        const tutorId = idU[0]['user_id'];
        const {id, title, description = '', link = '', level,  tag} = req.body.values

        const sql = `UPDATE  a_library SET title ="${title}" , description = "${description}", link="${link}", 
                     tag_id=${tag}, iom_level_id=${level} WHERE id="${id}" AND tutor_id = "${tutorId}"`
        let [result] = await req.db.execute(sql)
        if(!result.affectedRows) {
            response.status(400, {message:"Ошибка при обновлении"},res)
        }else {
            response.status(200,{message:"Задание успешно изменено"},res)
        }

    }catch (e) {
        console.log(e)
    }
}

/**
 * удалить задание по id и tutor_id
 * ПРОФИЛЬ ТЬЮТОРА
 */

exports.deleteTask = async(req, res) => {
    const idU = await userId(req.db,req.body.token)
    const tutor_id = idU[0]['user_id']
    const id = req.body.id
    const deleteTaskSql = `DELETE FROM a_library WHERE id = "${id}" AND tutor_id = "${tutor_id}"`
    const [deleteResult] = await req.db.execute(deleteTaskSql)

    if(!deleteResult.affectedRows) {
        response.status(201,{message:'Ошибка при удалении'},res)
    }else {
        response.status(200, {message:'Задание удалено!'},res)
    }
}