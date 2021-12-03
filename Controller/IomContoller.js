'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

// CHECK AND GET
exports.issetIomId = async(req, res) => {
    try {

        const id = await userId(req.db,req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT id FROM ${tblCollection.iom} WHERE iom_id = "${req.body.payload.id}"`
        const [iomData] = await req.db.execute(iomSql)

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

/////////////////////////////


exports.getData = async(req, res) => {
    try {

        const id = await userId(req.db,req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM ${tblCollection.iom}`
        let exerciseCountSql = [];
        const [iomData] = await req.db.execute(iomSql)
        let countExercises = [];
        if(iomData.length) {
            for(let i = 0; i < iomData.length; i++){
                exerciseCountSql.push(`SELECT COUNT(*)  FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${iomData[i]['iom_id']}"`)
                // countExercises.push(await userObj.create(exerciseCountSql[i]))
                countExercises.push((await req.db.execute(exerciseCountSql[i]))[0])
                iomData[i].countExercises = countExercises[i][0]['COUNT(*)']
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

exports.getDataById = async(req, res) => {
    try {
        const iomId = req.body.id
        const id = await userId(req.db,req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM ${tblCollection.iom} WHERE iom_id = "${iomId}" `
        const [iomData] = await req.db.execute(iomSql)
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

// INSERT DATA

exports.addNewIom = async(req, res) => {
    try {


        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || null
        const id = await userId(req.db, req.body.token)
        const disciplineId = `SELECT discipline_id FROM  tutors WHERE user_id = "${id[0]['user_id']}"`
        const [discipline] = await req.db.execute(disciplineId)

        const insertIntoCountIomSql = `INSERT INTO count_iom (iom_id, tutor_id, dis_id) VALUES ("${iomId}", "${id[0]['user_id']}",${discipline[0]['discipline_id']})`
        await req.db.execute(insertIntoCountIomSql)

        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const iomSql = `INSERT INTO ${tblCollection.iom} (iom_id, title, description) VALUES ("${iomId}","${titleIom}","${description}")`

        const [result] = await req.db.execute(iomSql)

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

        const sql = `INSERT INTO ${tblName} (iom_id, title, description, link, mentor, term, tag_id) VALUES ("${iom_id}","${title}","${description}","${link}",${mentor},"${term}","${tag}")`
        let [result] = await req.db.execute(sql)
        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}
exports.addExerciseFromLib = async(req, res) => {
    try {
        const idU = await userId(req.db,req.body.token)
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
        const getFromLibByIdSql = `SELECT * FROM ${tblCollection.library} WHERE id = ${id}`

        const [libData] = await req.db.execute(getFromLibByIdSql)

        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO ${tblCollection.subTypeTableIom} (iom_id, title, description, link, mentor, term, tag_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}","${libData[0]['tag_id']}")`
        const [result] = await req.db.execute(insertLibDataInIom)

        if(!result.insertId) {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }else {
            response.status(200,{message:"Задание успешно добавлено", result},res)
        }
    }catch (e) {

    }
}

exports.addExerciseFromLibGlobal = async(req, res) => {
    try {

        const idU = await userId(req.db,req.body.token)
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
        const getFromLibGlobalByIdSql = `SELECT * FROM global_library WHERE id = ${id}`
        const [libData] = await req.db.execute(getFromLibGlobalByIdSql)

        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO ${tblCollection.subTypeTableIom} (iom_id, title, description, link, mentor, term, tag_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}","${libData[0]['tag_id']}")`
        const [result] = await req.db.execute(insertLibDataInIom)


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

        const id = await userId(req.db,req.body.token)
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


exports.getStatusFinished = async(req, res) => {
    try {

        const {token, studentId, iomId} = req.body
        const id = await userId(req.db,token)
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
        FROM ${tblCollection.report} as report  
        INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises 
        INNER JOIN tag ON t.tag_id = tag.id_tag
        WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND report.accepted = 1`
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


exports.getStatusToPendingFinish = async(req, res) => {
    try {

        const {token, studentId, iomId} = req.body
        const id = await userId(req.db,token)
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
        FROM ${tblCollection.report} as report  
        INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises 
        INNER JOIN tag ON t.tag_id = tag.id_tag
        WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}" AND report.accepted = 0`
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


exports.getPendingDataOrFinished = async(req, res) => {
    try {
        const {token, status,iomId} = req.body
        const id = await userId(req.db,token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
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
            FROM ${tblCollection.report} as report  
            INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises 
            INNER JOIN ${tblCollection.iom} as iom ON t.iom_id = iom.iom_id 
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
            FROM ${tblCollection.report} as report  
            INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises 
            INNER JOIN ${tblCollection.iom} as iom ON t.iom_id = iom.iom_id 
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
 * ПОЛУЧИТЬ ОТВЕТЫ ЗАДАНИЙ ИЗ ИОМа
 * ПРОФИЛЬ TUTOR
 */

exports.getStudentAnswer = async(req, res) => {

    try {
        const {token, iomId, exId, studentId} = req.body
        const id = await userId(req.db,token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
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
                            report.file_path,
                            report.link as answer_link
            FROM ${tblCollection.report} as report  
            INNER JOIN ${tblCollection.subTypeTableIom} as t ON report.exercises_id = t.id_exercises 
            INNER JOIN ${tblCollection.iom} as iom ON t.iom_id = iom.iom_id 
            INNER JOIN students as s ON report.student_id = s.user_id 
            INNER JOIN tag ON t.tag_id = tag.id_tag
            WHERE report.student_id = "${studentId}" AND report.iom_id = "${iomId}" AND report.exercises_id = ${exId}`

        const [taskData] = await req.db.execute(sql)

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

exports.successTask = async(req, res) => {
    try {
        const {token, iomId, exId, studentId} = req.body
        const id = await userId(req.db,token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])

        const sql = `UPDATE  ${tblCollection.report} SET accepted = 1, on_check = 0, tutor_comment ='' WHERE iom_id="${iomId}" AND exercises_id = ${exId} 
                     AND student_id = "${studentId}"`

        const [result] = await req.db.execute(sql)

        if(!result.affectedRows) {
            response.status(201, {message:"Ошибка при одобрении. Обратиетсь к разработчикам"},res)
        }else {
            response.status(200,{message:"Ответ слушателя принят"},res)
        }

    }catch (e) {
        console.log(e)
    }
}

exports.correctionTask = async(req, res) => {
    try {
        const {token, iomId, exId, studentId, comment} = req.body
        const id = await userId(req.db,token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])

        const sql = `UPDATE  ${tblCollection.report} SET accepted = 2, tutor_comment = "${comment}", on_check = 0   WHERE iom_id="${iomId}" AND exercises_id = ${exId} 
                     AND student_id = "${studentId}"`

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


exports.getTask = async(req, res) => {

    try {
        const iomId = req.body.payload.param.id
        const taskId = req.body.payload.param.task

        const id = await userId(req.db,req.body.token)
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
        const [taskData] = await req.db.execute(taskSql)

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
        const term = req.body.values.term ? req.body.values.term : '1000-01-01'
        const tblName = req.body.tbl
        const iom_id = req.body.values.iomId

        const sql = `UPDATE  ${tblName} SET title ="${title}" , description = "${description}", link="${link}", mentor=${mentor}, term="${term}", tag_id=${tag} WHERE iom_id="${iom_id}" AND id_exercises = ${id_exercise}`
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

// DELETE

exports.deleteTask = async(req, res) => {
    const {id, task} = req.body.param

    const {subTypeTableIom,report,student} = req.body.tbl

    // const checkAssignedStudentSql = `SELECT COUNT(*) FROM ${student} WHERE iom_id = "${id}"`
    const checkHasReportFromStudentSql = `SELECT COUNT(*) FROM ${report} WHERE iom_id = "${id}" AND exercises_id = ${task}`;
    const deleteTaskSql = `DELETE FROM ${subTypeTableIom} WHERE iom_id = "${id}" AND id_exercises = ${task}`

    // const [checkAssignedStudent] = await req.db.execute(checkAssignedStudentSql)
    const [checkHasReportFromStudent] = await req.db.execute(checkHasReportFromStudentSql)

    // console.log(checkAssignedStudent[0]['COUNT(*)'])
    console.log(checkHasReportFromStudent[0]['COUNT(*)'])
    let deleteResult = {};

    if(!checkHasReportFromStudent[0]['COUNT(*)']) {
        [deleteResult] = await req.db.execute(deleteTaskSql)
    }

    if(!deleteResult.affectedRows) {
        response.status(201,{message:'Данное задание невозможно удалить, т.к. обучающийся приступил к его выполнению. Обратитесь к администратору'},res)
    }else {
        response.status(200, {message:'Задание удалено!'},res)
    }
}


exports.deleteIom = async(req,res) => {
    try{
        const uid = await userId(req.db,req.body.token)
        const tblCollection = tblMethod.tbleCollection(uid[0]['user_id'])
        const {id} = req.body.param
        const check_IOM_empty_SQL = `SELECT COUNT(id) as id FROM relationship_student_iom WHERE iom_id = "${id}"`
        const [check_IOM_empty] = await req.db.execute(check_IOM_empty_SQL)
        const delete_IOM_empty_SQL = `DELETE FROM ${tblCollection.iom} WHERE iom_id = "${id}"`
        const delete_task_from_empty_IOM_SQL = `DELETE FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${id}"`
        const delete_from_count_iom = `DELETE FROM count_iom WHERE iom_id = "${id}" AND tutor_id = "${uid[0]['user_id']}"`
        if(check_IOM_empty[0]['id']) {
            const checkStatusToDeleteSql = `SELECT * FROM permission_to_delete_iom WHERE iom_id = "${id}"`
            const requestToDeleteSql = "INSERT INTO `permission_to_delete_iom`(`iom_id`,`tutor_id`) VALUES ('" + id + "','" + uid[0]['user_id'] + "')";
            const [checkStatusToDelete] = await req.db.execute(checkStatusToDeleteSql)

            if(checkStatusToDelete.length) {
                response.status(201,{message:'Вы уже отправляли запрос на удаление. Дождитесь одобрения администратора'},res)
            }else {
                const [checkStatusToDelete] = await req.db.execute(requestToDeleteSql)
                response.status(200,{message:'Ваша заявка принята. После одобрения администратора, данный ИОМ будет удален'},res)
            }
        }else {
            const [delete_IOM_empty] = await req.db.execute(delete_IOM_empty_SQL)
            await req.db.execute(delete_task_from_empty_IOM_SQL)
            await req.db.execute(delete_from_count_iom)
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