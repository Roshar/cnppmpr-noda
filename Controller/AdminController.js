'use strict'
const response = require('./../response')

/**
 *  получить все ИОМЫ тьютора
 *  профиль АДМИН
 */

exports.getAllIomDataByTutorId = async(req,res) => {
    try {
        const tutorId = req.body.tutorId
        let tutorDataSql = `SELECT t.user_id, t.surname, t.name, t.patronymic, d.title_discipline FROM tutors as t 
                            INNER JOIN discipline as d ON t.discipline_id = d.id_dis WHERE user_id = "${tutorId}"`
        const [tutorData] = await req.db.execute(tutorDataSql)
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id, title, description FROM a_iom
                        WHERE tutor_id = "${tutorId}"`
        let exerciseCountSql = [];
        const [iomData] = await req.db.execute(iomSql)
        let countExercises = [];
        if(iomData.length) {
            for(let i = 0; i < iomData.length; i++){
                exerciseCountSql.push(`SELECT COUNT(*)  FROM a_exercise WHERE iom_id = "${iomData[i]['iom_id']}"`)
                countExercises.push((await req.db.execute(exerciseCountSql[i]))[0])
                iomData[i].countExercises = countExercises[i][0]['COUNT(*)']
            }
        }
        if(!iomData.length) {
            response.status(200, [],res)
        }else {
            response.status(200,
                [iomData,tutorData],res)
            return true
        }
    }catch (e) {
        return e
    }
}

/**
 * получить данные по ИОМ
 * профиль АДМИН
 */
exports.getDataFromIOM = async(req,res) => {
    try {
        const iomId = req.body.iomId
        const tutorId = req.body.tutorId

        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description 
                             FROM a_iom WHERE iom_id = "${iomId}" `

        const exSql = `SELECT e.id_exercises, e.iom_id, e.title, e.description, e.link, e.mentor,DATE_FORMAT(e.term, '%d-%m-%Y') as term , 
                    t.title_tag, e.tag_id FROM a_exercise as e 
                    INNER JOIN tag as t ON e.tag_id = t.id_tag WHERE e.iom_id = "${iomId}"`

        const countStudentsSql = `SELECT COUNT(id) as id FROM relationship_student_iom WHERE tutor_id = "${tutorId}" AND iom_id = "${iomId}"`

        let tutorDataSql = `SELECT t.user_id, t.surname, t.name, t.patronymic, d.title_discipline FROM tutors as t 
                            INNER JOIN discipline as d ON t.discipline_id = d.id_dis WHERE user_id = "${tutorId}"`
        const [tutorData] = await req.db.execute(tutorDataSql)

        const [iomData] = await req.db.execute(iomSql)
        const [exData] = await req.db.execute(exSql)
        const [countStudents] = await req.db.execute(countStudentsSql)

        if(!iomData.length) {
            response.status(200, [],res)
        }else {
            response.status(200,
                [iomData,tutorData,exData,countStudents],res)
            return true
        }
    }catch (e) {
        return e
    }
}


/**
 * получить задание (мероприятие)
 * профиль АДМИН
 */
exports.getTask = async(req,res) => {
    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
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
                            t.tag_id FROM a_exercise as t INNER JOIN tag ON t.tag_id = tag.id_tag
                            WHERE t.iom_id = "${iomId}" AND t.id_exercises = "${taskId}"`

        const [taskData] = await req.db.execute(taskSql)

        if(!taskData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                taskData[0],res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getUserCount = async(req,res) => {
    try {
        const tblName = req.body.tbl
        let sql = `SELECT COUNT(*) FROM ${tblName}`
        let [sqlData] = await req.db.execute(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData[0]['COUNT(*)'],res)
            return true
        }
    }catch (e) {

    }
}

exports.getLastUsers = async (req, res) => {
    try {
        const tblName = req.body.tbl
        let sql;
        if(tblName === 'students') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE  u.status IS NULL OR u.status = 'on'  ORDER by u.created_at DESC`
        }else if(tblName === 'tutors'){
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, 
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE  u.status IS NULL OR u.status = 'on'  ORDER by u.created_at DESC`
        }

        let [sqlData] = await req.db.execute(sql)

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

exports.getUsersActive = async (req, res) => {
    try {
        const tblName = req.body.tbl
        let sql
        if(tblName === 'students') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'on'`
        } else if(tblName === 'tutors') {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'on'`
        }

        let [sqlData] = await req.db.execute(sql)

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

exports.getProfile = async (req, res) => {
    try {
        const userId = req.body.userId
        const tblName = req.body.tbl
        let sql
        if (tblName === 'students') {
             sql =
                `SELECT    
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender,t.avatar, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday,TIMESTAMPDIFF(YEAR, t.birthday, CURDATE()) as age, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status, u.login, DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update, DATE_FORMAT(u.auth_update, '%d.%m.%Y в %H:%i') as last_active,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user
                WHERE u.status = 'on' AND u.id_user = "${userId}"`
        }else if(tblName === 'tutors') {
            sql =
                `SELECT    
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender,t.avatar, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday,TIMESTAMPDIFF(YEAR, t.birthday, CURDATE()) as age, t.discipline_id, 
                d.title_discipline,
                u.status, u.login, DATE_FORMAT(u.auth_update, '%Y-%m-%d %H:%i:%s') as auth_update, DATE_FORMAT(u.auth_update, '%d.%m.%Y в %H:%i') as last_active, 
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user
                WHERE u.status = 'on' AND u.id_user = "${userId}"`
        }

        let [sqlData] = await req.db.execute(sql)

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

exports.getDependenciesStudent = async (req, res) => {

    try {
        const userId = req.body.userId

        let sql =  `SELECT rts.group_id, rts.s_user_id, rts.t_user_id, t.name, t.surname, t.patronymic, t.discipline_id,
                    g.title
                    FROM relationship_tutor_student as rts
                    INNER JOIN tutors as t ON rts.t_user_id = t.user_id
                    INNER JOIN groups_ as g ON rts.group_id = g.id
                    WHERE s_user_id = "${userId}"`
        let [sqlData] = await req.db.execute(sql)

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

exports.getDependenciesTutor = async (req, res) => {
    try {
        const userId = req.body.userId
        let gender;
        let sql =  `SELECT gr.group_id, gr.tutor_id, g.title
                    FROM groups_relationship as gr 
                    INNER JOIN groups_ as g ON gr.group_id = g.id 
                    WHERE gr.tutor_id = "${userId}"`
        let [groupData] = await req.db.execute(sql)

        let sql2 = `SELECT COUNT(id) as students FROM relationship_tutor_student WHERE t_user_id = "${userId}"`
        let [countStudents] = await req.db.execute(sql2)

        if(countStudents[0]['students']) {
            let sql5 = `SELECT COUNT(s1.id) as man FROM relationship_student_iom as s1 
                        INNER JOIN students as s2 ON s1.user_id = s2.user_id WHERE s1.tutor_id = "${userId}" 
                        AND s2.gender = 'man'`

            const [dd] = await req.db.execute(sql5)
            gender = dd
        }

        let sql3 = `SELECT COUNT(id) as reports FROM relationship_student_iom WHERE tutor_id = "${userId}" AND status = 1`

        let [countReports] = await req.db.execute(sql3)

        let sql4 = `SELECT COUNT(id) as ioms FROM a_iom WHERE tutor_id = "${userId}"`
        let [iomData] = await req.db.execute(sql4)

        response.status(200,{groupData, countStudents, iomData, gender, countReports},res)
    }catch (e) {

    }
}



exports.getUsersWithBanStatus = async (req, res) => {
    try {
        const tblName = req.body.tbl
        let sql;
        if(tblName === 'students'){
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'ban'`
        }else {
            sql =
                `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, 
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE u.status = 'ban'`
        }

        let [sqlData] = await req.db.execute(sql)

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

// area gender discipline
exports.getUsersWithDisAreaGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} AND  t.gender = "${gender}" `

        let [sqlData] = await req.db.execute(sql)

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

// area
exports.getUsersWithAreaFilter = async (req, res) => {
    try {
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' `
        let [sqlData] = await req.db.execute(sql)

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

//area gender
exports.getUsersWithAreaGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND  t.gender = "${gender}" `
        let [sqlData] = await req.db.execute(sql)

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

// area discipline
exports.getUsersWithDisAreaFilter = async (req, res) => {
    try {

        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql

        sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} `
        let [sqlData] = await req.db.execute(sql)

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

//  gender
exports.getUsersWithGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const tblName = req.body.tbl
        let sql
        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.gender = "${gender}" AND u.status = 'on' `

        }else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user WHERE t.gender = "${gender}" AND u.status = 'on' `
        }
        let [sqlData] = await req.db.execute(sql)
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

// discipline
exports.getUsersWithDisFilter = async (req, res) => {
    try {

        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql

        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' `
        } else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' `
        }

        let [sqlData] = await req.db.execute(sql)

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

// discipline gender
exports.getUsersWithDisGenderFilter = async (req, res) => {
    try {
        const gender = req.body.gender
        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql

        if(tblName === 'students') {
            sql = `SELECT
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                a.title_area,
                s.school_name,
                d.title_discipline
                FROM ${tblName} as t 
                INNER JOIN area as a ON t.area_id = a.id_area
                INNER JOIN schools as s ON t.school_id = s.id_school
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' AND  t.gender = "${gender}" `
        }else if(tblName === 'tutors') {
            sql = `SELECT 
                t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y')
                as birthday, t.discipline_id,
                d.title_discipline,
                u.status,
                DATE_FORMAT(u.created_at, '%d.%m.%Y | %H:%i:%s') as created
                FROM ${tblName} as t 
                INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                INNER JOIN users as u ON t.user_id = u.id_user 
                WHERE t.discipline_id = ${disId} AND u.status = 'on' AND  t.gender = "${gender}"`
        }

        let [sqlData] = await req.db.execute(sql)

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

exports.liveSearchInput = async (req, res) => {
    try {
        const param = req.body.param
        const tblName = req.body.tbl
        let sql
        if(param) {
            sql =  `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name, 
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                    INNER JOIN users as u ON t.user_id = u.id_user 
                    WHERE u.status = 'on' AND (t.name LIKE "${param}%" OR t.surname LIKE "${param}%") LIMIT 10`

        }
        let [sqlData] = await req.db.execute(sql)
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



exports.getTutorAndCheckAtFree = async(req, res) => {
    try {
        let sql = `SELECT user_id, name, surname,patronymic, discipline_id FROM tutors WHERE user_id NOT IN (SELECT tutor_id FROM groups_relationship)`
        let [sqlData] = await req.db.execute(sql)
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

exports.liveSearchInputAndArea = async (req, res) => {
    try {
        const param = req.body.param
        const areaId = req.body.areaId
        const tblName = req.body.tbl
        let sql
        if(param) {
            sql = `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis
                    INNER JOIN users as u ON t.user_id = u.id_user  
                    WHERE t.area_id = ${areaId} AND u.status = 'on' AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
        }
        let [sqlData] = await req.db.execute(sql)
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

exports.liveSearchInputAndAreaAndDis = async (req, res) => {
    try {
        const param = req.body.param
        const areaId = req.body.areaId
        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql
        if(param) {
            sql = `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday, t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                    INNER JOIN users as u ON t.user_id = u.id_user 
                    WHERE t.area_id = ${areaId} AND u.status = 'on' AND t.discipline_id = ${disId} AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`
        }
        let [sqlData] = await req.db.execute(sql)
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

exports.liveSearchInputAndDis = async (req, res) => {
    try {
        const param = req.body.param
        const disId = req.body.disId
        const tblName = req.body.tbl
        let sql
        if(param) {
            sql =  `SELECT
                    t.user_id, t.name, t.surname, t.patronymic, t.phone, t.gender, DATE_FORMAT(t.birthday, '%d.%m.%Y') as birthday , t.discipline_id, t.school_id, t.area_id, 
                    a.title_area,
                    s.school_name,
                    d.title_discipline
                    FROM ${tblName} as t 
                    INNER JOIN area as a ON t.area_id = a.id_area
                    INNER JOIN schools as s ON t.school_id = s.id_school
                    INNER JOIN discipline as d ON t.discipline_id = d.id_dis 
                    INNER JOIN users as u ON t.user_id = u.id_user
                    WHERE t.discipline_id = ${disId} AND u.status = 'on' AND (t.surname LIKE "${param}%" OR t.name LIKE "${param}%") LIMIT 10`

        }
        let [sqlData] = await req.db.execute(sql)
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

exports.getOptionFromStudents = async(req,res) => {
    try {

        const column = req.body.column
        const tbl = req.body.table
        const value = req.body.value?.val
        const parameter = req.body.value.parameter
        let optionSql
        if(parameter == 'age'){
            optionSql = `SELECT COUNT(id) as 'COUNT(${column})' FROM students 
                         WHERE TIMESTAMPDIFF(YEAR, birthday, CURDATE())  >= ${value.start} 
                         AND TIMESTAMPDIFF(YEAR, birthday, CURDATE())  < ${value.end}`
        }else if(parameter == 'number') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = ${value}`;
        }else if(parameter == 'string') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = "${value}"`
        }else if(parameter == 'none') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl}`
        }

        let [optionData] = await req.db.execute(optionSql)
        if(!optionData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                optionData[0][`COUNT(${column})`],res)
            return true
        }
    }catch (e) {

    }
}


/**
 * получить по группа кол-во слушателей по районам
 * ПРОФИЛЬ АДМИН
 */
exports.getAreasStatisticsByStudent = async(req,res) => {
    try {

        const sql = `SELECT s.area_id,a.title_area, COUNT(s.id) AS area FROM students as s
                     INNER JOIN area as a ON s.area_id = a.id_area
                     GROUP BY s.area_id`
        let [optionData] = await req.db.execute(sql)
        if(!optionData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                optionData,res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}

/**
 * получить группами кол-во слушателей по предметно
 * ПРОФИЛЬ АДМИН
 */
exports.getDisciplineStatisticsByStudentOrTutor = async(req,res) => {
    try {
        const tbl = req.body.tbl
        const sql = `SELECT s.discipline_id,d.title_discipline, COUNT(s.id) AS dis FROM ${tbl} as s
                     INNER JOIN discipline as d ON s.discipline_id = d.id_dis
                     GROUP BY s.discipline_id`
        let [optionData] = await req.db.execute(sql)
        if(!optionData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                optionData,res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}


/**
 *  получить кол-во слушателей зпрошедних обучение в текущем(указанном году)
 *  профиль АДМИНА
 */
exports.getFinishedStudentsByYear = async(req,res) => {
    try {
        const year = req.body.year
        const sql = `SELECT COUNT(id) as id FROM global_history_education_rows WHERE YEAR(created_at) = ${year}`
        let [optionData] = await req.db.execute(sql)
        if(!optionData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                optionData,res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}

/**
 * получить статистку ИОМов по предметам
 */
exports.getIomStatistic = async(req,res) => {
    try {
        const sql = `SELECT iom.discipline_id,d.title_discipline, COUNT(iom.id) AS dis FROM a_iom as iom
                     INNER JOIN discipline as d ON iom.discipline_id = d.id_dis
                     GROUP BY iom.discipline_id`
        let [optionData] = await req.db.execute(sql)
        if(!optionData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                optionData,res)
            return true
        }
    }catch (e) {
        console.log(e.message)
    }
}

/**
 * Удалить ИОМ
 * профиль АДМИН
 */

exports.deleteIom = async(req,res) => {
    try {
        const iomId = req.body.iomId

        const tutorId = req.body.userId
        // удалить запрос от тьютора на удаление ИОМа
        let sql1 = `DELETE FROM permission_to_delete_iom WHERE iom_id = "${iomId}" AND tutor_id = "${tutorId}" `
        // удалить ИОМ
        let sql2 = `DELETE FROM a_iom WHERE iom_id = "${iomId}"`
        // удалить все задания (мероприятия) удаляемого ИОМа
        let sql3 = `DELETE FROM a_exercise WHERE iom_id = "${iomId}"`

        let [sqlData1] = await req.db.execute(sql1)
        let [sqlData2] = await req.db.execute(sql2)
                         await req.db.execute(sql3)


        if(!sqlData1.affectedRows && !sqlData2.affectedRows) {
            response.status(201,{message:'Данный ИОМ невозможно удалить. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'ИОМ удален!'},res)
        }
    }catch (e) {

    }
}

exports.activationById = async(req,res) => {
    try {
        const userId = req.body.userId

        const sql  = 'UPDATE `users` SET `status`= "on" WHERE `id_user` = "' + userId +'"';
        const sqlSession  = 'UPDATE `authorization` SET `status`= "on" WHERE `user_id` = "' + userId +'"';
        let [sqlData1] = await req.db.execute(sql)
        await req.db.execute(sqlSession)


        if(!sqlData1.affectedRows) {
            response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'Пользователь активирован'},res)
        }
    }catch (e) {

    }
}

exports.deactivationById = async(req,res) => {
    try {
        const userId = req.body.userId
        const sqlUser  = 'UPDATE `users` SET `status`= "ban" WHERE `id_user` = "' + userId +'"';
        const sqlSession  = 'UPDATE `authorization` SET `status`= "ban" WHERE `user_id` = "' + userId +'"';
        let [sqlData1] = await req.db.execute(sqlUser)
        await req.db.execute(sqlSession)

        if(!sqlData1.affectedRows ) {
            response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
        }else {
            response.status(200, {message:'Пользователь деактивирован'},res)
        }
    }catch (e) {

    }
}

exports.createGroup = async(req, res) => {
    try {
        const tutorId = req.body.tutor
        const title = req.body.title
        const description = req.body.description
        const insertSqlG = `INSERT INTO groups_ (title, description) VALUES ("${title}", "${description}")`
        let insertSqlGR;

        const [result] = await req.db.execute(insertSqlG)

        if(result.insertId) {
            insertSqlGR = `INSERT INTO groups_relationship (group_id, tutor_id) VALUES (${result.insertId}, "${tutorId}")`
            let [result2] = await req.db.execute(insertSqlGR)
            if(!result2.insertId) {
                response.status(201, {message:'Ошибка при создании группы. Обратитесь к разработчикам'},res)
            }else {
                response.status(200,{message:'Учебная группа создана'},res)
            }
        }else {
            response.status(201, {message:'Ошибка при создании группы. Обратитесь к разработчикам'},res)
        }

    }catch (e) {

    }
}


exports.deleteGroup = async(req, res) => {
    try {
        const id = req.body.id
        const sql = `SELECT COUNT(id) as id FROM relationship_tutor_student WHERE group_id = ${id}`
        const [result] = await req.db.execute(sql)
        if(!result[0].id) {
            const sql2 = `DELETE FROM groups_ WHERE id = ${id}`
            const [result2] = await req.db.execute(sql2)
            const sql3 = `DELETE FROM groups_relationship WHERE group_id = ${id}`
            await req.db.execute(sql3)
            if(!result2.affectedRows) {
                response.status(201, {message:'Ошибка при выполнении операции. '},res)
            }else {
                response.status(200,{message:'Группа удалена'},res)
            }
        }else {
            response.status(201, {message:'И всё-таки мы склонны думать, что Вы поспешили. Поговорите с разработчиками  '},res)
        }

    }catch (e) {

    }
}

exports.deleteInGroup = async(req, res) => {
    try {
        const user = req.body.user
        const groupId = req.body.groupId
        const sql1 = `SELECT COUNT(id) as id FROM relationship_student_iom WHERE user_id = "${user}"`
        const [result1] = await req.db.execute(sql1)
        if(!result1[0].id){
            const sql = `DELETE FROM relationship_tutor_student WHERE s_user_id = "${user}" AND group_id = ${groupId}`
            const [result] = await req.db.execute(sql)
            if(!result.affectedRows) {
                response.status(201, {message:'Ошибка при выполнении операции. '},res)
            }else {
                response.status(200, {message:'Пользователь удален из группы'},res)
            }
        }else {
            response.status(201, {message:'Пользователя нельзя удалить из группы. Пользователю назначен ИОМ '},res)
        }
    }catch (e) {

    }
}

/**
 *  в РАЗДЕЛЕ "УЧЕБНЫЕ ГРУППЫ"
 *  Добавить в группу (к тьютору) слушателя
 *  ПРОФИЛЬ АДМИН
 */
exports.addUserInGroupAndTutor = async(req, res) => {
    try {
        const tutorId = req.body.tutor
        const studentId = req.body.student
        const groupId = req.body.group
        const insertSql = `INSERT INTO relationship_tutor_student (s_user_id, t_user_id, group_id) VALUES ("${studentId}", "${tutorId}", ${groupId} )`
        const [result] = await req.db.execute(insertSql)
        if(!result.insertId) {
            response.status(201, {message:'Ошибка при добавлении в  группу. Обратитесь к разработчикам'},res)
        }else {
            response.status(200,{message:'Пользователь добавлен в текущую группу'},res)
        }
    }catch (e) {

    }
}

exports.getGroups = async(req,res) => {
    try {
        let sql = `SELECT g.id, g.title, g.description, DATE_FORMAT(g.created_at, '%d.%m.%Y %H:%i') as created_at, gr.tutor_id, t.name, t.surname, t.patronymic, d.title_discipline
                   FROM groups_ as g 
                   INNER JOIN groups_relationship as gr ON g.id = gr.group_id
                   INNER JOIN tutors as t ON gr.tutor_id = t.user_id
                   INNER JOIN discipline as d ON t.discipline_id = d.id_dis`
        const [sqlData] = await req.db.execute(sql)
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

exports.getGroupById =  async(req,res) => {
    try {
        const groupId = req.body.groupId
        let sql = `SELECT g.id, g.title, g.description, DATE_FORMAT(g.created_at, '%d.%m.%Y %H:%i') as created_at, gr.tutor_id, t.name, t.surname, t.patronymic, d.title_discipline, d.id_dis
                   FROM groups_ as g 
                   INNER JOIN groups_relationship as gr ON g.id = gr.group_id
                   INNER JOIN tutors as t ON gr.tutor_id = t.user_id
                   INNER JOIN discipline as d ON t.discipline_id = d.id_dis WHERE g.id = ${groupId}`
        const [sqlData] = await req.db.execute(sql)
        if (!sqlData.length) {
            response.status(201, {}, res)
        } else {
            response.status(200,
                sqlData[0], res)
            return true
        }
    } catch (e) {

    }
}

/**
 *  Выборка слушателей которые добавлены к тьютору (в группу тьютора)
 *  с выявлением тех, кто заврешил обучение
 */
exports.getAppointedStudentsCurrentGroup = async(req, res) => {
    try {
        const tutorId = req.body.tutorId
        const groupId = req.body.groupId
        let sql = `SELECT rts.s_user_id, rts.t_user_id, s.user_id, s.name, s.surname,s.patronymic, a.title_area, sch.school_name,
        s.gender, rsi.status, rsi.iom_id, rts.isset_iom  FROM relationship_tutor_student as rts 
        INNER JOIN students as s ON rts.s_user_id = s.user_id
        LEFT OUTER JOIN relationship_student_iom as rsi ON rts.s_user_id = rsi.user_id
        INNER JOIN area as a ON s.area_id = a.id_area
        INNER JOIN schools as sch ON s.school_id = sch.id_school
        WHERE rts.t_user_id = "${tutorId}"`
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
 * получить информацию  по ИОМ (текущий ИОМ, назначенный слушателю и который он проходит в настоящее время)
 *  раздел "профиль студента"
 * профиль АДМИН
 */
exports.getIomByStudentAndTutor = async(req, res) => {
    try {
        const studentId = req.body.student
        const sql = `SELECT rsi.iom_id,rsi.status, iom.iom_id, iom.title FROM relationship_student_iom as rsi
                     INNER JOIN a_iom as iom  ON rsi.iom_id = iom.iom_id
                     WHERE rsi.user_id = "${studentId}" AND rsi.status = 0`;
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
 *  получить задания (количество) по id ИОМ
 *  личный профиль слушателя
 *  ПРОФИЛЬ АДМИН
 */

exports.getExercisesByIomId = async(req, res) => {
    try {
        const iomId = req.body.payload.iomId
        let exerciseSql = `SELECT id_exercises FROM a_exercise WHERE iom_id = "${iomId}"`
        const [exerciseData] = await req.db.execute(exerciseSql)

        if(!exerciseData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }
    }catch (e) {
        return e
    }
}


/**
 *  получить задания (количество) завершенные по id ИОМ
 *  личный профиль слушателя
 *  ПРОФИЛЬ АДМИН
 */

exports.getStatusFinished = async(req, res) => {
    try {
        const {studentId, iomId} = req.body
        let exerciseSql = `SELECT id FROM a_report  
                           WHERE iom_id = "${iomId}" 
                           AND student_id = "${studentId}" 
                           AND accepted = 1`
        const [exerciseData] = await req.db.execute(exerciseSql)
        if(!exerciseData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

// exports.getStatusFinished = async(req, res) => {
//     try {
//         const {tutorId, studentId, iomId} = req.body
//         const tblCollection = tblMethod.tbleCollection(tutorId)
//         let exerciseSql = `SELECT
//                             t.id_exercises,
//                             t.iom_id,
//                             t.title,
//                             t.description,
//                             t.link,
//                             t.mentor,
//                             tag.id_tag,
//                             tag.title_tag,
//                             DATE_FORMAT(t.term, '%d.%m.%Y') as term,
//                             t.tag_id
//         FROM ${tblCollection.report} as report
//         INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises
//         INNER JOIN tag ON t.tag_id = tag.id_tag
//         WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND accepted = 1`
//         const [exerciseData] = await req.db.execute(exerciseSql)
//         if(!exerciseData.length) {
//             response.status(201, {},res)
//         }else {
//             response.status(200,
//                 exerciseData,res)
//             return true
//         }
//     }catch (e) {
//         return e
//     }
// }

// exports.getStatusToPendingFinish = async(req, res) => {
//     try {
//         const {tutorId, studentId, iomId} = req.body
//         const tblCollection = tblMethod.tbleCollection(tutorId)
//         let exerciseSql = `SELECT
//                             t.id_exercises,
//                             t.iom_id,
//                             t.title,
//                             t.description,
//                             t.link,
//                             t.mentor,
//                             tag.id_tag,
//                             tag.title_tag,
//                             DATE_FORMAT(t.term, '%d.%m.%Y') as term,
//                             t.tag_id
//         FROM ${tblCollection.report} as report
//         INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises
//         INNER JOIN tag ON t.tag_id = tag.id_tag
//         WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND accepted = 0`
//         const [exerciseData] = await req.db.execute(exerciseSql)
//         if(!exerciseData.length) {
//             response.status(201, {},res)
//         }else {
//             response.status(200,
//                 exerciseData,res)
//             return true
//         }
//     }catch (e) {
//         return e
//     }
// }

/**
 * получить количество заданий находящихся на проверке
 * личный профиль слушателя
 * ПРОФИЛЬ АДМИНА
 */
exports.getStatusToPendingFinish = async(req, res) => {
    try {
        const {studentId, iomId} = req.body
        let exerciseSql = `SELECT id FROM a_report as report  
        WHERE iom_id = "${iomId}" AND student_id = "${studentId}" AND on_check = 1`
        const [exerciseData] = await req.db.execute(exerciseSql)
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



/**
 * Выборка слушателей по id (дисциплина) для зачисления в группу тьютора
 */

exports.getFreeStudentsByDisciplineId = async(req, res) => {
    try {

        const disciplineId = req.body.disId
        const areaId = req.body.areaId ? req.body.areaId : ''
        const gender = req.body.gender ? req.body.gender : ''
        let sql;
        if(areaId && gender == '0') {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.area_id = ${areaId}`
        }else if(areaId == '0' && gender) {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.gender = "${gender}"`
        }else if(areaId && gender) {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}
            AND s.gender = "${gender}"
            AND s.area_id = ${areaId}`
        }
        else {
            sql = `SELECT s.user_id, s.name, s.surname,s.patronymic, s.area_id, a.title_area, sch.school_name,
            s.gender FROM students as s 
            INNER JOIN area as a ON s.area_id = a.id_area
            INNER JOIN schools as sch ON s.school_id = sch.id_school
            WHERE s.user_id NOT IN (SELECT s_user_id FROM relationship_tutor_student) 
            AND s.discipline_id = ${disciplineId}`
        }
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
 * получить информацию о пройденных ИОМ
 * личный профиль студента
 * ПРОФИЛЬ АДМИН | ПРОФИЛЬ ТЬЮТОР
 */
exports.getHistoryInfoIOM = async(req, res) => {
    try {
        const studentId = req.body.userId
        // соединяем две таблицы для получения названия пройденных ИОМов
        const sql = `SELECT DISTINCT t1.iom_id, DATE_FORMAT(t1.created_at, '%d-%m-%Y') as dt,
                     t2.iom_title,tutor.name,tutor.surname, 
                     tutor.patronymic, tutor.user_id as tutor_id
                     FROM global_history_education_rows as t1
                     INNER JOIN global_history_reports as t2 
                     ON t1.iom_id = t2.iom_id AND t2.student_id  = "${studentId}"
                     LEFT OUTER JOIN tutors as tutor ON t1.tutor_id = tutor.user_id
                     WHERE t1.student_id = "${studentId}"`
        const [result] = await req.db.execute(sql)
        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {
        return e
    }
}







