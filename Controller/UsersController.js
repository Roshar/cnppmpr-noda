'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')
const roleTbl = require('./../use/roleTbl')


exports.getAdminData = async(req, res) => {

    const admin = await userId(req.db,req.body.user)
    const adminId = admin[0]['user_id']
    const sql = `SELECT a.user_id,a.name, a.surname, a.avatar FROM admins as a WHERE user_id = "${adminId}"`
    const [userData] = await req.db.execute(sql)

    if(userData.length <= 0) {
        response.status(401, {message:"пусто"}, res)
    }else {
        response.status(200, userData, res)
        return true
    }
}
exports.getTutorData = async(req, res) => {
    const tutor = await userId(req.db,req.body.user)
    const tutorId = tutor[0]['user_id']
    const sql = `SELECT a.user_id,a.name, a.surname, a.avatar FROM tutors as a WHERE user_id = "${tutorId}"`
    const [userData] = await req.db.execute(sql)

    if(userData.length <= 0) {
        response.status(401, {message:"пусто"}, res)
    }else {
        response.status(200, userData, res)
        return true
    }
}


exports.deleteTutor = async(req, res) => {
    const code = req.body.code
    const tutorId = req.body.tutorId
    const admin = await userId(req.db,req.body.token)
    const role = admin[0]['role']
    const tblCollection = tblMethod.tbleCollection(tutorId)

    if(role === 'admin' && code === '5808'){
        const tutors = `DELETE FROM tutors WHERE user_id = "${tutorId}"`
        const users = `DELETE FROM users WHERE id_user = "${tutorId}"`
        const rts = `DELETE FROM relationship_tutor_student  WHERE t_user_id = "${tutorId}"`
        const rsi = `DELETE FROM relationship_student_iom  WHERE tutor_id = "${tutorId}"`
        const permissionToDelete = `DELETE FROM permission_to_delete_iom  WHERE tutor_id = "${tutorId}"`
        const globalWorkplaceTutors = `DELETE FROM global_workplace_tutors  WHERE user_id = "${tutorId}"`
        const countIom = `DELETE FROM count_iom WHERE tutor_id = "${tutorId}"`
        const [delTut] = await req.db.execute(tutors)
        const [delUser] = await req.db.execute(users)
        const [gwt] = await req.db.execute(globalWorkplaceTutors)
                      await req.db.execute(rts)
                      await req.db.execute(rsi)
                      await req.db.execute(permissionToDelete)
                      await req.db.execute(countIom)
                      await req.db.execute(countIom)
        const groupIdDelSQl = `SELECT id FROM groups_relationship  WHERE tutor_id = "${tutorId}"`
        const [groupIdDel] = await req.db.execute(groupIdDelSQl)
        if(groupIdDel.length) {
            const id = groupIdDel[0]['id']
            const deleteGroupRel = `DELETE FROM groups_relationship  WHERE tutor_id = ${id}`
            const deleteGroup = `DELETE FROM groups_  WHERE id = ${id}`
                                await req.db.execute(deleteGroupRel)
                                await req.db.execute(deleteGroup)
        }

        const deleteTblIom = `DROP TABLE ${tblCollection.iom}`
        const deleteTblLibrary = `DROP TABLE ${tblCollection.library}`
        const deleteTblMentor = `DROP TABLE ${tblCollection.mentor}`
        const deleteTblReport = `DROP TABLE ${tblCollection.report}`
        const deleteTblStudent = `DROP TABLE ${tblCollection.student}`
        const deleteTblSubTypeTableIom = `DROP TABLE ${tblCollection.subTypeTableIom}`
                                await req.db.execute(deleteTblIom)
                                await req.db.execute(deleteTblLibrary)
                                await req.db.execute(deleteTblMentor)
                                await req.db.execute(deleteTblReport)
                                await req.db.execute(deleteTblStudent)
                                await req.db.execute(deleteTblSubTypeTableIom)

        if(!delTut.affectedRows || !delUser.affectedRows || !gwt.affectedRows) {
            response.status(201, {message:"ПРОИЗОШЕЛ СБОЙ ПРИ ВЫПОЛНЕНИИ ОПЕРАЦИИ.СРОЧНО ОБРАТИТЕСЬ К РАЗРАБОТЧИКАМ"}, res)
        }else {
            response.status(200, {message: 'Тьютор и все связанные с ним данные были удалены!'}, res)
            return true
        }


    }else {
        response.status(201, {message: 'Нет доступа для выполнения данной операции'}, res)
    }
}

exports.deleteStudent = async(req, res) => {
    const code = req.body.code
    const idStudent = req.body.idStudent
    const admin = await userId(req.db,req.body.token)
    const role = admin[0]['role']
    const issetTutorForStudentSql = `SELECT t_user_id, isset_iom FROM relationship_tutor_student WHERE s_user_id = "${idStudent}"`
    const [issetTutorForStudent] = await req.db.execute(issetTutorForStudentSql)

    if(role === 'admin' && code === '5808') {
        if(issetTutorForStudent.length) {
            const tutorId = issetTutorForStudent[0]['t_user_id']
            const issetIom = issetTutorForStudent[0]['isset_iom']
            const tblCollection = tblMethod.tbleCollection(tutorId)
            const deleteDependencies1 = `DELETE FROM relationship_tutor_student WHERE s_user_id = "${idStudent}" AND t_user_id = "${tutorId}"`


            const deleteInAdminTbl= `DELETE FROM admin_student_iom_status WHERE student_id = "${idStudent}"`
                                     await req.db.execute(deleteDependencies1)
                                     await req.db.execute(deleteInAdminTbl)

            if(issetIom === 1) {
                const deleteDependencies2 = `DELETE FROM relationship_student_iom WHERE user_id = "${idStudent}" AND tutor_id = "${tutorId}"`
                const deleteInTutorTblStudent = `DELETE FROM ${tblCollection.student} WHERE student_id = "${idStudent}"`
                const deleteInTutorTblReport = `DELETE FROM ${tblCollection.report} WHERE student_id = "${idStudent}"`
                                    await req.db.execute(deleteDependencies2)
                                    await req.db.execute(deleteInTutorTblStudent)
                                    await req.db.execute(deleteInTutorTblReport)
            }
        }

        const students = `DELETE FROM students WHERE user_id = "${idStudent}"`
        const users = `DELETE FROM users WHERE id_user = "${idStudent}"`
        const authorizationTbl= `DELETE FROM authorization WHERE user_id = "${idStudent}"`
                                await req.db.execute(authorizationTbl)
        const [deleteUser] = await req.db.execute(users)
        const [deleteStudent] = await req.db.execute(students)
        if(deleteUser.affectedRows && deleteStudent.affectedRows) {
            response.status(200, {message: 'Слушатель и все связанные с ним данные были удалены!'}, res)
            return true
        }else {
            response.status(201, {message:"ПРОИЗОШЕЛ СБОЙ ПРИ ВЫПОЛНЕНИИ ОПЕРАЦИИ.СРОЧНО ОБРАТИТЕСЬ К РАЗРАБОТЧИКАМ"}, res)
            return true
        }

    }else {
        response.status(201, {message: 'Нет доступа для выполнения данной операции'}, res)
    }

}

exports.getDataAdminAccount = async(req, res) => {
    try {
        const admin = await userId(req.db,req.body.token)
        const adminId = admin[0]['user_id']
        const sql = `SELECT a.user_id,a.name, a.surname, a.patronymic, a.phone, a.gender, a.avatar, 
                        DATE_FORMAT(a.birthday, '%d.%m.%Y') as birthday, TIMESTAMPDIFF(YEAR, a.birthday, CURDATE()) as age,
                        DATE_FORMAT(a.birthday, '%Y-%m-%d') as birthdayConvert,
                         u.login FROM admins as a 
                         INNER JOIN users as u ON a.user_id = u.id_user 
                         WHERE a.user_id = "${adminId}"`


        const [result] = await req.db.execute(sql)

        if(result.length <= 0) {
            response.status(401, {message:"пусто"}, res)
        }else {
            response.status(200, result[0], res)
            return true
        }
    }catch (e) {
        return e
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
    const finishedIomSql = `SELECT COUNT(*) FROM relationship_student_iom WHERE tutor_id = "${id_user[0]['user_id']}" 
                            AND status = 1`;
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

exports.updateAdminProfile = async (req, res) => {

    // console.log(req.body)
    const {name, surname, patronymic, login, birthday, phone, gender, token} = req.body
    const admin = await userId(req.db, token)
    const adminId = admin[0]['user_id']
    if (adminId.length) {
        const sql2 = `UPDATE users SET login = "${login}" WHERE id_user = "${adminId}"`
        await req.db.execute(sql2)
        const sql3 = `UPDATE admins SET name="${name}", surname="${surname}",
                      patronymic = "${patronymic}", phone = "${phone}",
                       birthday = "${birthday}", gender="${gender}" WHERE user_id = "${adminId}"`
        const [result] =  await req.db.execute(sql3)
        console.log(result)
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