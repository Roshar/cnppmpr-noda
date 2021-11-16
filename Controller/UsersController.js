'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')
const roleTbl = require('./../use/roleTbl')


exports.getAdminData = async(req, res) => {

    const sql = `SELECT * FROM authorization WHERE token_key = "${req.body.user}" `
    const [userData] = await req.db.execute(sql)

    if(userData.length <= 0) {
        response.status(401, {message:"пусто"}, res)
    }else {
        response.status(200, userData, res)
        return true
    }
}

exports.getUserData = async(req, res) => {
    try {

        const sql = `SELECT * FROM authorization WHERE token_key = "${req.body.user}" `
        const [userData] = await req.db.execute(sql)
        const tblName = userData[0].role

        let mainInfoData = {
            student: [
                `SELECT students.user_id, students.name, students.surname, students.patronymic, u.login,students.avatar,
                        students.phone,students.gender, schools.school_name, area.title_area, discipline.title_discipline,
                          DATE_FORMAT(students.birthday, '%d.%m.%Y') as birthday,
                        TIMESTAMPDIFF(YEAR, students.birthday, CURDATE()) as age,
                        DATE_FORMAT(students.birthday, '%Y-%m-%d') as birthdayConvert
                        FROM students  
                        INNER JOIN schools ON students.school_id = schools.id_school 
                        INNER JOIN area ON students.area_id = area.id_area 
                        INNER JOIN discipline ON students.discipline_id = discipline.id_dis 
                        INNER JOIN users as u ON students.user_id = u.id_user 
                        WHERE students.user_id = "${userData[0]['user_id']}"`,
                `SELECT tutors.user_id, tutors.name, tutors.surname, tutors.patronymic, tutors.phone 
                        FROM relationship_tutor_student as rt 
                        INNER JOIN tutors ON tutors.user_id = rt.t_user_id 
                        WHERE rt.s_user_id = "${userData[0]['user_id']}"`
            ],
            tutor: [
                `SELECT tutors.user_id,tutors.name, tutors.surname, tutors.patronymic, tutors.phone, tutors.gender, tutors.avatar, 
                        DATE_FORMAT(tutors.birthday, '%d.%m.%Y') as birthday, TIMESTAMPDIFF(YEAR, tutors.birthday, CURDATE()) as age,
                        DATE_FORMAT(tutors.birthday, '%Y-%m-%d') as birthdayConvert,
                         u.login, discipline.title_discipline FROM tutors 
                         INNER JOIN discipline ON tutors.discipline_id = discipline.id_dis 
                         INNER JOIN users as u ON tutors.user_id = u.id_user 
                         WHERE tutors.user_id = "${userData[0]['user_id']}"`,
                `SELECT COUNT(*) FROM relationship_tutor_student as rt WHERE rt.t_user_id = "${userData[0]['user_id']}"`
            ],
        }
        let returnData = async (tblName, mysqlAction) => {
            return (tblName) ? await mysqlAction : null
        }
        const [mainInfo] = await returnData(mainInfoData[tblName], req.db.execute(mainInfoData[tblName][0]));
        // const mainInfo = await returnData(mainInfoData[tblName], userObj.create(mainInfoData[tblName][0]));
        // const linkInfo = await returnData(mainInfoData[tblName], userObj.create(mainInfoData[tblName][1]));
        const [linkInfo] = await returnData(mainInfoData[tblName], req.db.execute(mainInfoData[tblName][1]));
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

    const sql = 'SELECT * FROM `users`'
    const [rows] = await req.db.execute(sql)
    if(rows){
        response.status(200,rows,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}

exports.getFromTutorTbls = async (req, res) => {

    const sqlGetUserId = `SELECT user_id FROM authorization WHERE token_key = "${req.body.token}"`
    const [id_user] = await req.db.execute(sqlGetUserId)
    const tblCollection = tblMethod.tbleCollection(id_user[0]['user_id'])

    //общее количество ИОМов
    const countTutorIom = `SELECT COUNT(*) FROM ${tblCollection.iom}`
    const [countIom] = await req.db.execute(countTutorIom)

    // общее кол-во слушатлей с ИОМ
    const countStudentsWithIom = `SELECT COUNT(*) FROM ${tblCollection.student}`
    const [countStudentsIom] = await req.db.execute(countStudentsWithIom)

    // кол-во завершивших ИОМы
    const finishedIomSql = `SELECT COUNT(*) FROM report WHERE tutor_id = "${id_user[0]['user_id']}"`;
    const [finishedIom] = await req.db.execute(finishedIomSql)


    const data = [{ countIom: countIom[0]['COUNT(*)'],
                    studentIom: countStudentsIom[0]['COUNT(*)'],
                    finishedIom: finishedIom[0]['COUNT(*)'],
                    }]

    if(countIom){
        response.status(200,data,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}

exports.updateTutorProfile = async (req, res) => {
    const {name, surname, patronymic, login, birthday, phone, gender, token} = req.body

    const userObj = new DB()
    const sql = `SELECT * FROM authorization WHERE token_key = "${token}" `
    const [userData] = await req.db.execute(sql)
    if (userData.length) {
        const user = userData[0]['user_id']
        const sql2 = `UPDATE users SET login = "${login}" WHERE id_user = "${user}"`
        await req.db.execute(sql2)
        const sql3 = `UPDATE tutors SET name="${name}", surname="${surname}",
                      patronymic = "${patronymic}", phone = "${phone}",
                       birthday = "${birthday}", gender="${gender}" WHERE user_id = "${user}"`
        const [result] =  await req.db.execute(sql3)
        if(result.affectedRows) {
            response.status(200,{message:'Ваш профиль обновлен'},res)
        }
    }else {
        response.status(400,{message:'Ошибка'},res)
    }
}

exports.updateStudentProfile = async (req, res) => {
    const {name, surname, patronymic, login, birthday, phone, gender, token} = req.body

    const sql = `SELECT * FROM authorization WHERE token_key = "${token}" `
    const [userData] = await req.db.execute(sql)
    if (userData.length) {
        const user = userData[0]['user_id']
        const sql2 = `UPDATE users SET login = "${login}" WHERE id_user = "${user}"`
        await req.db.execute(sql2)
        const sql3 = `UPDATE students SET name="${name}", surname="${surname}",
                      patronymic = "${patronymic}", phone = "${phone}",
                       birthday = "${birthday}", gender="${gender}" WHERE user_id = "${user}"`
        const [result] =  await req.db.execute(sql3)
        if(result.affectedRows) {
            response.status(200,{message:'Ваш профиль обновлен'},res)
        }
    }else {
        response.status(400,{message:'Ошибка'},res)
    }
}

exports.changeAvatar = async (req, res) => {
    const fileName = req.file.filename
    const user = req.body.user
    const getUserInfo = await userId(req.db,user)
    const id = getUserInfo[0]['user_id']
    const tblName = roleTbl(getUserInfo[0]['role'])
    const sql2 = `UPDATE ${tblName} SET avatar = "${fileName}" WHERE user_id = "${id}"`
    const [result] = await req.db.execute(sql2)
    if(!result.affectedRows) {
        response.status(400, {message:'Произошла ошибка, обратитесь к разработчикам'},res)
    }else {
        response.status(200, {message:'Фотография профиля обновлена'}, res)
    }

}