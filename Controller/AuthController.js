'use strict'
const uniqid = require('uniqid');
const response = require('./../response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const DB = require('./../settings/db')
const config = require('./../dbenv')
const nodemailer = require('nodemailer')
const tblMethod = require('./../use/tutorTblCollection')
const { networkInterfaces } = require('os');
const generationAvatar = require('./../use/randomImage')

exports.signup = async (req, res) => {
    try{
        const {login, password, confirmPassword, first_name, surname, patronymic="", area="", school="", phone, discipline, gender, birthday="1000-01-01" } = req.body
        let id_user = uniqid()
        let role;
        let sqlOption;
        let sqlFail;
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        let [result] = await req.db.execute(sql)

        if (result.length) {
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        } else if(password != confirmPassword) {
            response.status(400, {message:'Пароль не был корректно подтвержден. Пароль и подтверждение должны совпадать'},res)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)

            //const avatar = await generationAvatar(req.body.gender)
            const avatar = 'no_avatar.png'

            if(req.body.code && req.body.code == "5808"){
                role = "tutor"
                sqlOption = "INSERT INTO `tutors`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`gender`,`birthday`, `avatar` ) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + gender + "','" + birthday + "','" + avatar + "')";
            } else if(req.body.code && req.body.code == "7777"){
                role = "admin"
                sqlOption = "INSERT INTO `admins`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`gender`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + gender + "','" + avatar + "')";
            }
            else{
                role = "student"
                sqlOption = "INSERT INTO `students`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`area_id`,`school_id`,`gender`,`birthday`, `avatar`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + area + "','" + school + "','" + gender + "','" + birthday + "','" + avatar + "')";
            }
            let sqlUser = "INSERT INTO `users`(`id_user`,`login`,`password`,`role`) VALUES ('" + id_user + "','" + login + "','" + hashPass + "','" + role + "')";
            let [result]  = await req.db.execute(sqlUser)
            let [result2]  = await req.db.execute(sqlOption)

            if(role === "student") {
                const insertSql = "INSERT INTO `admin_student_iom_status`(`student_id`) VALUES ('" + id_user + "')";
                await req.db.execute(insertSql)

            }

            if(role === "tutor") {
                const tblCollection = tblMethod.tbleCollection(id_user)
                const tutorOptions = "INSERT INTO `global_workplace_tutors` (`user_id`,`table_iom`,`table_student`,`table_mentor`,`table_report`,`table_library`,`table_sub_type_iom`,`discipline_id`) VALUES ('" + id_user + "','" + tblCollection.iom + "','" + tblCollection.student + "','" + tblCollection.mentor + "','" + tblCollection.report + "','" + tblCollection.library + "','" + tblCollection.subTypeTableIom + "','" + discipline + "')";
                const generationIom = `CREATE TABLE ${tblCollection.iom} (id SERIAL NOT NULL, iom_id VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT NULL DEFAULT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE = InnoDB`;
                const generationStudents = `CREATE TABLE ${tblCollection.student} (id SERIAL NOT NULL, student_id VARCHAR(255) NOT NULL , iom_id VARCHAR(255) NOT NULL ) ENGINE = InnoDB`;
                const generationMentors = `CREATE TABLE ${tblCollection.mentor} (id SERIAL NOT NULL, firstname VARCHAR(255) NOT NULL ,lastname VARCHAR(255) NOT NULL, patronymic VARCHAR(255) DEFAULT NULL, area_id INT NOT NULL, discipline_id INT NOT NULL) ENGINE = InnoDB`;
                const generationReports = `CREATE TABLE ${tblCollection.report} ( id SERIAL NOT NULL ,iom_id VARCHAR(255) NOT NULL , student_id VARCHAR(255) NOT NULL , exercises_id INT NOT NULL , tag_id INT NOT NULL, content LONGTEXT NULL DEFAULT NULL, link VARCHAR(255) NULL DEFAULT NULL, file_path VARCHAR(255) NULL DEFAULT NULL, accepted INT NOT NULL DEFAULT '0', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ) ENGINE = InnoDB`;
                const generationLibrary = `CREATE TABLE ${tblCollection.library} (id SERIAL NOT NULL, user_id VARCHAR(255) NULL DEFAULT NULL , title VARCHAR(255) NULL DEFAULT NULL , link VARCHAR(255) NULL DEFAULT NULL , description TEXT NULL DEFAULT NULL , tag_id INT NOT NULL ) ENGINE = InnoDB`;
                const generationSubtypeIom = `CREATE TABLE ${tblCollection.subTypeTableIom} ( id_exercises SERIAL NOT NULL , iom_id VARCHAR(255) NOT NULL , title VARCHAR(255) NOT NULL , description TEXT NULL DEFAULT NULL , link VARCHAR(255) NULL DEFAULT NULL , mentor INT NOT NULL , term DATE NOT NULL  , tag_id INT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE = InnoDB;`

                await req.db.execute(tutorOptions)
                await req.db.execute(generationIom)
                await req.db.execute(generationStudents)
                await req.db.execute(generationMentors)
                await req.db.execute(generationReports)
                await req.db.execute(generationLibrary)
                await req.db.execute(generationSubtypeIom)


            }

            if(result && result2){
                response.status(200,{message:'Регистрация прошла успешно!'},res)
            }else{
                if(result){
                    sqlFail = `DELETE FROM users WHERE login = "${login}"`
                    await req.db.execute(sqlFail)
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
        const [rows] = await req.db.execute(sql)
        const nets = networkInterfaces();
        const address = Object.create(null); // Or just '{}', an empty object

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!address[name]) {
                        address[name] = [];
                    }
                    address[name].push(net.address);
                }
            }
        }

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
                    const online = 'online'
                    const ip = address['en0']
                    const sql2 = "INSERT INTO `authorization`(`token_key`,`login`,`user_id`,`role`,`status`,`status_network`,`ip_address`) VALUES ('" + `Bearer ${token}` + "','" + rows[0].login + "','" + rows[0]['id_user'] + "','" + rows[0].role + "','" + rows[0].status + "','" + online +"','" + ip +"')"
                    const [row2] = await req.db.execute(sql2)


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
        const [rows] = await req.db.execute(sql)
        response.status(200, {"result":rows}, res)
    } catch (e) {
        console.log("Ошибка при выходе")
    }
}

exports.sendCodeToMail = async(req, res) => {
    const token = req.body.token

    try {
        const sql = 'SELECT login, token_key FROM `authorization` WHERE token_key = "'+  token + '"'
        const [result] = await req.db.execute(sql)
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
        const sql1 = 'SELECT login FROM `authorization` where `token_key` = "' + token + '"';
        const [result] = await req.db.execute(sql1)

        if(result) {
            const sql2  = 'UPDATE `users` SET `status`= "on" WHERE `login` = "' + result[0].login +'"';
            const sql3  = 'UPDATE `authorization` SET `status`= "on" WHERE `login` = "' + result[0].login +'"';
            const [res2] = await req.db.execute(sql2)
            const [res3] = await req.db.execute(sql3)
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
    const login  = req.body.recovery.trim()
    if(login){
        let login = req.body.recovery
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        let [result] = await req.db.execute(sql)

        if(result.length) {
            const checkInRecoveryTbl = `SELECT id FROM recovery WHERE login = "${login}"`
            const result1 = await dbObj.create(checkInRecoveryTbl)
            if(result1.length >1) {
                response.status(400,{message:'На указанный вами адрес были уже отправлены ссылки для восстановления! Проверьте свою почту. Если вам не пришло письмо с ссылкой для восстановления свяжитесь с администрацией портала'},res)
            }else {
                const salt = bcrypt.genSaltSync(10);
                const hashcode = bcrypt.hashSync(login,salt)
                const insertInrecoveryTbl = "INSERT INTO `recovery` (`login`,`hash`) VALUES ('"+ login + "','" + hashcode + "')";
                const [result2] = await req.db.execute(insertInrecoveryTbl)
                console.log(result2)
                // let testEmailAccount = await nodemailer.createTestAccount()
                // let transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     port: 587,
                //     secure: false,
                //     requireTLS: true,
                //     auth: {
                //         user: 'ipkrochr@gmail.com',
                //         pass: '99o99o99o',
                //     },
                // })
                //
                // const emailResult = await transporter.sendMail({
                //     from: '"ГБУ ДПО "ИРО ЧР"" ipkrochr@gmail.com',
                //     to: login,
                //     subject: 'Восстановление пароля',
                //     text: 'Здравствуйте!',
                //     html: `<p>Чтобы сбросить пароль от личного кабинета на cnppmpr.ru, перейдите по ссылке </p>
                //     <a href="http://localhost:8080/recovery?link=${hashcode}"`
                // // })
                // console.log(emailResult)
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
        let [result] = await req.db.execute(sql)
        if(result.length) {
            const recoverySql = `DELETE FROM recovery WHERE hash = "${link}"`  ;
            const [result2] = await req.db.execute(recoverySql)
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
    return false
    if(login){
        if(password != confirmPassword){
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        }else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)
            const sql = `UPDATE users SET password = "${hashPass}"  WHERE login =  "${login}" `;
            await req.db.execute(sql)
            const sql2 = `DELETE FROM recovery WHERE login = "${login}"`
            await req.db.execute(sql2)
            response.status(200, {message: "Пароль успешно изменен!"}, res)
        }
    }else {
        response.status(401, {message: "Ошибка при выполнении операции, обратитесь к администратору"}, res)
    }
}

exports.getRole = async (req, res) => {
    try{
        const token = req.body.token
        const sql = `SELECT role, status, login FROM authorization WHERE token_key = "${token}"`
        let sql2;

        const [rows] = await req.db.execute(sql)
        console.log(rows)
        if(rows.length) {
            sql2 = `UPDATE users SET auth_update = NOW() WHERE login = "${rows[0].login}"`
            await req.db.execute(sql2)
            response.status(200,{
                role: rows[0].role,
                status:rows[0].status }, res)
        }else {
            response.status(401, [], res)
        }
    } catch (e) {

    }
}

