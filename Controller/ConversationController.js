'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')
const tbl = require('./../use/roleTbl')

exports.send = async(req,res) => {
    try {
        const {sendBody, token, targetUserId, link = ''} = req.body
        const senderId = await userId(req.db,token)
        const links = (link !== '') ? link : null
        let conId;

        //Проверяем наличие комнаты в таблице conversation
        const checkIssetConversation = `SELECT id FROM conversation WHERE source_user_id = "${senderId[0]['user_id']}" AND target_user_id = "${targetUserId}" `
        const [check] = await req.db.execute(checkIssetConversation)
        if(!check.length) {
            // В случае отсутствия создаем комнату и возвращаем ID комнаты
            const sql = `INSERT INTO conversation (source_user_id, target_user_id)
                    VALUES ("${senderId[0]['user_id']}", "${targetUserId}")`
            const [result1] = await req.db.execute(sql)
            conId = result1.insertId
        }else {
            //Возвращаем ID , если такая комната существует
            conId = check[0]['id']
        }

        //Добавляем сообщение в таблицу CONVERSATION_ROOM с указанимем полученного ID
        if(conId) {
            const sql = `INSERT INTO conversation_room (con_id, source_user, target_user, body, link)
                        VALUES (${conId},"${senderId[0]['user_id']}", "${targetUserId}", "${sendBody}", "${links}")`
            let [result2] = await req.db.execute(sql)
            if(!result2.insertId) {
                response.status(201, {message:'Ошибка при отправке сообщения. Обратитесь к разработчикам'},res)
            }else {
                response.status(200,
                    {message:'Сообщение отправлено!'},res)
                return true
            }
        }else {
            response.status(201, {message:'Ошибка при отправке сообщения. Обратитесь к разработчикам'},res)
        }

    }catch (e) {

    }
}


exports.getCompanions = async(req,res) => {
    try {
        console.log(req.body)
        const token = req.body.token
        const senderId = await userId(req.db,token)

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
        let [studentsData] = await req.db.execute(sqlStudents)

        let sqTutors =
            `SELECT c.id, c.source_user_id, c.target_user_id,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update,
             s.name, s.surname, s.avatar
             FROM conversation as c
             INNER JOIN tutors as s ON c.target_user_id = s.user_id
             INNER JOIN users as u ON c.target_user_id = u.id_user
             WHERE c.source_user_id = "${senderId[0]['user_id']}" `
        let [tutorsData] = await req.db.execute(sqTutors)

        let sqAdmins =
            `SELECT c.id, c.source_user_id, c.target_user_id,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update,
             s.name, s.surname, s.avatar
             FROM conversation as c
             INNER JOIN admins as s ON c.target_user_id = s.user_id
             INNER JOIN users as u ON c.target_user_id = u.id_user
             WHERE c.source_user_id = "${senderId[0]['user_id']}" `

        let [adminsData] = await req.db.execute(sqAdmins)

        const resData = [studentsData,tutorsData,adminsData]

        if(!resData.length ) {
            response.status(201, [],res)
        }else {
            response.status(200,
                resData,res)
            return true
        }
    }catch (e) {

    }
}


exports.getChat = async(req,res) => {
    try {

        const token = req.body.token
        const addressee = req.body.user
        const senderId = await userId(req.db,token)
        const addresseeSql = `SELECT role FROM users WHERE id_user = "${addressee}"`
        const [addresseeRole] = await req.db.execute(addresseeSql)
        const addresseeTbl = tbl(addresseeRole[0]['role'])
        const tblName = tbl(senderId[0]['role'])

        const senderSql = `SELECT avatar, name, surname, user_id FROM ${tblName} WHERE user_id ="${senderId[0]['user_id']}"`
        const addresseeSql2 = `SELECT t.name, t.surname, t.avatar, t.user_id, DATE_FORMAT(u.auth_update, '%d-%m-%Y %H:%i:%s') as auth_update FROM
                                ${addresseeTbl} as t 
                                INNER JOIN users as u ON t.user_id = u.id_user 
                                WHERE t.user_id = "${addressee}"`

        const [senderData] = await req.db.execute(senderSql)
        const [addresseeData] = await req.db.execute(addresseeSql2)

        const conversationId = req.body.conId

        let sqlChat =
            `SELECT c.id, c.source_user, c.target_user, c.body,
             DATE_FORMAT(c.created_date, '%d-%m-%Y %H:%i:%s') as created_date
             FROM conversation_room as c
             WHERE c.con_id = ${conversationId}`

        let [chatData] = await req.db.execute(sqlChat)

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
        let sql
        if(param) {
            sql =  `SELECT tbl.id, tbl.user_id, tbl.name, tbl.surname, tbl.avatar,
             DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update
             FROM ${tblName} as tbl
             INNER JOIN users as u
             ON tbl.user_id = u.id_user
             WHERE u.status = 'on' AND (tbl.name LIKE "${param}%" OR tbl.surname LIKE "${param}%") LIMIT 10`
            let [sqlData] =  await req.db.execute(sql)
            if(!sqlData.length) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    sqlData,res)
                return true
            }
        }else {
            response.status(201, {},res)
        }

    }catch (e) {

    }
}



// создаем беседу
exports.createConversationWithoutInsert = async(req, res) => {
    try {

        const {token, targetUserId} = req.body
        const senderId = await userId(req.db,token)

        let conId;
        const checkIssetConversation = `SELECT id FROM conversation WHERE source_user_id = "${senderId[0]['user_id']}" AND target_user_id = "${targetUserId}" `
        const [check] =  await req.db.execute(checkIssetConversation)

        if(!check.length) {
            const sql = `INSERT INTO conversation (source_user_id, target_user_id)
                    VALUES ("${senderId[0]['user_id']}", "${targetUserId}")`
            let [result1] =  await req.db.execute(sql)
            conId = result1.insertId
        }else {
            conId = check[0]['id']
        }

        if(!conId) {
            response.status(201, {message:'Ошибка при создании чата с пользователем. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,
                {conId,targetUserId},res)
            return true
        }
    }catch (e) {

    }
}