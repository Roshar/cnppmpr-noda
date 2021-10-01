'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getStudents = async (req, res) => {
    const dbObj = new DB()
    const {tutor_id} = req.body; 
    const sql = `SELECT students.user_id, students.name, students.surname, students.patronymic FROM relationship_tutor_student as rt INNER JOIN students ON students.user_id = rt.s_user_id WHERE rt.t_user_id = "${tutor_id}"`
    

/* const sql = 'SELECT * FROM students' */
const rows = await dbObj.create(sql)
    console.log(rows)
    if(rows){
        response.status(200,rows,res)
    }else {
        response.status(400,{message:'Ошибка при получении записи'},res)
    }
}