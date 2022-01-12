'use strict'
const response = require('./../response')
const userId = require('./../use/getUserId')


/**
 * Добавить наставника
 * ПРОФИЛЬ АДМИН
 */
exports.addMentor = async(req, res) => {
    try {
        const {name, surname, patronymic = '', discipline} = req.body
        const insertSql = `INSERT INTO a_mentor (name, lastname, patronymic, discipline_id) VALUES ("${name}", "${surname}", "${patronymic}",${discipline} )`
        const [result] = await req.db.execute(insertSql)
        if(!result.insertId) {
            response.status(201, {message:'Ошибка при добавлении наставника. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Наставник добавлен в список'},res)
        }
    }catch (e) {

    }
}

/**
 * получить всех менторов
 * ПРОФИЛЬ АДМИН
 */
exports.getMentorData = async(req,res) => {
    try {
        const sql = `SELECT m.id, m.name, m.lastname, m.patronymic,  d.title_discipline FROM a_mentor as m
                     INNER JOIN discipline as d ON m.discipline_id = d.id_dis`
        const [sqlData] = await req.db.execute(sql)
        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

/**
 * получить всех менторов по предмету тьютора
 * ПРОФИЛЬ ТЬЮТОР
 */
exports.getMentorDataForTutor = async(req,res) => {
    try {
        const id = await userId(req.db,req.body.token)
        const tutorId = id[0]['user_id'];
        const sqlDis = `SELECT discipline_id FROM tutors WHERE user_id = "${tutorId}" LIMIT 1`

        const [disId] = await req.db.execute(sqlDis)
        console.log(disId)
        const sql = `SELECT id, name, lastname, patronymic FROM a_mentor WHERE discipline_id = ${disId[0]['discipline_id']}`
        const [sqlData] = await req.db.execute(sql)
        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}

/**
 * получить ментора по id
 * ПРОФИЛЬ АДМИН
 */
exports.getMentorById = async(req,res) => {
    try {
        const id = req.body.id
        const sql = `SELECT m.id, m.name, m.lastname, m.patronymic, d.id_dis, d.title_discipline FROM a_mentor as m
                     INNER JOIN discipline as d ON m.discipline_id = d.id_dis WHERE m.id = ${id}`
        const [sqlData] = await req.db.execute(sql)

        if(!sqlData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                sqlData,res)
            return true
        }
    }catch (e) {

    }
}

/**
 * Редактирование данных ментора по id
 * ПРОФИЛЬ АДМИН
 */
exports.editMentorData = async(req,res) => {
    try {
        const {name, lastname, patronymic = '', id, id_dis} = req.body
        const sql = `UPDATE a_mentor SET name ="${name}" , lastname = "${lastname}", patronymic="${patronymic}", 
                     discipline_id = ${id_dis} WHERE  id = ${id}`
        const [sqlData] = await req.db.execute(sql)
        if(!sqlData.affectedRows) {
            response.status(201, {message:"Возникли проблемы при внесении изменений, обратитесь к разработчикам"},res)
        }else {
            response.status(200,

                {message:"Изменения сохранены!"},res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}


/**
 * Удалить ментора по id
 * ПРОФИЛЬ АДМИН
 */
exports.deleteMentor = async(req,res) => {
    try {
        const id = req.body.id

        let sql = `DELETE FROM a_mentor WHERE id = ${id}`
        let [result] = await req.db.execute(sql)

        if(!result.affectedRows) {
            response.status(201, {message:'Ошибка при выполнении операции'},res)
        }else {
            response.status(200,
                {message: 'Ментор удалён!'},res)
            return true
        }
    }catch (e) {

    }
}