'use strict'
const uniqid = require('uniqid');
const response = require('./../response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const DB = require('./../settings/db')
const config = require('./../dbenv')
const nodemailer = require('nodemailer')
const { networkInterfaces } = require('os');

exports.signup = async (req, res) => {
    try{
        const {login, password, confirmPassword, first_name, role, surname, patronymic="", area="", school="", phone, discipline, gender, birthday="1000-01-01" } = req.body
        let id_user = uniqid()
        let roleCheck;
        let sqlOption;
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        let [result] = await req.db.execute(sql)

        if (result.length) {
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        } else if(password != confirmPassword) {
            response.status(400, {message:'Пароль не был корректно подтвержден. Пароль и подтверждение должны совпадать'},res)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)

            const avatar = 'no_avatar.png'

            if(req.body.code && req.body.code === "5808" && role === 'tutor'){
                roleCheck = "tutor"
                sqlOption = "INSERT INTO `tutors`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`gender`,`birthday`, `avatar` ) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + gender + "','" + birthday + "','" + avatar + "')";
            } else if(req.body.code && req.body.code === "7777" && role === 'admin'){
                roleCheck = "admin"
                sqlOption = "INSERT INTO `admins`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`gender`,`birthday`,`avatar`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + gender + "','" + birthday + "','" + avatar + "')";
            } else if(!req.body.code && role === 'student') {
                roleCheck = "student"
                sqlOption = "INSERT INTO `students`(`user_id`,`name`,`surname`,`patronymic`,`phone`,`discipline_id`,`area_id`,`school_id`,`gender`,`birthday`, `avatar`) VALUES ('" + id_user + "','" + first_name + "' ,'" + surname + "','" + patronymic + "','" + phone + "','" + discipline + "','" + area + "','" + school + "','" + gender + "','" + birthday + "','" + avatar + "')";
            }
            else{
                roleCheck = null
            }

            if(roleCheck) {
                let sqlUser = "INSERT INTO `users`(`id_user`,`login`,`password`,`role`) VALUES ('" + id_user + "','" + login + "','" + hashPass + "','" + role + "')";
                let [result]  = await req.db.execute(sqlUser)
                let [result2]  = await req.db.execute(sqlOption)

                if(result && result2){
                    response.status(200,{message:'Регистрация прошла успешно!'},res)
                }else{
                    response.status(400,{message:'Не получилось зарегистрировать пользователя!'},res)
                }
            }else {
                response.status(400,{message:'Не удалось зарегистрировать пользователя! Неверный код!'},res)
            }
        }
    }catch (e) {
        response.status(401,{message:'Ошибка соединения с БД'},res)
    }
}

exports.singin = async (req, res) => {
    try {
        // console.log(req.body)
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
                        response.status(401,{message:'Ошибка при авторизации, попробуйте снова'},res)
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
        console.log(e)
        response.status(401,{message: e.message},res)
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
            // console.log(emailResult)
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

    const login  = req.body.login.trim()
    const baseUrl = req.body.baseUrl
    if(login){
        const sql = `SELECT * FROM users WHERE login = "${login}"`;
        let [result] = await req.db.execute(sql)

        if(result.length) {
            const checkInRecoveryTbl = `SELECT COUNT(id) as id FROM recovery WHERE login = "${login}"`
            const [result1] = await req.db.execute(checkInRecoveryTbl)
            if(!result1.length || (result1.length && result1[0]['id']<3)){

                const hashcode = uniqid('code-')

                const insertInrecoveryTbl = "INSERT INTO `recovery` (`login`,`hash`) VALUES ('"+ login + "','" + hashcode + "')";
                const [result2] = await req.db.execute(insertInrecoveryTbl)
                if(result2.insertId){
                        const link = '<a href="'+ baseUrl + '/recovery/'+hashcode+'"> Нажмите сюда</a>'
                        const htmlBody = '<h4>'+'Здравствуйте, '+ login +'</h4>'+
                            '<p>'+ 'Для Вашей учетной записи на портале «IT-Говзалла» было\n' +
                            'запрошено восстановление пароля.\n' +
                            'Для подтверждения этого запроса и создания\n' +
                            'нового пароля для своей учетной записи,\n' +
                            'пожалуйста, перейдите по адресу:'+ link +'</p>'+
                            '<p>' + 'Если восстановление пароля было запрошено\n' +
                            'не Вами, не нужно производить никаких\n' +
                            'действий.\n' +
                            'Если Вам нужна помощь, пожалуйста,\n' +
                            'свяжитесь с администратором портала,\n' +
                            '</p>' +
                            '<p>'+'Администратор, '+'<strong>'+'novrazova2016@mail.ru'+'</strong>'+'</p>';

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
                            subject: 'Восстановление пароля на IT-говзалла',
                            text: 'Здравствуйте!',
                            html: htmlBody

                        })


                    response.status(200,{
                        message:'Письмо для восстановления пароля отправлено',
                        code: hashcode
                    },res)
                }
            }else {
                response.status(201,{message:'На вашу почту уже были отправлены ссылки для восстановления. Если вы не можете найти их, проверьте в папке СПАМ'},res)
            }

        }else {
            response.status(201,{message:'Такой пользователь не найден,проверьте корректность email адреса'},res)
        }


        // if(result.length) {
        //     const checkInRecoveryTbl = `SELECT id FROM recovery WHERE login = "${login}"`
        //     const result1 = await dbObj.create(checkInRecoveryTbl)
        //     if(result1.length >1) {
        //         response.status(400,{message:'На указанный вами адрес были уже отправлены ссылки для восстановления! Проверьте свою почту. Если вам не пришло письмо с ссылкой для восстановления свяжитесь с администрацией портала'},res)
        //     }else {
        //         const salt = bcrypt.genSaltSync(10);
        //         const hashcode = bcrypt.hashSync(login,salt)
        //         const insertInrecoveryTbl = "INSERT INTO `recovery` (`login`,`hash`) VALUES ('"+ login + "','" + hashcode + "')";
        //         const [result2] = await req.db.execute(insertInrecoveryTbl)
        //         console.log(result2)
        //         // let testEmailAccount = await nodemailer.createTestAccount()
        //         // let transporter = nodemailer.createTransport({
        //         //     host: 'smtp.gmail.com',
        //         //     port: 587,
        //         //     secure: false,
        //         //     requireTLS: true,
        //         //     auth: {
        //         //         user: 'ipkrochr@gmail.com',
        //         //         pass: '99o99o99o',
        //         //     },
        //         // })
        //         //
        //         // const emailResult = await transporter.sendMail({
        //         //     from: '"ГБУ ДПО "ИРО ЧР"" ipkrochr@gmail.com',
        //         //     to: login,
        //         //     subject: 'Восстановление пароля',
        //         //     text: 'Здравствуйте!',
        //         //     html: `<p>Чтобы сбросить пароль от личного кабинета на cnppmpr.ru, перейдите по ссылке </p>
        //         //     <a href="http://localhost:8080/recovery?link=${hashcode}"`
        //         // // })
        //         // console.log(emailResult)
        //         response.status(200,{
        //             message:'На ваш электронный адрес выслали письмо с ссылкой для подтверждения',
        //             code: hashcode
        //         },res)
        //     }
        // }else {
        //     response.status(400,{message:'Такой пользователь не найден,проверьте корректность email адреса'},res)
        // }
    }
}

exports.recoverychecklink = async (req, res) => {

    if(req.body.link){
        let link = req.body.link
        const sql = `SELECT id FROM recovery WHERE hash = "${link}"`;
        let [result] = await req.db.execute(sql)
        if(result.length) {
            response.status(200,result,res)
        }else {
            response.status(201,[],res)
        }

    }
}

exports.changepassword = async (req, res) => {
    const { password, confirmPassword, loginHash} = req.body
    const p1 = password.trim()
    const p2 = confirmPassword.trim()
    if(p1 !== p2 || p1.length < 4 ) {
        response.status(201, {message: "Пароли не сопадают или слишком короткие"}, res)
        return false
    }
    const loginSql = `SELECT login FROM recovery WHERE hash = "${loginHash}"`
    const [loginIs] = await req.db.execute(loginSql)
    const login = loginIs[0]['login']
    if(login){
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password,salt)
        const sql = `UPDATE users SET password = "${hashPass}"  WHERE login =  "${login}" `;
        const [result] = await req.db.execute(sql)
        const sql2 = `DELETE FROM recovery WHERE login = "${login}"`
        await req.db.execute(sql2)
        if(!result.affectedRows) {
            response.status(201, {message: "Ошибка при выполнении операции, обратитесь к администратору"}, res)
        }else {
            response.status(200, {message: "Пароль изменен! Войдите в систему с новым паролем!",code:true}, res)
        }

    }else {
        response.status(201, {message: "Ошибка при выполнении операции, обратитесь к администратору"}, res)
    }
}

exports.getRole = async (req, res) => {
    try{
        const token = req.body.token
        const sql = `SELECT role, status, login FROM authorization WHERE token_key = "${token}" LIMIT 1`
        let sql2;
        const [rows] = await req.db.execute(sql)
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

