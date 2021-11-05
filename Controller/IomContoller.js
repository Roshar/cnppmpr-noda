'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

// CHECK AND GET
exports.issetIomId = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT id FROM ${tblCollection.iom} WHERE iom_id = "${req.body.payload.id}"`
        let iomData = await userObj.create(iomSql)
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

exports.getData = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM ${tblCollection.iom}`
        let exerciseCountSql = [];
        let iomData = await userObj.create(iomSql)
        let countExercises = [];
        if(iomData.length) {
            for(let i = 0; i < iomData.length; i++){
                exerciseCountSql.push(`SELECT COUNT(*)  FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${iomData[i]['iom_id']}"`)
                countExercises.push(await userObj.create(exerciseCountSql[i]))
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
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM ${tblCollection.iom} WHERE iom_id = "${iomId}" `
        let iomData = await userObj.create(iomSql)
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

        const userObj = new DB()
        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || null
        const id = await userId(req.body.token)
        const disciplineId = `SELECT discipline_id FROM  tutors WHERE user_id = "${id[0]['user_id']}"`
        const discipline = await userObj.create(disciplineId)
        const insertIntoCountIomSql = `INSERT INTO count_iom (iom_id, tutor_id, dis_id) VALUES ("${iomId}", "${id[0]['user_id']}",${discipline[0]['discipline_id']})`
        await userObj.create(insertIntoCountIomSql)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const iomSql = `INSERT INTO ${tblCollection.iom} (iom_id, title, description) VALUES ("${iomId}","${titleIom}","${description}")`

        const result = await userObj.create(iomSql)
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
        const activeObj = new DB()
        const sql = `INSERT INTO ${tblName} (iom_id, title, description, link, mentor, term, tag_id) VALUES ("${iom_id}","${title}","${description}","${link}",${mentor},"${term}","${tag}")`
        let result = await activeObj.create(sql)
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
        const idU = await userId(req.body.token)
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
        const getFromLibByIdSql = `SELECT * FROM ${tblCollection.library} WHERE id = ${id}`
        const userObj = new DB()
        const libData = await userObj.create(getFromLibByIdSql)
        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO ${tblCollection.subTypeTableIom} (iom_id, title, description, link, mentor, term, tag_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}","${libData[0]['tag_id']}")`
        const result = await userObj.create(insertLibDataInIom)

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
        const userObj = new DB()
        const idU = await userId(req.body.token)
        const id = req.body.values.id
        const iomId = req.body.values.iomId
        const tblCollection = tblMethod.tbleCollection(idU[0]['user_id'])
        const getFromLibGlobalByIdSql = `SELECT * FROM global_library WHERE id = ${id}`
        const libData = await userObj.create(getFromLibGlobalByIdSql)

        if(libData.length){
            libData[0].iomId = iomId
            libData[0].term = '1000-01-01'
            libData[0].mentor = 0
        }else {
            response.status(400, {message:"Ошибка при добавлении элемента"},res)
        }
        const insertLibDataInIom = `INSERT INTO ${tblCollection.subTypeTableIom} (iom_id, title, description, link, mentor, term, tag_id)
                                    VALUES ("${iomId}","${libData[0].title}","${libData[0].description}","${libData[0].link}",${libData[0].mentor},"${libData[0].term}","${libData[0]['tag_id']}")`
        const result = await userObj.create(insertLibDataInIom)

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
        const userObj = new DB()
        const id = await userId(req.body.token)
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
        let exerciseData = await userObj.create(exerciseSql)
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
        const userObj = new DB()
        const {token, studentId, iomId} = req.body
        const id = await userId(token)
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
        WHERE report.iom_id = "${iomId}" AND report.student_id = "${studentId}"`
        let exerciseData = await userObj.create(exerciseSql)
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

exports.getTask = async(req, res) => {

    try {
        const iomId = req.body.payload.param.id
        const taskId = req.body.payload.param.task
        const userObj = new DB()
        const id = await userId(req.body.token)
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
        let taskData = await userObj.create(taskSql)
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
        console.log(req.body.values.term)
        const {id_exercise, title, description = '', link = '', mentor = 0, tag} = req.body.values
        const term = req.body.values.term ? req.body.values.term : '1000-01-01'
        const tblName = req.body.tbl
        const iom_id = req.body.values.iomId
        const activeObj = new DB()
        const sql = `UPDATE  ${tblName} SET title ="${title}" , description = "${description}", link="${link}", mentor=${mentor}, term="${term}", tag_id=${tag} WHERE iom_id="${iom_id}" AND id_exercises = ${id_exercise}`
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

// DELETE

exports.deleteTask = async(req, res) => {
    const {id, task} = req.body.param
    const {subTypeTableIom,report,student} = req.body.tbl
    const checkAssignedStudentSql = `SELECT COUNT(*) FROM ${student} WHERE iom_id = "${id}"`
    const checkHasReportFromStudentSql = `SELECT COUNT(*) FROM ${report} WHERE iom_id = "${id}" AND exercises_id = ${task}`;
    const deleteTaskSql = `DELETE FROM ${subTypeTableIom} WHERE iom_id = "${id}" AND id_exercises = ${task}`
    const activeObj = new DB()
    const checkAssignedStudent = await activeObj.create(checkAssignedStudentSql)
    const checkHasReportFromStudent = await activeObj.create(checkHasReportFromStudentSql)
    let deleteResult = {};

    if(!checkAssignedStudent[0]['COUNT(*)'] && !checkHasReportFromStudent[0]['COUNT(*)']) {
        deleteResult = await activeObj.create(deleteTaskSql)
    }

    if(!deleteResult.affectedRows) {
        response.status(201,{message:'Данное задание невозможно удалить, т.к. обучающийся приступил к его выполнению. Обратитесь к администратору'},res)
    }else {
        response.status(200, {message:'Задание удалено!'},res)
    }
}


exports.deleteIom = async(req,res) => {
    try{
        const uid = await userId(req.body.token)
        const {id, task} = req.body.param
        const checkStatusToDeleteSql = `SELECT * FROM permission_to_delete_iom WHERE iom_id = "${id}"`
        const requestToDeleteSql = "INSERT INTO `permission_to_delete_iom`(`iom_id`,`tutor_id`) VALUES ('" + id + "','" + uid[0]['user_id'] + "')";
        const activeObj = new DB()
        const checkStatusToDelete = await activeObj.create(checkStatusToDeleteSql)
        console.log(checkStatusToDelete)
        if(checkStatusToDelete.length) {
            response.status(201,{message:'Вы уже отправляли запрос на удаление. Дождитесь одобрения администратора'},res)
        }else {
            const checkStatusToDelete = await activeObj.create(requestToDeleteSql)
            console.log(checkStatusToDelete)
            response.status(200,{message:'Ваша заявка принята. После одобрения администратора, данный ИОМ будет удален'},res)
        }

    }catch(e) {
        console.log(e.message)
    }

}