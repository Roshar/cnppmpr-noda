'use strict'
const response = require('./../response')
const DB = require('./../settings/db')



exports.getUserData = async(req, res) => {
    try {
        const userObj = new DB()
        const sql = `SELECT * FROM authorization WHERE token_key = "${req.body.user}" `
        const userData = await userObj.create(sql)
        const tblName = userData[0].role
        let sqlActionData = {
            student: `SELECT students.name, students.surname, students.patronymic, students.phone, schools.school_name, area.title_area, discipline.title_discipline FROM students INNER JOIN schools ON students.school_id = schools.id_school INNER JOIN area ON students.area_id = area.id_area INNER JOIN discipline ON students.discipline_id = discipline.id_dis WHERE students.user_id = "${userData[0]['user_id']}"`,
            tutor: `SELECT tutors.name, tutors.surname, tutors.patronymic, tutors.phone, discipline.title_discipline FROM tutors INNER JOIN discipline ON tutor.discipline_id = discipline.id_dis WHERE tutor.user_id = "${userData[0]['user_id']}"`
        }
        let actionSql = async() => {
            return (sqlActionData[tblName]) ? await userObj.create(sqlActionData[tblName]) : null
        }
        if(userData.length <= 0) { 
            response.status(401, {message:"пусто"}, res)
        }else {
            response.status(200, await actionSql(), res)
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
    console.log(rows)
    if(rows){
        response.status(200,rows,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}