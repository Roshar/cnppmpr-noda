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
 */

exports.studentEducation = async(req,res) => {
    try {
        const {iomId, token, tutorId, recall, mark} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        let getCountExercisesByIOMSQL = `SELECT id  FROM ${tblCollection.subTypeTableIom} WHERE iom_id = "${iomId}"`
        let getCountReportsByIOMSQL = `SELECT id  FROM ${tblCollection.report} WHERE iom_id = "${iomId}"
                                        AND student_id = "${studentId}" AND accepted = 1`
        let addStatusOfFinishedEducationSQL = `UPDATE relationship_student_iom
                                                      SET status = 1 WHERE user_id = "${studentId}"`

        const recallSql = `INSERT INTO global_recall (student_id, tutor_id,iom_id, mark, comment)
                           VALUES ("${studentId}","${tutorId}","${iomId}", ${mark}, "${recall}" )`


        let [getCountExercisesByIOM] = await req.db.execute(getCountExercisesByIOMSQL)
        let [getCountReportsByIOM] = await req.db.execute(getCountReportsByIOMSQL)
        if(!getCountExercisesByIOM.length && !getCountReportsByIOM.length) {
            response.status(201, {message: 'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
        }else {
            let [addStatusOfFinishedEducation] = await req.db.execute(addStatusOfFinishedEducationSQL)
            let [recall] = await req.db.execute(recallSql)
            if(addStatusOfFinishedEducation.affectedRows && recall.insertId) {
                response.status(200, {message:'Поздравляем Вас с успешным окончанием обучения!'},res)
            }else {
                response.status(201, {message:'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
            }
        }

    }catch (e) {

    }
}

