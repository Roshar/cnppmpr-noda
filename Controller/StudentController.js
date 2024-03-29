'use strict'
const response = require('./../response')
const userId = require('./../use/getUserId')

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
                        WHERE rts.t_user_id = "${tutorId}" AND finished_education = 0`
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

/**
 * Получить уровни образования
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * Профиль СЛУШАТЕЛЬ
 */


exports.getEducationLevels = async(req, res) => {
    try {

        let iomSql = `SELECT *  FROM students_additionally_education`

        const [data] = await req.db.execute(iomSql)
        if(data.length <= 0) {
            response.status(201, [],res)
        }else {
            response.status(200,
                data,res)
            return true
        }

    }catch (e) {
        return e
    }
}

/**
 * Получить дополнительную информацию о слушателе
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * КАТЕГОРИЯ
 * ОБРАЗОВАНИЕ
 * ПЕДАГОГИЧЕСКИЙ СТАЖ
 * ДОЛЖНОСТЬ
 * РЕЗУЛЬТАТЫ ПРОФ ДИАГНОСТИК
 * ИНДИВИДУАЛЬНЫЙ ЗАПРОС
 * Профиль СЛУШАТЕЛЬ
 */

exports.getStudentAdditionallyOptionById = async(req, res) => {
    try {
        const studentId = req.body.studentId
        let iomSql = `SELECT sad.id,
                             edu_level.title as edu_level_title, 
                             sad.education_id as edu_level_id,
                             categ.title as category_title,
                             sad.category_id as category_id,
                             ex.title as experience_title,
                             sad.edu_experience_id as experience_id,
                             sad.position_id as position_id,
                             pos.title as position_title,
                             sad.prof_result as profresult_title,
                             sad.individual_request as individual_request_title
                             FROM students_additionally as sad
                      LEFT OUTER JOIN students_additionally_education as edu_level ON sad.education_id = edu_level.id
                      LEFT OUTER JOIN students_additionally_categories as categ ON sad.category_id = categ.id
                      LEFT OUTER JOIN students_additionally_experience as ex ON sad.edu_experience_id = ex.id
                      LEFT OUTER JOIN students_additionally_positions as pos ON sad.position_id = pos.id
                      WHERE sad.student_id = "${studentId}"`
        const [data] = await req.db.execute(iomSql)
        if(data.length <= 0) {
            response.status(201, null,res)
        }else {
            response.status(200,
                data,res)
            return true
        }

    }catch (e) {
        return e
    }
}


/**
 * получить профессия
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * профиль СЛУШАТЕЛЬ
 */

exports.getPositions = async(req, res) => {
    try {

        let iomSql = `SELECT *  FROM students_additionally_positions`

        const [data] = await req.db.execute(iomSql)

        if(data.length <= 0) {
            response.status(201, [],res)
        }else {
            response.status(200,
                data,res)
            return true
        }

    }catch (e) {
        return e
    }
}

/**
 * получить список со стажем
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * профиль СЛУШАТЕЛЬ
 */

exports.getExperience = async(req, res) => {
    try {

        let iomSql = `SELECT *  FROM students_additionally_experience`

        const [data] = await req.db.execute(iomSql)

        if(data.length <= 0) {
            response.status(201, [],res)
        }else {
            response.status(200,
                data,res)
            return true
        }

    }catch (e) {
        return e
    }
}

/**
 * получить список категорий учителей
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * профиль СЛУШАТЕЛЬ
 */

exports.getCategoryTeach = async(req, res) => {
    try {

        let iomSql = `SELECT *  FROM students_additionally_categories`

        const [data] = await req.db.execute(iomSql)

        if(data.length <= 0) {
            response.status(201, [],res)
        }else {
            response.status(200,
                data,res)
            return true
        }

    }catch (e) {
        return e
    }
}

/**
 * добавить или изменть дополнительную информацию о слушателе
 * ДЛЯ РАЗДЕЛА ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О СЛУШАТЕЛЕ
 * профиль СЛУШАТЕЛЬ
 */

exports.insertOrUpdateAdditionally = async(req, res) => {

    try {

        const {studentId,
            category_id = 0,
            edu_experience_id = 0,
            education_id = 0,
            position_id = 0,
            prof_result = '',
            individual_request = ''} = req.body
        const issetRowSql = `SELECT id  FROM students_additionally WHERE student_id = "${studentId}"`
        const [issetRowData] = await req.db.execute(issetRowSql)

        if(issetRowData.length <= 0) {
            const insertSql = `INSERT INTO students_additionally (student_id, education_id, position_id, edu_experience_id, 
                                                                  category_id,prof_result, individual_request)
                                            VALUES ("${studentId}", ${education_id}, ${position_id},${edu_experience_id},
                                                    ${category_id},"${prof_result}", "${individual_request}")`
            const [insertData] = await req.db.execute(insertSql)
            if(insertData.insertId) {
                response.status(200, {message:'Информация добавлена'},res)
            }else{
                response.status(201,{message:'Ошибка'} ,res)
            }
        }else {
            const updateSQl = `UPDATE students_additionally 
                               SET education_id = ${education_id},
                               position_id = ${position_id},
                               edu_experience_id = ${edu_experience_id},
                               category_id = ${category_id},
                               prof_result = "${prof_result}",
                               individual_request = "${individual_request}"
                               WHERE student_id="${studentId}"`
            const [updateData] = await req.db.execute(updateSQl)
            if(updateData.affectedRows) {

                response.status(200, {message:'Изменения сохранены'},res)

            }else{
                response.status(201,{message:'Ошибка'} ,res)
            }

        }

    }catch (e) {
        return e
    }
}

/**
 * Участники ИОМа
 * получить всех участников, для которых назначет текущий ИОМ
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.getUsersFromIomEducation = async(req, res) => {
    try {
        const {filter, iomId, param} = req.body
        if(!filter) {
            const sql = `SELECT rsi.user_id as student_id, s.name, s.surname, s.surname, s.patronymic,
                                 s.area_id, s.school_id, s.gender, a.title_area, school.school_name,rsi.status 
                          FROM relationship_student_iom as rsi
                          INNER JOIN students as s ON rsi.user_id = s.user_id
                          INNER JOIN area as a ON s.area_id = a.id_area
                          INNER JOIN schools as school ON s.school_id = school.id_school
                          WHERE rsi.iom_id = "${iomId}"`

            const [students] = await req.db.execute(sql)

            if(students.length <= 0) {
                response.status(201, {},res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }else {
            const sql = `SELECT rsi.user_id as student_id, s.name, s.surname, s.surname, s.patronymic,
                                 s.area_id, s.school_id, s.gender, a.title_area, school.school_name 
                          FROM relationship_student_iom as rsi 
                          INNER JOIN students as s ON rsi.user_id = s.user_id
                          INNER JOIN area as a ON s.area_id = a.id_area
                          INNER JOIN schools as school ON s.school_id = school.id_school 
                          WHERE rsi.iom_id = "${iomId}"
                          AND (s.name LIKE "${param}%" OR s.surname LIKE "${param}%") LIMIT 1`
            const [students] = await req.db.execute(sql)

            if(students.length <= 0) {
                response.status(201, [],res)
            }else {
                response.status(200,
                    students,res)
                return true
            }
        }

    }catch (e) {
        console.log(e.message)
    }
}

/**
 * получить количество завершивших текущий ИОМ (для проверки готовности отправить статус о  завершении обучении учащихся по текущему ИОМу)
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.getUsersFinishedIom = async(req, res) => {
    try {
        const {iomId } = req.body

        const sql = `SELECT COUNT(*) as finishedCount
                      FROM relationship_student_iom as rsi WHERE iom_id = "${iomId}" AND status = 1`

        const [students] = await req.db.execute(sql)


        if(students.length <= 0) {
            response.status(201, [],res)
        }else {
            response.status(200,
                students[0]['finishedCount'],res)
            return true
        }

    }catch (e) {
        console.log(e.message)
    }
}


/**
 * отписать пользователя от ИОМа
 * предварительно проверив возможность отписать
 * (те, кто уже начал обучение, т.е отправил отчеты о выполнении заданий из ИОМ, не могут быть удалены)
 * ПРОФИЛЬ ТЬЮТОРА
 */
exports.deleteStudentFromIomEducation = async(req, res) => {
    try {
        const {studentId, iomId, token} = req.body
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        const sqlCheckPossibility = `SELECT COUNT(id) as id FROM a_report WHERE iom_id = "${iomId}"
                                     AND student_id="${studentId}"`
        const [checkPossibility] = await req.db.execute(sqlCheckPossibility)

        if(!checkPossibility[0].id) {

            const deleteInTutorTblLocalSql = `DELETE FROM relationship_student_iom WHERE iom_id = "${iomId}" AND user_id = "${studentId}" AND tutor_id = "${tutorId}"`
            const [result] = await req.db.execute(deleteInTutorTblLocalSql)

            if(result.affectedRows) {
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

        const insertInRelationship_student_iom = `INSERT INTO relationship_student_iom (user_id, tutor_id, iom_id) VALUES ("${studentId}","${tutorId}", "${iomId}")`
        const [result] = await req.db.execute(insertInRelationship_student_iom)

        if(result.insertId) {
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
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" AND finished_education = 0`
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

/**
 * получить слушателей по полу и району
 * профиль ТЬЮТОРА
 */
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
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" 
                            AND s.area_id = ${areaId} AND finished_education = 0`
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


/**
 * получить слушателей по полу и району и ИОМу
 * профиль ТЬЮТОРА
 */

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
                            WHERE rts.t_user_id = "${tutorId}" AND s.gender = "${gender}" 
                            AND s.area_id = ${areaId} AND
                            rts.isset_iom = ${iom} AND finished_education = 0`
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


/**
 * получить слушателей по району и ИОМу
 * профиль ТЬЮТОРА
 */

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
                            rts.isset_iom = ${iom} AND finished_education = 0`
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



/**
 * получить слушателей по ИОМу
 * профиль ТЬЮТОРА
 */

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
                            WHERE rts.t_user_id = "${tutorId}" AND rts.isset_iom = ${iom} AND finished_education = 0`
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


/**
 * получить слушателей по району
 * профиль ТЬЮТОРА
 */
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
/**
 * получить слушателей по полу  и ИОМу
 * профиль ТЬЮТОРА
 */
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
                            rts.isset_iom = ${iom} AND finished_education = 0`
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

/**
 * получить активный ИОМ со статусом 0 (0 - означает, что текущий ИОМ не заврешен, т.е. активен)
 *  ПРОФИЛЬ СЛУШАТЕЛЬ
 */
exports.checkIssetMyIom = async(req, res) => {
    try {
        const studentId = req.body.studentId
        const tutorId = req.body.tutorId
        let iomSql = ` SELECT rsi.iom_id,iom.title FROM 
                        relationship_student_iom as rsi 
                        INNER JOIN a_iom  as iom
                        ON  rsi.iom_id = iom.iom_id
                        WHERE rsi.user_id = "${studentId}"
                        AND rsi.tutor_id = "${tutorId}"  AND rsi.status = 0`

        let [result] = await req.db.execute(iomSql)

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {
        return e
    }
}



/**
 * получить статистику о прохождении ИОМа
 * - Количество выполненных заданий
 * - Количество заданий требующих доработку
 * - Количество заданий на проверке
 * - Количество незавершенных заданий
 * ПРОФИЛЬ СЛУШАТЕЛЯ
 */
exports.getStatisticByIOM = async(req, res) => {
    try {
        const {iomId, userId} = req.body
        let finishedTaskSQL = `SELECT COUNT(id) as id FROM a_report WHERE iom_id = "${iomId}" 
                       AND student_id = "${userId}" AND accepted = 1`
        let onEditTaskSQL = `SELECT COUNT(id) as id FROM a_report WHERE iom_id = "${iomId}" 
                       AND student_id = "${userId}" AND accepted = 2`
        let pendingTaskSQL = ` SELECT COUNT(id) as id FROM a_report WHERE iom_id = "${iomId}"
                       AND student_id = "${userId}" AND on_check = 1`

        let [finishedTask] = await req.db.execute(finishedTaskSQL)
        let [onEditTask] = await req.db.execute(onEditTaskSQL)
        let [pendingTask] = await req.db.execute(pendingTaskSQL)

        const result = [finishedTask,onEditTask,pendingTask]

        if(!result.length) {
            response.status(201, [],res)
        }else {
            response.status(200,
                result,res)
            return true
        }
    }catch (e) {
        return e
    }
}


/**
 * получаем все задания из назначенного ИОМа
 * профиль студент
 */
exports.getExercisesFromMyIom = async(req, res) => {
    try {
        const {iomId, token} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];

        let iomSql = `SELECT sub.id_exercises, sub.iom_id,sub.mentor, sub.title, sub.description, 
                              DATE_FORMAT(sub.term, '%d.%m.%Y') as term, 
                              sub.tag_id, sub.link, t.id_tag,t.title_tag,report.accepted, report.on_check
                        FROM a_exercise as sub
                        INNER JOIN tag as t ON sub.tag_id = t.id_tag 
                        LEFT OUTER JOIN a_report as report ON sub.id_exercises = report.exercises_id 
                        AND report.student_id = "${studentId}"
                        WHERE sub.iom_id = "${iomId}"`

        let [result] = await req.db.execute(iomSql)

        let distinct = `SELECT DISTINCT sub.tag_id,t.title_tag  FROM a_exercise as sub
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

/**
 * получить задание из ИОМа сшулателя для добавления ответа или внесения изменений
 * ПРОФИЛЬ СЛУШАТЕЛЯ
 */
exports.getMyTaskById = async(req, res) => {

    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            let taskSql = `SELECT    
                            t.id_exercises,
                            t.iom_id, 
                            t.title,
                            t.description,
                            t.link,
                            t.mentor,
                            tag.id_tag,
                            tag.title_tag,
                            report.accepted,
                            report.tutor_comment,
                            report.content,
                            report.link as report_link,
                            report.id as report_id,
                            DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                            t.tag_id FROM a_exercise as t 
                            INNER JOIN tag ON t.tag_id = tag.id_tag
                            LEFT OUTER JOIN a_report as report ON t.id_exercises = report.exercises_id
                            AND report.student_id = "${studentId}"
                            WHERE t.iom_id = "${iomId}" AND t.id_exercises = "${taskId}"`
            let [taskData] = await req.db.execute(taskSql)
            taskData[0].studentId = studentId
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
/**
 * Получить все комментарии к заданию
 * комментарии могут быть от всех слушателей, которые имееют такой же ИОМ и задание
 * ПРОФИЛЬ СТУДЕНТ
 */

exports.getCommentsByTask = async(req, res) => {
    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
           const tutorId = access[0]['tutor_id']

            let commentsSql = `SELECT com_tbl.sender_id, com_tbl.recipient_id, com_tbl.message, com_tbl.like,
                                      DATE_FORMAT(com_tbl.created_at, '%d-%m-%Y %H:%i:%s') as created_date,
                                      s.name, s.surname, s.avatar, t.avatar as tutor_avatar
                                FROM question_for_task  as com_tbl
                                LEFT OUTER JOIN students as s ON com_tbl.sender_id = s.user_id OR com_tbl.recipient_id = s.user_id
                                LEFT OUTER JOIN tutors as t ON com_tbl.sender_id = t.user_id OR com_tbl.recipient_id = t.user_id
                                WHERE com_tbl.iom_id = "${iomId}" AND com_tbl.task_id = "${taskId}" ORDER BY created_at DESC`

            let [comments] = await req.db.execute(commentsSql)
            if(!comments.length) {
                response.status(201, [],res)
            }else {
                comments[0].studentId = studentId
                response.status(200,
                    comments,res)
                return true
            }
        }else {
            response.status(404, {},res)
        }

    }catch (e) {
        return e
    }
}


/**
 * добавить комментарий (к заданию)
 * ПРОФИЛЬ СТУДЕНТ
 */
exports.sendCommentsForTask = async(req, res) => {

    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const tutorId = req.body.tutorId
        const content = req.body.content
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];

        const commentSql = `INSERT INTO question_for_task (task_id, iom_id, sender_id, recipient_id, message) VALUES (${taskId},"${iomId}","${studentId}","${tutorId}","${content}")`
        let [comment] = await req.db.execute(commentSql)
        if(!comment.insertId) {
            response.status(400, {message: 'Возникла временная ошибка, обратитесь к тьютору'},res)
        }else {
            response.status(200,
                {message: 'Комментарий добавлен'},res)
            return true
        }




    }catch (e) {
        return e
    }
}

/**
 * добавить ответ без файла
 * предварительно проверяя был ли отправлен ответ по текущему заданию
 * ПРОФИЛЬ СТУДЕНТА
 */
exports.insertInReportWithoutFile = async(req, res) => {
    try {

        const {link = '', content = '', iomId, taskId, category, token, files=null} = req.body
        // const iomId = req.body.iomId
        // const taskId = req.body.taskId
        // const token = req.body.token
        // const link = req.body.link ? req.body.link.trim() : ''
        // // const content = req.body.content.trim().replace(/<[^>]*>?/gm, '');
        // const content = req.body.content.trim();
        // const category = req.body.category
        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            const checkIssetReport = `SELECT id FROM a_report WHERE exercises_id =${taskId} AND iom_id = "${iomId}" AND student_id = "${studentId}"`
            let [checkData] = await req.db.execute(checkIssetReport)
            if(!checkData.length) {
                const taskSql = `INSERT INTO a_report (iom_id, student_id, tutor_id, exercises_id, tag_id, content, link, on_check)
                                 VALUES ("${iomId}","${studentId}","${access[0]['tutor_id']}", ${taskId},${category}, "${content}","${link}",1)`
                let [taskData] = await req.db.execute(taskSql)
                if(!taskData.insertId) {
                    response.status(400,
                        {message: 'Возникла временная ошибка, обратитесь к тьютору'},res)
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

/**
 * добавить ответ с файлом
 * предварительно проверяя был ли отправлен ответ по текущему заданию
 * ПРОФИЛЬ СТУДЕНТА
 */
exports.insertInReportWithFile = async(req, res) => {
    try {
        const fileName = req.file.filename
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const token = req.body.token
        const link = req.body.link.trim()
        const content = req.body.content.trim();
        const category = req.body.category

        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            const checkIssetReport = `SELECT id FROM a_report WHERE exercises_id = ${taskId} AND iom_id = "${iomId}" AND student_id = "${studentId}"`
            let [checkData] = await req.db.execute(checkIssetReport)
            if(!checkData.length) {
                const taskSql = `INSERT INTO a_report 
                                (iom_id, student_id, tutor_id, exercises_id, tag_id, content, link, file_path, on_check) 
                                VALUES 
                                ("${iomId}","${studentId}","${access[0]['tutor_id']}", ${taskId}, ${category}, "${content}","${link}","${fileName}",1)`
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


/**
 * в случаю, если ответ требовал внесений изменений
 * обновление ответа без файла
 * ПРОФИЛЬ СТУДЕНТА
 */
exports.updateInReportWithoutFile = async(req, res) => {
    try {
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const reportId = req.body.reportId
        const token = req.body.token
        const link = req.body.link.trim() || ''
        // const content = req.body.content.trim().replace(/<[^>]*>?/gm, '');
        const content = req.body.content.trim();

        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom 
            WHERE user_id = "${studentId}"  AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {
            const taskSql = `UPDATE a_report SET content ="${content}", link = "${link}",accepted = 0,
                             on_check = 1, created_at = CURRENT_TIMESTAMP 
                             WHERE id = ${reportId} AND exercises_id = ${taskId}`
            let [taskData] = await req.db.execute(taskSql)
            if(!taskData.affectedRows) {
                response.status(201, {message: 'Возникла временная ошибка, обратитесь к тьютору'},res)
            }else {
                response.status(200,
                    {message: 'Ваши изменения добавлены'},res)
            }

        }else {
            response.status(404, {},res)
        }

    }catch (e) {
        return e
    }
}


/**
 * в случаю, если ответ требовал внесений изменений
 * обновление ответа c файлом
 * ПРОФИЛЬ СТУДЕНТА
 */
exports.updateInReportWithFile = async(req, res) => {
    try {
        const fileName = req.file.filename
        const iomId = req.body.iomId
        const taskId = req.body.taskId
        const reportId = req.body.reportId
        const token = req.body.token
        const link = req.body.link.trim() || ''
        const content = req.body.content.trim();

        const id = await userId(req.db,token)
        const studentId = id[0]['user_id']
        const accessSQl = `SELECT tutor_id FROM relationship_student_iom 
                           WHERE user_id = "${studentId}" AND iom_id = "${iomId}"`
        let [access] = await req.db.execute(accessSQl)

        if(access.length) {

            const taskSql = `UPDATE a_report SET content ="${content}", link = "${link}", file_path="${fileName}", accepted = 0,
                             on_check = 1, created_at = CURRENT_TIMESTAMP
                             WHERE id = ${reportId} AND exercises_id = ${taskId}`
            let [taskData] = await req.db.execute(taskSql)

            if(!taskData.affectedRows) {
                response.status(201, {message: 'Возникла временная ошибка, обратитесь к тьютору'},res)
            }else {
                response.status(200,
                    {message: 'Ваши изменения добавлены'},res)
            }

        }else {
            response.status(404, {},res)
        }

    }catch (e) {
        return e
    }
}



