'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')
const tblMethod = require('./../use/tutorTblCollection')

exports.getStudentsForTutor = async(req, res) => {
    try {
        const {filter, token} = req.body
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()

        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                        s.area_id, s.school_id, s.gender, 
                        DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                        DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                        a.title_area, school.school_name
                        FROM relationship_tutor_student as rts
                        INNER JOIN students as s ON rts.s_user_id = s.user_id
                        INNER JOIN area as a ON s.area_id = a.id_area
                        INNER JOIN schools as school ON s.school_id = school.id_school
                        WHERE rts.t_user_id = "${tutorId}"`
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getUsersFromIomEducation = async(req, res) => {
    try {
        const {filter, iomId, token} = req.body
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const dbObject = new DB()
        const tblCollection = tblMethod.tbleCollection(tutorId)
        if(!filter) {
            const sql = `SELECT sub.student_id, s.name, s.surname, s.surname, s.patronymic,
                                 s.area_id, s.school_id, s.gender, a.title_area, school.school_name,rsi.status 
                          FROM ${tblCollection.student} as sub
                          INNER JOIN students as s ON sub.student_id = s.user_id
                          INNER JOIN area as a ON s.area_id = a.id_area
                          INNER JOIN relationship_student_iom as rsi ON rsi.user_id = sub.student_id
                          INNER JOIN schools as school ON s.school_id = school.id_school WHERE sub.iom_id = "${iomId}"`
            const students = await dbObject.create(sql)
            if(students.length <= 0) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }else {
            const param = req.body.param
            const sql = `SELECT sub.student_id, s.name, s.surname, s.surname, s.patronymic,
                                 s.area_id, s.school_id, s.gender, a.title_area, school.school_name 
                          FROM ${tblCollection.student} as sub
                          INNER JOIN students as s ON sub.student_id = s.user_id
                          INNER JOIN area as a ON s.area_id = a.id_area
                          INNER JOIN schools as school ON s.school_id = school.id_school WHERE sub.iom_id = "${iomId}"
                          AND (s.name LIKE "${param}%" OR s.surname LIKE "${param}%")`
            const students = await dbObject.create(sql)
            if(students.length <= 0) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }

    }catch (e) {
        return e
    }
}

exports.deleteStudentFromIomEducation = async(req, res) => {
    try {
        const {studentId, iomId, token} = req.body
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const dbObject = new DB()
        const tblCollection = tblMethod.tbleCollection(tutorId)
        const sqlCheckPossibility = `SELECT COUNT(id) as id FROM ${tblCollection.report} WHERE iom_id = "${iomId}"
                                     AND student_id="${studentId}"`
        const checkPossibility = await dbObject.create(sqlCheckPossibility)

        if(!checkPossibility[0].id) {
            const sql = `DELETE FROM ${tblCollection.student} WHERE iom_id = "${iomId}" AND student_id = "${studentId}"`
            const result = await dbObject.create(sql)
            const deleteInTutorTblLocalSql = `DELETE FROM relationship_student_iom WHERE iom_id = "${iomId}" AND user_id = "${studentId}" AND tutor_id = "${tutorId}"`
            const result2 = await dbObject.create(deleteInTutorTblLocalSql)
            if(result.affectedRows && result2.affectedRows) {
                const sql2 = `UPDATE relationship_tutor_student SET isset_iom = 0 
                         WHERE s_user_id = "${studentId}" AND t_user_id = "${tutorId}"`
                const result2 = await dbObject.create(sql2)
                if(result2.affectedRows) {
                    response.status(200, {message: 'Слушатель удален из данного ИОМа'},res)
                    return true
                }else {
                    response.status(201, {message: 'Слушатель удален, но  статус не обнавлен! Обратитесь к разработчикам'},res)
                }

            }else {
                response.status(201, {message: 'Ошибка при удалении слушателя из ИОМ. Обратитесь к разработчикам'},res)

            }
        }else {
            response.status(201, {message: 'Невозможно удалить, слушатель приступил к выполнению заданий из данного ИОМ. Обратитесь к администрации '},res)
        }


    }catch (e) {
        return e
    }
}

exports.getUsersFromIomFreeForEducation = async(req, res) => {

    try {
        const {filter, iomId, token} = req.body
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const dbObject = new DB()
        const tblCollection = tblMethod.tbleCollection(tutorId)
        if(!filter) {
            const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic,  u.login,
                                s.school_id, school.school_name
                        FROM relationship_tutor_student as rts
                        INNER JOIN students as s ON rts.s_user_id = s.user_id
                        INNER JOIN schools as school ON s.school_id = school.id_school
                        INNER JOIN users as u ON s.user_id = u.id_user
                        WHERE rts.t_user_id = "${tutorId}" AND rts.isset_iom = 0`
            const students = await dbObject.create(sql)
            if(students.length <= 0) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }else {
            const param = req.body.param
            const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, 
                        s.area_id, s.school_id, school.school_name,  u.login
                        FROM relationship_tutor_student as rts
                        INNER JOIN students as s ON rts.s_user_id = s.user_id
                        INNER JOIN schools as school ON s.school_id = school.id_school
                        INNER JOIN users as u ON s.user_id = u.id_user
                        WHERE rts.t_user_id = "${tutorId}" AND rts.isset_iom = 0 AND (s.name LIKE "${param}%" OR s.surname LIKE "${param}%") `
            const students = await dbObject.create(sql)
            if(students.length <= 0) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }

    }catch (e) {
        return e
    }
}

exports.addStudentInCurrentIom = async(req, res) => {
    try {
        const {studentId, iomId, token} = req.body
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const dbObject = new DB()
        const tblCollection = tblMethod.tbleCollection(tutorId)
        const insertInTutorTblLocal = `INSERT INTO ${tblCollection.student} (student_id, iom_id) VALUES ("${studentId}", "${iomId}")`
        const result = await dbObject.create(insertInTutorTblLocal)
        const insertInRelationship_student_iom = `INSERT INTO relationship_student_iom (user_id, tutor_id, iom_id) VALUES ("${studentId}","${tutorId}", "${iomId}")`
        const result3 = await dbObject.create(insertInRelationship_student_iom)
        if(result.insertId && result3.insertId) {
            const sql = `UPDATE relationship_tutor_student SET isset_iom = 1 
                         WHERE s_user_id = "${studentId}" AND t_user_id = "${tutorId}"`
            let result2 = await dbObject.create(sql)
            if(!result2.affectedRows) {
                response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
            }else {
                response.status(200, {message:'Пользователь добавлен'},res)
            }
        }else {
            response.status(201,{message:'Ошибка операции. Обратитесь к разработчикам'},res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithGender = async(req, res) => {
    try {
        const token = req.body.token
        const gender = req.body.gender
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}"`
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithGenderAndArea = async(req, res) => {
    try {
        const token = req.body.token
        const gender = req.body.gender
        const areaId = req.body.areaId
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" AND s.area_id = ${areaId}`
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithGenderAndAreaAndIom = async(req, res) => {
    try {

        const token = req.body.token
        const gender = req.body.gender
        const areaId = req.body.areaId
        const iom = req.body.iom
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" AND s.area_id = ${areaId} AND
                            rts.isset_iom = ${iom} `
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithAreaAndIom = async(req, res) => {
    try {

        const token = req.body.token
        const areaId = req.body.areaId
        const iom = req.body.iom
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.area_id = ${areaId} AND
                            rts.isset_iom = ${iom} `
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithIom = async(req, res) => {
    try {

        const token = req.body.token
        const iom = req.body.iom
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND rts.isset_iom = ${iom} `
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithArea = async(req, res) => {
    try {

        const token = req.body.token
        const areaId = req.body.areaId
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.area_id = ${areaId} `
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.getStudentsForTutorWithGenderAndIom = async(req, res) => {
    try {

        const token = req.body.token
        const gender = req.body.gender
        const iom = req.body.iom
        const tutor = await userId(token)
        const tutorId = tutor[0]['user_id'];
        const schoolsObj = new DB()
        const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic, s.phone,
                            s.area_id, s.school_id, s.gender,
                            DATE_FORMAT(s.birthday, '%Y-%m-%d') as birthdayF1,
                            DATE_FORMAT(s.birthday, '%d-%m-%Y') as birthdayF2,
                            a.title_area, school.school_name
                            FROM relationship_tutor_student as rts
                            INNER JOIN students as s ON rts.s_user_id = s.user_id
                            INNER JOIN area as a ON s.area_id = a.id_area
                            INNER JOIN schools as school ON s.school_id = school.id_school
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" AND
                            rts.isset_iom = ${iom} `
        const students = await schoolsObj.create(sql)
        if(students.length <= 0) {
            response.status(201, {},res)
        }else {
            response.status(200,
                students,res)
            return true
        }

    }catch (e) {
        return e
    }
}