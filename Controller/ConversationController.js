'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')
const tbl = require('./../use/roleTbl')

exports.send = async(req,res) => {
    try {
        const {sendBody, token, targetUserId, link} = req.body
        const senderId = await userId(token)
        const links = (link !== '') ? link : null
        const userObj = new DB()
        let conId;
        let result2;
        const checkIssetConversation = `SELECT id FROM conversation WHERE source_user_id = "${senderId[0]['user_id']}" AND target_user_id = "${targetUserId}" `
        const check = await userObj.create(checkIssetConversation)
        if(!check.length) {
            const sql = `INSERT INTO conversation (source_user_id, target_user_id)
                    VALUES ("${senderId[0]['user_id']}", "${targetUserId}")`
            let result1 = await userObj.create(sql)
            conId = result1.insertId
        }else {
            conId = check[0]['id']
        }
        if(conId) {
            const sql = `INSERT INTO conversation_room (con_id, source_user, target_user, body, link)
                        VALUES (${conId},"${senderId[0]['user_id']}", "${targetUserId}", "${sendBody}", ${links})`
            result2 = await userObj.create(sql)
        }

        if(!result2.insertId) {
            response.status(201, {message:'Ошибка при отправке сообщения. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,
                {message:'Сообщение отправлено!'},res)
            return true
        }
    }catch (e) {

    }
}


exports.getCompanions = async(req,res) => {
    try {
        const token = req.body.token
        const senderId = await userId(token)
        const userObj = new DB()
        let tutorsData;
        let adminsData;
        let studentsData;
        let sqlStudents =
            `SELECT c.id, c.source_user_id, c.target_user_id,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update,
             s.name, s.surname, s.avatar
             FROM conversation as c
             INNER JOIN students as s
             ON c.target_user_id = s.user_id
             INNER JOIN users as u ON c.target_user_id = u.id_user
             WHERE c.source_user_id = "${senderId[0]['user_id']}" ORDER BY c.id DESC`
        studentsData = await userObj.create(sqlStudents)
        let sqTutors =
            `SELECT c.id, c.source_user_id, c.target_user_id,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             s.name, s.surname, s.avatar
             FROM conversation as c
             INNER JOIN tutors as s
             ON c.target_user_id = s.user_id WHERE c.source_user_id = "${senderId[0]['user_id']}" `
        tutorsData = await userObj.create(sqTutors)
        let sqAdmins =
            `SELECT c.id, c.source_user_id, c.target_user_id,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             s.name, s.surname, s.avatar
             FROM conversation as c
             INNER JOIN admins as s
             ON c.target_user_id = s.user_id WHERE c.source_user_id = "${senderId[0]['user_id']}" `
        adminsData = await userObj.create(sqAdmins)
        if(!studentsData.length ) {
            response.status(201, {},res)
        }else {
            response.status(200,
                {studentsData,adminsData,tutorsData},res)
            return true
        }
    }catch (e) {

    }
}


exports.getChat = async(req,res) => {
    try {
        const userObj = new DB()
        const token = req.body.token
        const addressee = req.body.user
        const senderId = await userId(token)
        const addresseeSql = `SELECT role FROM users WHERE id_user = "${addressee}"`
        const addresseeRole = await userObj.create(addresseeSql)
        const addresseeTbl = tbl(addresseeRole[0]['role'])
        const tblName = tbl(senderId[0]['role'])

        const senderSql = `SELECT avatar, name, surname, user_id FROM ${tblName} WHERE user_id ="${senderId[0]['user_id']}"`
        const addresseeSql2 = `SELECT name, surname, avatar FROM ${addresseeTbl} WHERE user_id = "${addressee}"  `

        const senderData = await userObj.create(senderSql)
        const addresseeData = await userObj.create(addresseeSql2)
        console.log(addresseeData)

        const conversationId = req.body.conId

        let chatData;
        let sqlChat =
            `SELECT c.id, c.source_user, c.target_user, c.body,
             DATE_FORMAT(c.created_date, '%Y-%m-%d %H:%i:%s') as created_date
             FROM conversation_room as c
             WHERE c.con_id = ${conversationId}`

        chatData = await userObj.create(sqlChat)

        if(!chatData.length ) {
            response.status(201, {},res)
        }else {
            response.status(200,
                {chatData,senderData,addresseeData},res)
            return true
        }
    }catch (e) {

    }
}


exports.getUsersForConversation = async(req,res) => {
    try {

    }catch (e) {

    }
}


exports.searchUser = async (req, res) => {
    try {
        const tblName = req.body.tbl
        const param = req.body.searchValue
        const userObj = new DB()
        let sqlData
        let sql
        if(param) {
            sql =  `SELECT tbl.id, tbl.user_id, tbl.name, tbl.surname, tbl.avatar,
             DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update
             FROM ${tblName} as tbl
             INNER JOIN users as u
             ON tbl.user_id = u.id_user
             WHERE u.status = 'on' AND (tbl.name LIKE "${param}%" OR tbl.surname LIKE "${param}%") LIMIT 10`
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

// создаем беседу
exports.createConversationWithoutInsert = async(req, res) => {
    try {
        const {token, targetUserId} = req.body
        const senderId = await userId(token)
        const userObj = new DB()
        let conId;
        const checkIssetConversation = `SELECT id FROM conversation WHERE source_user_id = "${senderId[0]['user_id']}" AND target_user_id = "${targetUserId}" `
        const check = await userObj.create(checkIssetConversation)
        if(!check.length) {
            const sql = `INSERT INTO conversation (source_user_id, target_user_id)
                    VALUES ("${senderId[0]['user_id']}", "${targetUserId}")`
            let result1 = await userObj.create(sql)
            conId = result1.insertId
        }else {
            conId = check[0]['id']
        }
        console.log(conId)
        if(!conId) {
            response.status(201, {message:'Ошибка при создании чата с пользователем. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,
                {},res)
            return true
        }
    }catch (e) {

    }
}