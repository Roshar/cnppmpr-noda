'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')

exports.getData  = async(req, res) => {
    try {

        const sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag`

        const [sqlData] = await req.db.execute(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getDataByTutorDiscipline  = async(req, res) => {
    try {
        const token = req.body.token
        const userData = await userId(req.db,token)
        const user = userData[0]['user_id']

        const userSql = `SELECT discipline_id FROM tutors WHERE user_id = "${user}"`
        const [result1] = await req.db.execute(userSql)

        const disId = result1[0]['discipline_id']

        const sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag
                     WHERE l.discipline_id = ${disId}`

        const [sqlData] = await req.db.execute(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getDataById  = async(req, res) => {
    try {

        const itemId = req.body.id
        const sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag WHERE l.id = ${itemId}`

        const [sqlData] =  await req.db.execute(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getDataWithFilter  = async(req, res) => {
    try {
        const dis = parseInt(req.body.disId)
        const tag = parseInt(req.body.tagId)
        let sql
        if(dis && tag ) {
            sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag
                     WHERE l.discipline_id = ${dis} AND l.tag_id = ${tag}`
        }else if(dis) {
            sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag
                     WHERE l.discipline_id = ${dis}`
        }else if(tag) {
            sql = `SELECT l.id, l.title, l.description, l.link,
                     l.discipline_id, DATE_FORMAT(l.created_date, '%d.%m.%Y') as created_date,
                     l.tag_id, d.title_discipline, t.title_tag FROM global_library as l
                     INNER JOIN discipline as d  ON l.discipline_id = d.id_dis
                     INNER JOIN tag as t ON l.tag_id = t.id_tag
                     WHERE l.tag_id = ${tag}`
        }

        const [sqlData] = await req.db.execute(sql)

        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.deleteById  = async(req, res) => {
    try {
        const id = req.body.id
        let sql = `DELETE FROM global_library WHERE id = "${id}"`
        const [sqlData] = await req.db.execute(sql)
        if(!sqlData.affectedRows) {
            response.status(201, {message:'Ошибка при выполнении операции'},res)
        }else {
            response.status(200,
                {message: 'Элемент удален!'},res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.addInLibrary  = async(req, res) => {
    try {

        console.log(req.body)
        const {category, discipline, title, description,link} = req.body.payload.values
        const admin = await userId(req.db,req.body.token)
        const adminId = admin[0]['user_id']

        const insertSql = `INSERT INTO global_library (title, description, link, discipline_id, tag_id,admin_id)
                           VALUES ("${title}", "${description}", "${link}", ${discipline}, "${category}","${adminId}")`

        console.log(insertSql)

        const [result] = await req.db.execute(insertSql)
        if(!result.insertId) {
            response.status(201, {message:'Ошибка при добавлении. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Добавлено'},res)
        }
    }catch (e) {

    }
}

exports.updateInLibrary  = async(req, res) => {
    try {
        const {category, discipline, title, description='',link='', id} = req.body.payload
        const sql = `UPDATE global_library  SET title ="${title}" , description = "${description}", link="${link}", 
                        discipline_id=${discipline}, tag_id="${category}" WHERE id = ${id} `
        const [result] = await req.db.execute(sql)
        if(!result.affectedRows) {
            response.status(201, {message:'Ошибка при изменении. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Изменено'},res)
        }
    }catch (e) {

    }
}




