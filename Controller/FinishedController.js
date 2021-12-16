'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')
const tblMethod = require('./../use/tutorTblCollection')

/**
 * Завершение обучения
 * проверка количества заданий в [id_tutor]_subTypeTableIom
 * проверка количества пройденных заданий слушателем в [id_tutor]_report
 * при условии что совпадают значения меняем статус в relationship_student_iom на выполненный
 * добавляем  в таблицу global_history_education_rows данные (таблица в которой будут хранится записи завершивших обучение)
 * добавляем в global_recall отзыв и оценку
 * ДЛЯ СЛУШАТЕЛЯ
 */

exports.studentEducation = async(req,res) => {
    try {
        const {iomId, token, tutorId, recall, mark} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        let getCountExercisesByIOMSQL = `SELECT id_exercises  FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${iomId}"`
        let getCountReportsByIOMSQL = `SELECT id  FROM ${tblCollection.report} WHERE iom_id = "${iomId}"
                                        AND student_id = "${studentId}" AND accepted = 1`

        let addStatusOfFinishedEducationSQL = `UPDATE relationship_student_iom
                                                      SET status = 1, date_finished_education = CURRENT_TIMESTAMP WHERE user_id = "${studentId}" 
                                                      AND tutor_id = "${tutorId}" AND iom_id = "${iomId}"`


        const recallSql = `INSERT INTO global_recall (student_id, tutor_id,iom_id, mark, comment)
                           VALUES ("${studentId}","${tutorId}","${iomId}", ${mark}, "${recall}" )`

        const addInHistoryTblSql = `INSERT INTO global_history_education_rows (tutor_id, student_id,iom_id)
                           VALUES ("${tutorId}","${studentId}","${iomId}")`

        let [getCountReportsByIOM] = await req.db.execute(getCountReportsByIOMSQL)

        let [getCountExercisesByIOM] = await req.db.execute(getCountExercisesByIOMSQL)

        if(!getCountExercisesByIOM.length || !getCountReportsByIOM.length) {
            response.status(201, {message: 'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
        }else if(getCountExercisesByIOM.length === getCountReportsByIOM.length ) {
            let [addStatusOfFinishedEducation] = await req.db.execute(addStatusOfFinishedEducationSQL)
            let [history] = await req.db.execute(addInHistoryTblSql)
            let [recall] = await req.db.execute(recallSql)
            if(addStatusOfFinishedEducation.affectedRows && recall.insertId && history.insertId) {
                response.status(200, {message:'Поздравляем Вас с успешным окончанием обучения!'},res)
            }else {
                response.status(201, {message:'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
            }
        } else {
            response.status(201, {message: 'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
        }

    }catch (e) {

    }
}

/**
 * Проверка на завершенность ИОМа
 * ДЛЯ СЛУШАТЕЛЯ
 */

exports.checkStudentIOM = async(req,res) => {
    try {
        const {iomId, token, tutorId} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];
        let checkSQL = `SELECT id  FROM relationship_student_iom 
                                         WHERE iom_id = "${iomId}" AND user_id = "${studentId}" AND tutor_id = "${tutorId}"
                                         AND status = 1`
        let [checkStatus] = await req.db.execute(checkSQL)

        if(!checkStatus) {
            response.status(201, [],res)
        }else {
            response.status(200, checkStatus,res)
        }

    }catch (e) {

    }
}

/**
 * Получение завершенных курсов
 * ТРЕБУЕТСЯ ДОРАБОТКА на случай, если у слушателя будут разные тьюторы
 * ДЛЯ СЛУШАТЕЛЯ
 **/
exports.getFinishedCourses = async(req,res) => {
    try {
        const {studentId, tutorId} = req.body

        const tblCollection = tblMethod.tbleCollection(tutorId)

        let iomInfoSql = `SELECT rsi.iom_id, DATE_FORMAT(rsi.date_finished_education, '%d.%m.%Y') as dt, iom.title, 
                                         t.name, t.surname, t.patronymic  FROM relationship_student_iom as rsi
                                         INNER JOIN ${tblCollection.iom} as iom ON rsi.iom_id = iom.iom_id
                                         INNER JOIN tutors as t ON rsi.tutor_id = t.user_id
                                         WHERE rsi.user_id = "${studentId}" AND rsi.tutor_id = "${tutorId}"
                                         AND rsi.status = 1`

        let [iomInfo] = await req.db.execute(iomInfoSql)

        if(!iomInfo) {
            response.status(201, [], res)
        }else {
            response.status(200, iomInfo,res)
        }

    }catch (e) {

    }
}

/**
 * Получить всех слушателей завершивших обучение
 * Для ТЬЮТОРА
 **/
exports.getStudentsForTutor = async(req,res) => {
    try {
        const {token} = req.body
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)

        let studentsSql = `SELECT rsi.iom_id, DATE_FORMAT(rsi.date_finished_education, '%d.%m.%Y') as dt, iom.title,
                                         s.user_id, s.name, s.surname, s.patronymic,
                                         school.school_name,area.title_area
                                         FROM relationship_student_iom as rsi
                                         INNER JOIN ${tblCollection.iom} as iom ON rsi.iom_id = iom.iom_id
                                         INNER JOIN students as s ON rsi.user_id = s.user_id
                                         INNER JOIN area ON s.area_id = area.id_area 
                                         INNER JOIN schools as school ON s.school_id = school.id_school
                                         WHERE rsi.tutor_id = "${tutorId}"
                                         AND rsi.status = 1`

        let [students] = await req.db.execute(studentsSql)

        if(!students) {
            response.status(201, [], res)
        }else {
            response.status(200, students,res)
        }

    }catch (e) {

    }
}

