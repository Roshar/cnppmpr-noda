'use strict'
const response = require('./../response')
const userId = require('./../use/getUserId')
const getTerm = require('./../use/getTerm')


/**
 * Завершение обучения
 * проверка количества заданий в [id_tutor]_subTypeTableIom
 * проверка количества пройденных заданий слушателем в [id_tutor]_report
 * при условии что совпадают значения меняем статус в relationship_student_iom на выполненный
 * добавляем  в таблицу global_history_education_rows данные (таблица в которой будут хранится записи завершивших обучение)
 * добавляем в global_recall отзыв и оценку
 * TODO сделать транзакцию при выполнении всех операции
 * ПРОФИЛЬ СЛУШАТЕЛЯ
 */

exports.studentEducation = async(req,res) => {
    try {
        const {iomId, token, tutorId, recall, mark} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];

        let getCountExercisesByIOMSQL = `SELECT t1.id_exercises, t2.title  FROM a_exercise as t1 
                                         INNER JOIN a_iom as t2 ON t1.iom_id = t2.iom_id
                                         WHERE t1.iom_id = "${iomId}"`

        let [getCountExercisesByIOM] = await req.db.execute(getCountExercisesByIOMSQL)

        let getCountReportsByIOMSQL = `SELECT id FROM a_report WHERE iom_id = "${iomId}"
                                        AND student_id = "${studentId}" AND accepted = 1`

        let [getCountReportsByIOM] = await req.db.execute(getCountReportsByIOMSQL)


        if(!getCountExercisesByIOM.length || !getCountReportsByIOM.length) {
            response.status(201, {message: 'Возникла ошибка при выполнении операции. Обратитесь к тьютору'},res)
        }else if(getCountExercisesByIOM.length === getCountReportsByIOM.length ) {

            let addStatusOfFinishedEducationSQL = `UPDATE relationship_student_iom
                                                      SET status = 1, date_finished_education = CURRENT_TIMESTAMP WHERE user_id = "${studentId}" 
                                                      AND tutor_id = "${tutorId}" AND iom_id = "${iomId}"`


            const recallSql = `INSERT INTO global_recall (student_id, tutor_id,iom_id, mark, comment)
                           VALUES ("${studentId}","${tutorId}","${iomId}", ${mark}, "${recall}" )`

            const addInHistoryTblSql = `INSERT INTO global_history_education_rows (tutor_id, student_id,iom_id, iom_title)
                           VALUES ("${tutorId}","${studentId}","${iomId}", "${getCountExercisesByIOM[0]['title']}")`

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
 * ПРОФИЛЬ СЛУШАТЕЛЯ
 */

exports.checkStudentIOM = async(req,res) => {
    try {
        const {iomId, token, tutorId} = req.body
        const student = await userId(req.db,token)
        const studentId = student[0]['user_id'];
        let checkSQL = `SELECT id  FROM relationship_student_iom 
                                         WHERE iom_id = "${iomId}" AND user_id = "${studentId}" 
                                         AND tutor_id = "${tutorId}"
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
 * ДЛЯ СЛУШАТЕЛЯ
 **/

exports.getFinishedCourses = async(req,res) => {
    try {
        const {studentId} = req.body

        let iomInfoSql = `SELECT t1.iom_title, DATE_FORMAT(t1.created_at, '%d-%m-%Y') as dt , t2.name, t2.surname, t2.patronymic 
                          FROM global_history_education_rows as t1
                          INNER JOIN tutors as t2 ON t1.tutor_id = t2.user_id
                          WHERE t1.student_id = "${studentId}"`
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
 *  Создание итогового отчета по слушателю
 *  сгенерировать в случае, если нет отчета
 *  скачать в случае, если ранее отчет был сформирован
 */

exports.generationReportByStudentEducation = async(req,res) => {

        const {student_id, iom_id, token} = req.body

        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        // Получаем информацию о тьюторе для отражения в отчете
        const tutorInfoSql = `SELECT  tutors.name, tutors.surname, tutors.patronymic, tutors.phone FROM tutors WHERE tutors.user_id = "${tutorId}"`
        const [tutorInfo] = await req.db.execute(tutorInfoSql)

        // Получаем информацию о слушателе для отражения в отчете
        const studentInfoSql = `SELECT students.name, students.surname, students.patronymic,
                        students.phone,students.gender, schools.school_name, area.title_area, 
                        discipline.title_discipline,DATE_FORMAT(students.birthday, '%d.%m.%Y') as birthday
                        FROM students  
                        INNER JOIN schools ON students.school_id = schools.id_school 
                        INNER JOIN area ON students.area_id = area.id_area 
                        INNER JOIN discipline ON students.discipline_id = discipline.id_dis
                        WHERE students.user_id = "${student_id}"`
        const [studentInfo] = await req.db.execute(studentInfoSql)


        // получаем дополнительную информацию по студенту в случае, если она есть
        let studentAdditionallySql = `SELECT sad.id,
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
                          WHERE sad.student_id = "${student_id}"`

        const [additionallyData] = await req.db.execute(studentAdditionallySql)


        // Получаем общую информацию о ИОМ по id
        const iomInfoSql = `SELECT iom_id,title,description FROM a_iom  WHERE iom_id = "${iom_id}" LIMIT 1`
        const [iomInfo] = await req.db.execute(iomInfoSql)

        // Получаем содержимое заданий из текущего ИОМ
        const exerciseSql = `SELECT 
                             t.id_exercises,
                                t.iom_id, 
                                t.title,
                                t.description,
                                t.link,
                                t.mentor,
                                tag.id_tag,
                                tag.title_tag,
                                DATE_FORMAT(t.term, '%d.%m.%Y') as term,
                                t.tag_id,
                                level.title as level_title, 
                                level.id as level_id 
        FROM a_exercise as t 
        INNER JOIN tag ON t.tag_id = tag.id_tag
        INNER JOIN global_iom_levels as level ON t.iom_level_id = level.id  
        WHERE t.iom_id = "${iom_id}" ORDER BY level.id ASC`

        const [exerciseData] = await req.db.execute(exerciseSql)


        if(exerciseData.length) {
            let arr = [];
            for(let i = 0; i < exerciseData.length; i++) {
                 exerciseData[i]['term'] = getTerm(exerciseData[i]['term'])
                 arr.push(exerciseData[i])
            }
        }

        let pdf = require("pdf-creator-node");
        let fs = require("fs");

        if(studentInfo.length && tutorInfo.length && iomInfo.length && exerciseData.length) {
            // передаем шаблон отчета
            let html = fs.readFileSync('template.html', "utf8");

            let options = {
                format: "A3",
                orientation: "landscape",
                border: "10mm",
                header: {
                    height: "45mm",
                    contents: '<div style="text-align: center;"></div>'
                },
                footer: {
                    height: "28mm",
                    contents: {
                        first: '',
                        // 2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                        last: ''
                    }
                }
            };

            const dd = new Date()
            let document = {
                html: html,
                data: {
                    exercises: exerciseData,
                    student: studentInfo[0],
                    tutor: tutorInfo[0],
                    iom: iomInfo[0],
                    addInfo: additionallyData[0]
                },
                path: "./uploads/report/" + dd.getFullYear() + '/'+ tutorId +'/'+ iom_id +'/' + student_id + ".pdf",
                type: "",
            };

            await pdf
                .create(document, options)
                .then((result) => {
                    let position = result['filename'].search("uploads");
                    let linkInfo = result['filename'].substr(position);
                    const insertIntoRsiSql = `UPDATE relationship_student_iom SET dump_link = "${linkInfo}" 
                                               WHERE user_id = "${student_id}" AND iom_id = "${iom_id}"`
                    req.db.execute(insertIntoRsiSql)
                    response.status(200, {message: 'Отчет сформирован!'}, res)
                })
                .catch((error) => {
                    console.error(error);
                    response.status(201, {message: error}, res)
                });
        }


}

/**
 * Получить всех слушателей завершивших обучение, а также группу (поток)
 * Для ТЬЮТОРА
 **/
exports.getStudentsForTutor = async(req,res) => {
    try {
        const {token} = req.body
        const tutor = await userId(req.db,token)
        const tutorId = tutor[0]['user_id'];

        let studentsSql = `SELECT rsi.iom_id, DATE_FORMAT(rsi.date_finished_education, '%d.%m.%Y') as end_education,
                                         DATE_FORMAT(rsi.created_at, '%d.%m.%Y') as start_education,
                                         rsi.dump_link,
                                         iom.title,s.user_id, s.name, s.surname, s.patronymic,
                                         school.school_name,area.title_area
                                         FROM relationship_student_iom as rsi
                                         INNER JOIN a_iom as iom ON rsi.iom_id = iom.iom_id
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

