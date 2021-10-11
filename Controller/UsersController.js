'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')

exports.getUserData = async(req, res) => {
    try {
        const userObj = new DB()
        const sql = `SELECT * FROM authorization WHERE token_key = "${req.body.user}" `
        const userData = await userObj.create(sql)
        const tblName = userData[0].role

        let mainInfoData = {
            student: [
                `SELECT students.user_id, students.name, students.surname, students.patronymic, students.phone, schools.school_name, area.title_area, discipline.title_discipline FROM students INNER JOIN schools ON students.school_id = schools.id_school INNER JOIN area ON students.area_id = area.id_area INNER JOIN discipline ON students.discipline_id = discipline.id_dis WHERE students.user_id = "${userData[0]['user_id']}"`,
                `SELECT tutors.user_id, tutors.name, tutors.surname, tutors.patronymic, tutors.phone FROM relationship_tutor_student as rt INNER JOIN tutors ON tutors.user_id = rt.t_user_id WHERE rt.s_user_id = "${userData[0]['user_id']}"`
            ],
            tutor: [
                `SELECT tutors.user_id,tutors.name, tutors.surname, tutors.patronymic, tutors.phone, discipline.title_discipline FROM tutors INNER JOIN discipline ON tutors.discipline_id = discipline.id_dis WHERE tutors.user_id = "${userData[0]['user_id']}"`,
                `SELECT COUNT(*) FROM relationship_tutor_student as rt WHERE rt.t_user_id = "${userData[0]['user_id']}"`
            ]
        }
        let returnData = async (tblName, mysqlAction) => {
            return (tblName) ? await mysqlAction : null
        }

        const mainInfo = await returnData(mainInfoData[tblName], userObj.create(mainInfoData[tblName][0]));
        const linkInfo = await returnData(mainInfoData[tblName], userObj.create(mainInfoData[tblName][1]));
        const result = [mainInfo[0],linkInfo[0]]
        if(userData.length <= 0) {
            response.status(401, {message:"пусто"}, res)
        }else {
            response.status(200, result, res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getAllUsers = async (req, res) => {
    const dbObj = new DB()
    const sql = 'SELECT * FROM `users`'
    const rows = await dbObj.create(sql)
    // console.log(rows)
    if(rows){
        response.status(200,rows,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}

exports.getFromTutorTbls = async (req, res) => {
    const userObj = new DB()
    const sqlGetUserId = `SELECT user_id FROM authorization WHERE token_key = "${req.body.token}"`
    const id_user = await userObj.create(sqlGetUserId)
    // console.log(id_user)
    const tblCollection = tblMethod.tbleCollection(id_user[0]['user_id'])

    //общее количество ИОМов
    const countTutorIom = `SELECT COUNT(*) FROM ${tblCollection.iom}`
    const countIom = await userObj.create(countTutorIom)

    // общее кол-во слушатлей с ИОМ
    const countStudentsWithIom = `SELECT COUNT(*) FROM ${tblCollection.student}`
    const countStudentsIom = await userObj.create(countStudentsWithIom)

    // кол-во завершивших ИОМы
    const finishedIomSql = `SELECT COUNT(*) FROM ${tblCollection.report}`;
    const finishedIom = await userObj.create(finishedIomSql)

    const data = [{ countIom: countIom[0]['COUNT(*)'],
                    studentIom: countStudentsIom[0]['COUNT(*)'],
                    finishedIom: finishedIom[0]['COUNT(*)']
                    }]
    // console.log(data)
    if(countIom){
        response.status(200,data,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}