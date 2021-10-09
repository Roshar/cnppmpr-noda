'use strict'
const uniqid = require('uniqid');
const response = require('./../response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const DB = require('./../settings/db')
const config = require('./../dbenv')
const nodemailer = require('nodemailer')
const tblMethod = require('./../use/tutorTblCollection')


exports.signup = async (req, res) => {
    try{
        const {login, password, confirmPassword, first_name, surname, patronymic="", area="", school="", phone, discipline, gender } = req.body
        let id_user = uniqid()
        let role;
        let sqlOption;
        let sqlFail;
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        const dbObj = new DB()
        let result = await dbObj.create(sql)

        if (result.length) {
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        } else if(password != confirmPassword) {
            response.status(400, {message:'Пароль не был корректно подтвержден. Пароль и подтверждение должны совпадать'},res)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)

            if(req.body.code && req.body.code == "5808"){
                role = "tutor"
                sqlOption = "INSERT INTO `tutors`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`gender`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + gender + "')";
            }else{
                role = "student"
                sqlOption = "INSERT INTO `students`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`area_id`,`school_id`,`gender`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + area + "','" + school + "','" + gender + "')";
            }
            let sqlUser = "INSERT INTO `users`(`id_user`,`login`,`password`,`role`) VALUES ('" + id_user + "','" + login + "','" + hashPass + "','" + role + "')";
            let result  = await dbObj.create(sqlUser)
            let result2  = await dbObj.create(sqlOption)
            const tblCollection = tblMethod.tbleCollection(id_user)

            if(role === "tutor") {
                const tutorOptions = "INSERT INTO `global_workplace_tutors` (`user_id`,`table_iom`,`table_student`,`table_mentor`,`table_report`,`table_library`,`table_sub_type_iom`,`discipline_id`) VALUES ('" + id_user + "','" + tblCollection.iom + "','" + tblCollection.student + "','" + tblCollection.mentor + "','" + tblCollection.report + "','" + tblCollection.library + "','" + tblCollection.subTypeTableIom + "','" + discipline + "')";
                const generationIom = `CREATE TABLE ${tblCollection.iom} (id SERIAL NOT NULL, iom_id VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT NULL DEFAULT NULL ) ENGINE = InnoDB`;
                const generationStudents = `CREATE TABLE ${tblCollection.student} (id SERIAL NOT NULL, student_id VARCHAR(255) NOT NULL , iom_id VARCHAR(255) NOT NULL ) ENGINE = InnoDB`;
                const generationMentors = `CREATE TABLE ${tblCollection.mentor} (id SERIAL NOT NULL, firstname VARCHAR(255) NOT NULL ,lastname VARCHAR(255) NOT NULL, patronymic VARCHAR(255) DEFAULT NULL, area_id INT NOT NULL, discipline_id INT NOT NULL) ENGINE = InnoDB`;
                const generationReports = `CREATE TABLE ${tblCollection.report} ( id SERIAL NOT NULL ,iom_id VARCHAR(255) NOT NULL , student_id VARCHAR(255) NOT NULL , exercises_id INT NOT NULL , tag_id INT NOT NULL, link VARCHAR(255) NULL DEFAULT NULL ) ENGINE = InnoDB`;
                const generationLibrary = `CREATE TABLE ${tblCollection.library} (id SERIAL NOT NULL, user_id VARCHAR(255) NULL DEFAULT NULL , title VARCHAR(255) NULL DEFAULT NULL , link VARCHAR(255) NULL DEFAULT NULL , description TEXT NULL DEFAULT NULL , tag_id INT NOT NULL ) ENGINE = InnoDB`;
                const generationSubtypeIom = `CREATE TABLE ${tblCollection.subTypeTableIom} ( id_exercises SERIAL NULL DEFAULT NULL , iom_id VARCHAR(255) NOT NULL , title VARCHAR(255) NOT NULL , description TEXT NULL DEFAULT NULL , link VARCHAR(255) NULL DEFAULT NULL , author VARCHAR(255) NULL DEFAULT NULL , term DATE NULL DEFAULT NULL , tag_id INT NOT NULL) ENGINE = InnoDB;`
                await dbObj.create(tutorOptions)
                await dbObj.create(generationIom)
                await dbObj.create(generationStudents)
                await dbObj.create(generationMentors)
                await dbObj.create(generationReports)
                await dbObj.create(generationLibrary)
                await dbObj.create(generationSubtypeIom)
            }

            if(result && result2){
                response.status(200,{message:'Регистрация прошла успешно!'},res)
            }else{
                if(result){
                    sqlFail = `DELETE FROM users WHERE login = "${login}"`
                    await dbObj.create(sqlFail)
                }
                response.status(400,{message:'Не получилось зарегистрировать пользователя!'},res)
            }
        }
    }catch (e) {
        response.status(401,{message:'Ошибка соединения с БД'},res)
    }
}

exports.singin = async (req, res) => {
    try {
        const {login, password} = req.body
        const sql = `select id, id_user, login, password, role, status from users where login = "${login}"`;
        const obj = new DB()
        const rows = await obj.create(sql)

        if(rows.length <= 0){
            response.status(401, {message:`Пользователь с таким email ${login} не найден!`},res)
            return false
        } else {
            if(rows[0].password){
                const passwordTrue = bcrypt.compareSync(password, rows[0].password)
                if(passwordTrue) {
                    //генерируем токен
                    const token = jwt.sign({
                        userId: rows[0]['id_user'],
                        login: rows[0].login,
                        role: rows[0].role,
                        status: rows[0].status,
                    },config.jwt, {
                        expiresIn: 120 * 120
                    })
                    const sql2 = "INSERT INTO `authorization`(`token_key`,`login`,`user_id`,`role`,`status`) VALUES ('" + `Bearer ${token}` + "','" + rows[0].login + "','" + rows[0]['id_user'] + "','" + rows[0].role + "','" + rows[0].status + "')"
                    const row2 = await obj.create(sql2)
                    if(!row2){
                        response.status(400,{message:'Ошибка при авторизации, попробуйте снова'},res)
                        return false
                    }
                    response.status(200,
                        {token: `Bearer ${token}`,
                            login: rows[0].login,
                            role: rows[0].role,
                            status: rows[0].status,
                            userId: rows[0]['id_user']},res)
                } else {
                    response.status(401, {message:`Пароль не верный.`},res)
                }
            }
            return true
        }

    } catch (e) {
        response.status(401,{message:'Ошибка соединения с БД'},res)
    }
}

exports.logout = async (req, res) => {
    try{
        const token = req.body.token
        const sql = 'DELETE FROM `authorization` WHERE `token_key` = "' + `${token}` +'"'
        const obj = new DB()
        const rows = await obj.create(sql)
        response.status(200, {"result":rows}, res)
    } catch (e) {
        console.log("Ошибка при выходе")
    }
}

exports.sendCodeToMail = async(req, res) => {
    const token = req.body.token

    try {
        const sql = 'SELECT login, token_key FROM `authorization` WHERE token_key = "'+  token + '"'
        const dbObj = new DB()
        const result = await dbObj.create(sql)
        if(result) {
            const login = result[0].login
            let testEmailAccount = await nodemailer.createTestAccount()
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: 'ipkrochr@gmail.com',
                    pass: '99o99o99o',
                },
            })

            const code = await Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            // console.log('code ' + code)
            const coder = code + 'r'
            const salt = bcrypt.genSaltSync(10);
            const hashcode = bcrypt.hashSync(coder,salt)

            const emailResult = await transporter.sendMail({
                from: '"ГБУ ДПО "ИРО ЧР"" ipkrochr@gmail.com',
                to: login,
                subject: 'Attachments',
                text: 'Ваш код доступа: '+ code
            })
            console.log(emailResult)
            response.status(200,{
                message:'На ваш электронный адрес выслали письмо с кодом подтверждения',
                code: hashcode
            },res)
        }else {
            response.status(400,{message:'Ошибка при подтверждении'},res)
        }
    } catch(e) {
        console.log(e)
    }
}

exports.confirmcode = async (req, res) => {
    const code = req.body.code
    const token = req.body.token
    const hash = req.body.hash

    const match = bcrypt.compareSync(code, hash)

    if(match) {
        const dbObj = new DB()
        const sql1 = 'SELECT login FROM `authorization` where `token_key` = "' + token + '"';
        const result = await dbObj.create(sql1)
        console.log(result)
        if(result) {
            const sql2  = 'UPDATE `users` SET `status`= "on" WHERE `login` = "' + result[0].login +'"';
            const sql3  = 'UPDATE `authorization` SET `status`= "on" WHERE `login` = "' + result[0].login +'"';
            const res2 = await dbObj.create(sql2)
            const res3 = await dbObj.create(sql3)
            if(!res2 || !res3) {
                console.log('Неизвестная ошибка 2 уровня')
            }
            response.status(200,
                {},res)
        }else {
            console.log('Неизвестная ошибка 1 уровня')
        }
    }

}

exports.recovery = async (req, res) => {
    if(req.body.recovery){
        let login = req.body.recovery
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        const dbObj = new DB()
        let result = await dbObj.create(sql)

        if(result.length) {
            const salt = bcrypt.genSaltSync(10);
            const hashcode = bcrypt.hashSync(login,salt)
            const checkInRecoveryTbl = `SELECT id FROM recovery WHERE login = "${login}"`
            const result1 = await dbObj.create(checkInRecoveryTbl)
            if(result1.length >1) {
                response.status(400,{message:'На указанный вами адрес были уже отправлены ссылки для восстановления! Проверьте свою почту. Если вам не пришло письмо с ссылкой для восстановления свяжитесь с администрацией портала'},res)
            }else {
                const insertInrecoveryTbl = "INSERT INTO `recovery` (`login`,`hash`) VALUES ('"+ login + "','" + hashcode + "')";
                const result2 = await dbObj.create(insertInrecoveryTbl)
                console.log(result2)
                let testEmailAccount = await nodemailer.createTestAccount()
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: 'ipkrochr@gmail.com',
                        pass: '99o99o99o',
                    },
                })

                const emailResult = await transporter.sendMail({
                    from: '"ГБУ ДПО "ИРО ЧР"" ipkrochr@gmail.com',
                    to: login,
                    subject: 'Восстановление пароля',
                    text: 'Здравствуйте!',
                    html: `<p>Чтобы сбросить пароль от личного кабинета на cnppmpr.ru, перейдите по ссылке </p>
                    <a href="http://localhost:8080/recovery?link=${hashcode}"`
                })
                console.log(emailResult)
                response.status(200,{
                    message:'На ваш электронный адрес выслали письмо с ссылкой для подтверждения',
                    code: hashcode
                },res)
            }
        }else {
            response.status(400,{message:'Такой пользователь не найден,проверьте корректность email адреса'},res)
        }
    }
}

exports.recoverychecklink = async (req, res) => {
    if(req.body.link){
        let link = req.body.link
        const sql = `SELECT * FROM recovery WHERE hash = "${link}"`;
        const dbObj = new DB()
        let result = await dbObj.create(sql)
        console.log(sql)
        if(result.length) {
            const recoverySql = `DELETE FROM recovery WHERE hash = "${link}"`  ;
            const result2 = await dbObj.create(recoverySql)
            response.status(200,{
                message:'Придумайте новый пароль',
                code: true
            },res)
        }else {
            response.status(400,{message:'Ошибка, неккоректная ссылка'},res)
        }
    }
}

exports.changepassword = async (req, res) => {
    const {login, password, confirmPassword} = req.body
    console.log(req.body)
    // return false
    if(login){
        if(password != confirmPassword){
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        }else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)
            const sql = `UPDATE users SET password = "${hashPass}"  WHERE login =  "${login}" `;
            const dbObj = new DB()
            await dbObj.create(sql)
            const sql2 = `DELETE FROM recovery WHERE login = "${login}"`
            await dbObj.create((sql2))
            response.status(200, {message: "Пароль успешно изменен!"}, res)
        }
    }else {
        response.status(401, {message: "Ошибка при выполнении операции, обратитесь к администратору"}, res)
    }
}




exports.getRole = async (req, res) => {
    try{
        const token = req.body.token
        const sql = 'SELECT role, status FROM `authorization` WHERE `token_key` = "' + `${token}` +'"'
        const obj = new DB()
        const rows = await obj.create(sql)
        if(rows) {
            response.status(200,{
                role: rows[0].role,
                status:rows[0].status }, res)
        }else {
            response.status(401, {}, res)
        }
    } catch (e) {

    }
}
