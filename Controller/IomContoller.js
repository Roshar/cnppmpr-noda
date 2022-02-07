'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const userId = require('./../use/getUserId')
const fs = require ('fs');

/**
 *  проверка на существование ИОМа по id
 */
exports.issetIomId = async(req, res) => {
    try {
        let iomSql = `SELECT id FROM a_iom WHERE iom_id = "${req.body.payload.id}"`
        const [result] = await req.db.execute(iomSql)

        if(!result) {
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




/////////////////////////////

/**
 * получить все ИОМЫ для тьютора
 * ПРОФИЛЬ ТЬЮТОР
 */

exports.getData = async(req, res) => {
    try {
        const id = await userId(req.db,req.body.token)
        const tutorId = id[0]['user_id'];
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM 
                      a_iom WHERE tutor_id = "${tutorId}"`
        let exerciseCountSql = [];
        const [iomData] = await req.db.execute(iomSql)
        let countExercises = [];
        let countMembers = [];
        let countMembersSql = [];

        if(iomData.length) {
            for(let i = 0; i < iomData.length; i++){
                exerciseCountSql.push(`SELECT COUNT(*)  FROM a_exercise WHERE iom_id = "${iomData[i]['iom_id']}"`)
                countMembersSql.push(`SELECT COUNT(*) as members FROM relationship_student_iom 
                                        WHERE iom_id = "${iomData[i]['iom_id']}" 
                                        AND tutor_id = "${tutorId}"`)
                countMembers.push((await req.db.execute(countMembersSql[i]))[0])
                countExercises.push((await req.db.execute(exerciseCountSql[i]))[0])
                iomData[i].countExercises = countExercises[i][0]['COUNT(*)']
                iomData[i]['countMembers'] = countMembers[i][0]['members']
            }
        }


        if(!iomData.length) {
            response.status(200, [],res)
        }else {
            response.status(200,
                iomData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

/**
 * Получить все задания по id ИОМа
 *  ПРОФИЛЬ ТЬЮТОР
 */
exports.getDataById = async(req, res) => {
    try {
        const iomId = req.body.id
        const id = await userId(req.db,req.body.token)
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description 
                      FROM a_iom WHERE iom_id = "${iomId}" `
        const [iomData] = await req.db.execute(iomSql)

        if(!iomData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                iomData,res)
            return true
        }
    }catch (e) {
        return e
    }
}


/**
 *  Добавить новый ИОМ
 *  профиль ТЬЮТОРА
 */

exports.addNewIom = async(req, res) => {
    try {
        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || ''
        const id = await userId(req.db, req.body.token)
        const tutorId = id[0]['user_id']
        const sqlDiscipline = `SELECT discipline_id FROM tutors WHERE user_id = "${tutorId}" LIMIT 1`

        const [dis_id] = await req.db.execute(sqlDiscipline)

        if(tutorId && dis_id) {
            const iomSql = `INSERT INTO a_iom (iom_id, tutor_id, title, description, discipline_id) 
                        VALUES ("${iomId}","${tutorId}","${titleIom}","${description}",${dis_id[0]['discipline_id']})`
            const [result] = await req.db.execute(iomSql)

            if(!result) {
                response.status(400,{message:'Ошибка при создании ИОМа'},res)
            }else {
                response.status(200,
                    {message: 'Индвидуальный образовательный маршрут создан', iomId: iomId },res)
                return true
            }
        }else {
            response.status(400,{message:'Ошибка при создании ИОМа'},res)
        }



    }catch (e) {
        return e
    }
}

/**
 * добавить задание(мероприятие) в ИОМ
 * профиль ТЬЮТОР
 */
exports.addExercise = async(req, res) => {
    try {
        let {title, description = '', link = '', author = 0, tag, term, level, iomId, token } = req.body
        term = term ? term : '1000-01-01'
        const tutor = await userId(req.db,token)
        const tutor_id = tutor[0]['user_id']
        const sql = `INSERT INTO a_exercise (iom_id, title, description, link, mentor, term, tag_id, iom_level_id, created_at, tutor_id) 
                     VALUES ("${iomId}","${title}","${description}","${link}",${author},"${term}","${tag}",${level},now(),"${tutor_id}" )`
        let [result] = await req.db.execute(sql)
        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

// exports.addExercise = async(req, res) => {
//     try {
//         let {title, description = '', link = '', mentor=0, tag, term, level } = req.body.values
//         term = term ? term : '1000-01-01'
//         const tblName = req.body.tbl
//         const iom_id = req.body.values.iomId
//
//         const sql = `INSERT INTO ${tblName} (iom_id, title, description, link, mentor, term, tag_id, iom_level_id) VALUES ("${iom_id}","${title}","${description}","${link}",${mentor},"${term}","${tag}",${level})`
//         let [result] = await req.db.execute(sql)
//         if(!result.insertId) {
//             response.status(400, {message:"Ошибка при добавлении элемента"},res)
//         }else {
//             response.status(200,{message:"Задание успешно добавлено", result},res)
//         }
//     }catch (e) {
//
//     }
// }
/**
 * добавить  задание из локальной библиотеки в ИОМ
 * профиль ТЬЮТОР
 */
exports.addExerciseFromLib = async(req, res) => {
    try {
        const idU = await userId(req.db,req.body.token)
        const tutorId = idU[0]['user_id']
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const getFromLibByIdSql = `SELECT * FROM a_library WHERE id = ${id}`

        const [libData] = await req.db.execute(getFromLibByIdSql)

        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO a_exercise (iom_id, title, description, link, mentor, term, tag_id, iom_level_id, created_at, tutor_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}",
                                    "${libData[0]['tag_id']}",${libData[0]['iom_level_id']}, now(), "${tutorId}")`
        const [result] = await req.db.execute(insertLibDataInIom)

        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

/**
 * добавить  задание из глобальной (админской) библиотеки в ИОМ
 * профиль ТЬЮТОР
 */

exports.addExerciseFromLibGlobal = async(req, res) => {
    try {
        const idU = await userId(req.db,req.body.token)
        const tutorId = idU[0]['user_id']
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const getFromLibGlobalByIdSql = `SELECT * FROM global_library WHERE id = ${id}`
        const [libData] = await req.db.execute(getFromLibGlobalByIdSql)

        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO a_exercise (iom_id, title, description, link, mentor, term, tag_id, iom_level_id, created_at, tutor_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}",
                                    ${libData[0]['tag_id']},
                                    ${libData[0]['iom_level_id']}, now(), "${tutorId}" )`
        const [result] = await req.db.execute(insertLibDataInIom)


        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}


/**
 * получить все задания из ИОМ
 * профиль ТЬЮТОРА
 */
exports.getExercises = async(req, res) => {
    try {
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
                            t.tag_id,
                            level.title as level_title, 
                            level.id as level_id 
        FROM a_exercise as t 
        INNER JOIN tag ON t.tag_id = tag.id_tag
        INNER JOIN global_iom_levels as level ON t.iom_level_id = level.id  
        WHERE t.iom_id = "${req.body.payload.id}" ORDER BY tag.id_tag ASC`
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
 * получить кол-во завершенных заданий(мероприятий)
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.getStatusFinished = async(req, res) => {
    try {
        const {studentId, iomId} = req.body
        let exerciseSql = `SELECT id FROM a_report  WHERE iom_id = "${iomId}" AND student_id = "${studentId}" AND accepted = 1`
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

// exports.getStatusFinished = async(req, res) => {
//     try {
//
//         const {studentId, iomId} = req.body
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
//         FROM a_report as report
//         INNER JOIN a_exercise as t ON report.exercises_id = t.id_exercises
//         INNER JOIN tag ON t.tag_id = tag.id_tag
//         WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND report.accepted = 1`
//         const [exerciseData] = await req.db.execute(exerciseSql)
//
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
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.getStatusToPendingFinish = async(req, res) => {
    try {
        const {studentId, iomId} = req.body
        let exerciseSql = `SELECT id FROM a_report  WHERE iom_id = "${iomId}" AND student_id = "${studentId}" AND on_check = 1`
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

// exports.getStatusToPendingFinish = async(req, res) => {
//     try {
//         const {token, studentId, iomId} = req.body
//         const id = await userId(req.db,token)
//         const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
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
//         WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND report.accepted = 0`
//         const [exerciseData] = await req.db.execute(exerciseSql)
//
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
 * получить задания в режимах:
 *  - завершенные
 *  - в ожидании
 *  status параметр имеет указание на проверке или завершенные 0 или 1
 *  (по умолчанию в таблицу a_report - попадает запись в случае, если слушатель отправил ответ,
 *  соответственно, если нет 1 значит на проверке)
 *  ПРОФИЛЬ ТЬЮТОРА
 */
exports.getPendingDataOrFinished = async(req, res) => {
    try {
        const {status,iomId} = req.body
        let exerciseSql;
        if(!iomId) {
            exerciseSql = `SELECT 
                            t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            iom.title as iom_title,
                            s.name,
                            s.surname,
                            s.patronymic,
                            s.user_id,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id,
                            report.accepted
            FROM a_report as report  
            INNER JOIN a_exercise as t ON report.exercises_id = t.id_exercises 
            INNER JOIN a_iom as iom ON t.iom_id = iom.iom_id 
            INNER JOIN students as s ON report.student_id = s.user_id 
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.accepted = ${status}`
        }else {
            exerciseSql = `SELECT 
                            t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            iom.title as iom_title,
                            s.name,
                            s.surname,
                            s.patronymic,
                            s.user_id,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id,
                            report.accepted
            FROM a_report as report  
            INNER JOIN a_exercise as t ON report.exercises_id = t.id_exercises 
            INNER JOIN a_iom as iom ON t.iom_id = iom.iom_id 
            INNER JOIN students as s ON report.student_id = s.user_id 
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.accepted = ${status} AND report.iom_id = "${iomId}"`
        }

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
 * получить задания в режимах (по id ИОМа):
 *  - завершенные
 *  - в ожидании
 *  status параметр имеет указание на проверке или завершенные 0 или 1
 *  (по умолчанию в таблицу a_report - попадает запись в случае, если слушатель отправил ответ,
 *  соответственно, если нет 1 значит на проверке)
 *  ПРОФИЛЬ ТЬЮТОРА
 */
exports.getPendingDataOrFinishedByIomId = async(req, res) => {
    try {
        const {status,iomId, student} = req.body
        let exerciseSql;

        if(!student) {
            exerciseSql = `SELECT 
                        t.id_exercises,
                        t.iom_id, 
                        t.title,
                        t.description,
                        t.link,
                        t.mentor,
                        tag.id_tag,
                        tag.title_tag,
                        iom.title as iom_title,
                        s.name,
                        s.surname,
                        s.patronymic,
                        s.user_id,
                        DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                        t.tag_id,
                        report.accepted
            FROM a_report as report  
            INNER JOIN a_exercise as t ON report.exercises_id = t.id_exercises 
            INNER JOIN a_iom as iom ON t.iom_id = iom.iom_id 
            INNER JOIN students as s ON report.student_id = s.user_id 
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.accepted = ${status} AND report.iom_id = "${iomId}"`
        }else {

            exerciseSql = `SELECT 
                        t.id_exercises,
                        t.iom_id, 
                        t.title,
                        t.description,
                        t.link,
                        t.mentor,
                        tag.id_tag,
                        tag.title_tag,
                        iom.title as iom_title,
                        s.name,
                        s.surname,
                        s.patronymic,
                        s.user_id,
                        DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                        t.tag_id,
                        report.accepted
            FROM a_report as report  
            INNER JOIN a_exercise as t ON report.exercises_id = t.id_exercises 
            INNER JOIN a_iom as iom ON t.iom_id = iom.iom_id 
            INNER JOIN students as s ON report.student_id = s.user_id 
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.accepted = ${status} AND report.iom_id = "${iomId}" AND student_id = "${student}"`
        }
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
 * ПРОСМОТР ОТВЕТА в разделе выполненнные задания
 *  - получить сам содержание ответа
 *  - получить само задание
 *  - получить комментарии (обсуждение) текущего вопроса(задания) в ИОМе
 *  ПРОФИЛЬ ТЬЮТОР
 */

exports.getStudentAnswer = async(req, res) => {
    try {
        const {iomId, exId, studentId} = req.body
        const sql = `SELECT
                            t.id_exercises,
                            t.iom_id,
                            t.title as ex_title,
                            t.description as ex_description,
                            t.link as ex_link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            iom.title as iom_title,
                            s.name,
                            s.surname,
                            s.patronymic,
                            s.user_id,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as ex_term,
                            DATE_FORMAT(report.created_at, '%d.%m.%Y') as answer_created,
                            t.tag_id,
                            report.accepted,
                            report.tutor_comment,
                            report.content as answer_content,
                            report.link as answer_link
            FROM a_report as report
            INNER JOIN  a_exercise as t ON report.exercises_id = t.id_exercises
            INNER JOIN a_iom as iom ON t.iom_id = iom.iom_id
            INNER JOIN students as s ON report.student_id = s.user_id
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.student_id = "${studentId}" 
            AND report.iom_id = "${iomId}" 
            AND report.exercises_id = ${exId}`

        const [taskData] = await req.db.execute(sql)


        if(!taskData.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                taskData,res)
            return true
        }
    }catch (e) {
        return e
    }
}

/**
 *  обновить статус "на проверке" на "завершен" в  таблице a_report
 *  добавить данные заврешенного задания в глобальную таблицу global_history_reports для сохранности первоначального вида
 *  у выполненного задания, на случай если тьютор в дальнейшем поменяет содержимое ИОМа
 *  ПРОФИЛЬ ТЬЮТОРА
 */
exports.successTask = async(req, res) => {
    try {
        const {token, iomId, exId, studentId} = req.body
        const id = await userId(req.db,token)
        const tutorId = id[0]['user_id']

        const sql = `UPDATE  a_report SET accepted = 1, on_check = 0, tutor_comment = '' WHERE iom_id="${iomId}" AND exercises_id = ${exId} 
                     AND student_id = "${studentId}"`

        const sql2 = `SELECT iom.title as iom_title, ex.iom_id, ex.title as ex_title,  ex.description as ex_description, 
                             ex.link as ex_link, ex.mentor, DATE_FORMAT(ex.term, '%Y-%m-%d') as term, 
                             ex.iom_level_id, ex.tag_id, answer.content as an_content, answer.link as an_link,answer.file_path 
                             FROM a_report as answer
                             INNER JOIN a_exercise as ex ON answer.iom_id = ex.iom_id
                             AND answer.exercises_id = ex.id_exercises 
                             INNER JOIN a_iom as iom ON answer.iom_id = iom.iom_id
                             WHERE answer.student_id = "${studentId}" 
                             AND answer.iom_id = "${iomId}" 
                             AND answer.exercises_id = ${exId}`

        const [result2] = await req.db.execute(sql2)
        const [result] = await req.db.execute(sql)


        if(result2 && result2.length) {
            let r = result2[0]
            const sql3 = `INSERT INTO global_history_reports 
                                     (iom_title,iom_id,exercise_title,exercise_description,
                                     exercise_link,mentor_id,term,tag_id,iom_level_id,
                                     tutor_id,student_id,answer_text,answer_link,file_path) 
                                     VALUES ("${r['iom_title']}","${r['iom_id']}","${r['ex_title']}",
                                             "${r['ex_description']}","${r['ex_link']}",${r['mentor']},
                                             "${r['term']}", ${r['tag_id']}, ${r['iom_level_id']},"${tutorId}",
                                             "${studentId}","${r['an_content']}","${r['an_link']}","${r['file_path']}")`
            const [result3] = await req.db.execute(sql3)

            if(result3.insertId && !result.affectedRows) {
                response.status(201, {message:"Ошибка при одобрении. Обратитесь к разработчикам"},res)
            }else {
                response.status(200,{message:"Ответ слушателя принят"},res)
            }

        }else {
            response.status(201, {message:"Ошибка при одобрении. Обратиетсь к разработчикам"},res)
        }

    }catch (e) {
        console.log(e)
    }
}


/**
 * отправить на исправление ответ
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.correctionTask = async(req, res) => {
    try {
        const { iomId, exId, studentId, comment} = req.body

        const sql = `UPDATE  a_report SET accepted = 2, tutor_comment = "${comment}", on_check = 0   
                     WHERE iom_id="${iomId}" AND exercises_id = ${exId} AND student_id = "${studentId}"`

        const [result] = await req.db.execute(sql)

        if(!result.affectedRows) {
            response.status(201, {message:"Ошибка при выполнении операции. Обратиетсь к разработчикам"},res)
        }else {
            response.status(200,{message:"Ответ отправлен на доработку"},res)
        }

    }catch (e) {
        console.log(e)
    }
}

/**
 * получить задание(мероприятие) по id
 * профиль ТЬЮТОР
 */

exports.getTask = async(req, res) => {
    try {
        const iomId = req.body.payload.param.id
        const taskId = req.body.payload.param.task
        let taskSql = `SELECT    
                            t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            m.name,
                            m.lastname,
                            m.patronymic,
                            m.id as mentor_id,
                            tag.id_tag,
                            tag.title_tag,
                            level.title as level_title, level.id as level_id,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id FROM a_exercise as t 
                            INNER JOIN tag ON t.tag_id = tag.id_tag 
                            INNER JOIN global_iom_levels as level ON t.iom_level_id = level.id
                            LEFT OUTER JOIN a_mentor as m ON t.mentor = m.id
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

/**
 * изменить содержимое задания
 *  профиль ТЬЮТОР
 */
exports.updateExercise = async(req, res) => {
    try {
        const {id_exercise, title, description = '', link = '', mentor = 0, tag, level} = req.body.values
        const term = req.body.values.term ? req.body.values.term : '1000-01-01'
        const iom_id = req.body.values.iomId

        const sql = `UPDATE  a_exercise SET title ="${title}" , description = "${description}", link="${link}", mentor=${mentor}, term="${term}", tag_id=${tag}, iom_level_id=${level} 
                             WHERE iom_id="${iom_id}" AND id_exercises = ${id_exercise}`
        const [result] = await req.db.execute(sql)

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
 * удалить задание при условии, что задание не находится на проверке (никто не проходит)
 * профиль ТЬЮТОР
 */

exports.deleteTask = async(req, res) => {
    // id - ИОМ и id задания
    const {id, task} = req.body.param

    //проверяем есть ли слушатели , которые проходят в настоящее время данное задание
    const checkHasReportFromStudentSql = `SELECT id FROM a_report WHERE iom_id = "${id}" AND exercises_id = ${task} AND  on_check = 1`;
    const deleteTaskSql = `DELETE FROM a_exercise WHERE iom_id = "${id}" AND id_exercises = ${task}`

    const [checkHasReportFromStudent] = await req.db.execute(checkHasReportFromStudentSql)

    let deleteResult = {};
    // проверяем, если такой записи нет удаляем
    if(!checkHasReportFromStudent.length) {
        [deleteResult] = await req.db.execute(deleteTaskSql)
    }

    if(!deleteResult.affectedRows) {
        response.status(201,{message:'Данное задание невозможно удалить, т.к. обучающийся приступил к его выполнению. Обратитесь к администратору'},res)
    }else {
        response.status(200, {message:'Задание удалено!'},res)
    }
}

/**
 * запрос на удаление ИОМа
 * в случае, если ИОМ никому не назначен ИОМ удаляется
 * в случае, если ИОМ назначен кому-либо из слушателей , отправляется запрос администратору на удаление
 * профиль ТЬЮТОРА
 */

exports.deleteIom = async(req,res) => {
    try{
        const uid = await userId(req.db,req.body.token)
        const tutorId = uid[0]['user_id']
        const {id} = req.body.param
        const check_IOM_empty_SQL = `SELECT COUNT(id) as id FROM relationship_student_iom WHERE iom_id = "${id}"`
        const [check_IOM_empty] = await req.db.execute(check_IOM_empty_SQL)
        const delete_IOM_empty_SQL = `DELETE FROM a_iom WHERE iom_id = "${id}"`
        const delete_task_from_empty_IOM_SQL = `DELETE FROM a_exercise WHERE iom_id = "${id}"`

        if(check_IOM_empty[0]['id']) {
            const checkStatusToDeleteSql = `SELECT * FROM permission_to_delete_iom WHERE iom_id = "${id}"`
            const requestToDeleteSql = "INSERT INTO `permission_to_delete_iom`(`iom_id`,`tutor_id`) VALUES ('" + id + "','" + tutorId + "')";
            const [checkStatusToDelete] = await req.db.execute(checkStatusToDeleteSql)

            if(checkStatusToDelete.length) {
                response.status(201,{message:'Вы уже отправляли запрос на удаление. Дождитесь одобрения администратора'},res)
            }else {
                await req.db.execute(requestToDeleteSql)
                response.status(200,{message:'Ваша заявка принята. После одобрения администратора, данный ИОМ будет удален'},res)
            }
        }else {
            const [delete_IOM_empty] = await req.db.execute(delete_IOM_empty_SQL)
            await req.db.execute(delete_task_from_empty_IOM_SQL)
            if(delete_IOM_empty.affectedRows) {
                response.status(201,{message:'Индивидуальный образовательный маршрут был удален',code:true},res)
            }else {
                response.status(200,{message:'Не удалось удалить ИОМ. Обратитесь к разработчикам'},res)
            }
        }

    }catch(e) {
        console.log(e.message)
    }
}

