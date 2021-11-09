'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const userId = require('./../use/getUserId')
const tblMethod = require('./../use/tutorTblCollection')

exports.getStudentsForTutor = async(req, res) => {
    try {
        const {filter, token} = req.body
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];


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
        const [students] = await req.db.execute(sql)
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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        if(!filter) {
            const sql = `SELECT sub.student_id, s.name, s.surname, s.surname, s.patronymic,
                                 s.area_id, s.school_id, s.gender, a.title_area, school.school_name,rsi.status 
                          FROM ${tblCollection.student} as sub
                          INNER JOIN students as s ON sub.student_id = s.user_id
                          INNER JOIN area as a ON s.area_id = a.id_area
                          INNER JOIN relationship_student_iom as rsi ON rsi.user_id = sub.student_id
                          INNER JOIN schools as school ON s.school_id = school.id_school WHERE sub.iom_id = "${iomId}"`
            const [students] = await req.db.execute(sql)

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
            const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        const sqlCheckPossibility = `SELECT COUNT(id) as id FROM ${tblCollection.report} WHERE iom_id = "${iomId}"
                                     AND student_id="${studentId}"`
        const [checkPossibility] = await req.db.execute(sqlCheckPossibility)

        if(!checkPossibility[0].id) {
            const sql = `DELETE FROM ${tblCollection.student} WHERE iom_id = "${iomId}" AND student_id = "${studentId}"`
            const [result] = await req.db.execute(sql)

            const deleteInTutorTblLocalSql = `DELETE FROM relationship_student_iom WHERE iom_id = "${iomId}" AND user_id = "${studentId}" AND tutor_id = "${tutorId}"`
            const [result2] = await req.db.execute(deleteInTutorTblLocalSql)

            if(result.affectedRows && result2.affectedRows) {
                const sql2 = `UPDATE relationship_tutor_student SET isset_iom = 0 
                         WHERE s_user_id = "${studentId}" AND t_user_id = "${tutorId}"`
                const [result2] = await req.db.execute(sql2)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        if(!filter) {
            const sql = `SELECT rts.group_id, rts.isset_iom, s.user_id, s.name, s.surname, s.patronymic,  u.login,
                                s.school_id, school.school_name
                        FROM relationship_tutor_student as rts
                        INNER JOIN students as s ON rts.s_user_id = s.user_id
                        INNER JOIN schools as school ON s.school_id = school.id_school
                        INNER JOIN users as u ON s.user_id = u.id_user
                        WHERE rts.t_user_id = "${tutorId}" AND rts.isset_iom = 0`
            const [students] = await req.db.execute(sql)

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
            const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const tblCollection = tblMethod.tbleCollection(tutorId)
        const insertInTutorTblLocal = `INSERT INTO ${tblCollection.student} (student_id, iom_id) VALUES ("${studentId}", "${iomId}")`
        const [result] = await req.db.execute(insertInTutorTblLocal)

        const insertInRelationship_student_iom = `INSERT INTO relationship_student_iom (user_id, tutor_id, iom_id) VALUES ("${studentId}","${tutorId}", "${iomId}")`
        const [result3] = await req.db.execute(insertInRelationship_student_iom)

        if(result.insertId && result3.insertId) {
            const sql = `UPDATE relationship_tutor_student SET isset_iom = 1 
                         WHERE s_user_id = "${studentId}" AND t_user_id = "${tutorId}"`
            let [result2] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

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
        const [students] = await req.db.execute(sql)

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

exports.checkIssetMyIom = async(req, res) => {
    try {

        const studentId = req.body.studentId
        const tutorId = req.body.tutorId
        const tblCollection = tblMethod.tbleCollection(tutorId)
        let iomSql = ` SELECT rsi.iom_id,iom.title FROM 
                        relationship_student_iom as rsi 
                        INNER JOIN ${tblCollection.iom}  as iom
                        ON  rsi.iom_id = iom.iom_id
                        WHERE rsi.user_id = "${studentId}"
                        AND rsi.tutor_id = "${tutorId}"`

        let [result] = await req.db.execute(iomSql)
        if(!result.length) {
            response.status(200, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {
        return e
    }
}


//получаем все задания из назначенного иома | профиль студент
exports.getExercisesFromMyIom = async(req, res) => {
    try {

        const {iomId, tutorId} = req.body
        const tblCollection = tblMethod.tbleCollection(tutorId)
        let iomSql = ` SELECT sub.id_exercises, sub.iom_id,sub.mentor, sub.title, sub.description, 
                              DATE_FORMAT(sub.term, '%d.%m.%Y') as term, 
                              sub.tag_id, sub.link, t.id_tag,t.title_tag
                        FROM ${tblCollection.subTypeTableIom} as sub 
                        INNER JOIN tag as t ON sub.tag_id = t.id_tag 
                        WHERE sub.iom_id = "${iomId}"`
        let [result] = await req.db.execute(iomSql)

        let distinct = `SELECT DISTINCT sub.tag_id,t.title_tag  FROM ${tblCollection.subTypeTableIom} as sub
                        INNER JOIN tag as t ON sub.tag_id = t.id_tag  
                        WHERE sub.iom_id = "${iomId}"`
        let [result2] = await req.db.execute(distinct)

        const dataResult = [result,result2]
        if(!result.length) {
            response.status(200, [],res)
        }else {
            response.status(200,
                dataResult,res)
            return true
        }
    }catch (e) {
        return e
    }
}


exports.getMyTaskById = async(req, res) => {

    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            const tblCollection = tblMethod.tbleCollection(access[0]['tutor_id'])
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
            let [taskData] = await req.db.execute(taskSql)
            if(!taskData.length) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    taskData[0],res)
                return true
            }
        }else {
            response.status(404, {},res)
        }

    }catch (e) {
        return e
    }
}

exports.insertInReportWithoutFile = async(req, res) => {
    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const link = req.body.link.trim()
        const content = req.body.content.trim().replace(/<[^>]*>?/gm, '');
        const category = req.body.category

        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            const tblCollection = tblMethod.tbleCollection(access[0]['tutor_id'])
            const tbl = tblCollection.report
            const checkIssetReport = `SELECT id FROM ${tbl} WHERE exercises_id =${taskId} AND iom_id = "${iomId}" AND student_id = "${studentId}"`
            let [checkData] = await req.db.execute(checkIssetReport)
            if(!checkData.length) {
                const taskSql = `INSERT INTO ${tbl} (iom_id, student_id, exercises_id, tag_id, content, link) VALUES ("${iomId}","${studentId}",${taskId},${category}, "${content}","${link}")`
                let [taskData] = await req.db.execute(taskSql)
                if(!taskData.insertId) {
                    response.status(400, {message: 'Возникла временная ошибка, обратитесь к тьютору'},res)
                }else {
                    response.status(200,
                        {message: 'Ваш ответ принят'},res)
                    return true
                }
            }else {
                response.status(201, {message: 'Вы уже отправили отчет по этому заданию'},res)
            }


        }else {
            response.status(404, {},res)
        }

    }catch (e) {
        return e
    }
}



