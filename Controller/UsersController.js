'use strict'
const response = require('./../response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const DB = require('./../settings/db')
const config = require('./../dbenv')
// const {body, validationResult} = require('express-validator')
const nodemailer = require('nodemailer')



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

const confirm = async(req, res) => {
    let testEmailAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ipkrochr@gmail.com',
            pass: '99o99o99o',
        },
    })


    await transporter.sendMail({
        from: '"ГБУ ДПО "ИРО ЧР"" <nodejs@example.com>',
        to: req.body.email,
        subject: 'Attachments',
        text: 'Ваш код доступа: '
        // html:
        //     'This <i>message</i> with <strong>attachments</strong>.',
        // attachments: [
        //     { filename: 'greetings.txt', path: '/assets/files/' },
        //     {
        //         filename: 'greetings.txt',
        //         content: 'Message from file.',
        //     },
        //     { path: 'data:text/plain;base64,QmFzZTY0IG1lc3NhZ2U=' },
        //     {
        //         raw: `
        //   Content-Type: text/plain
        //   Content-Disposition: attachment;
        //
        //   Message from file.
        // `,
        //     },
        // ],
    })
}



exports.signup = async (req, res) => {
    try{
        const {login, password, confirmPassword, name, surname, patronymic="", area, school,phone, role } = req.body
        // console.log(req.body)
        // return false


        const sql = `select * from users where login = "${login}"`;
        const dbObj = new DB()
        const result = await dbObj.create(sql)

        if (req.length) {
            response.status(401, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        } else if(password != confirmPassword) {
            response.status(400, {message:'Пароль не был корректно подтвержден. Пароль и подтверждение должны совпадать'},res)
        } else {

            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)
            const sql = "INSERT INTO `users`(`login`,`password`,`name`,`surname`,`patronymic`,`area_id`,`school_id`,`phone`,`role`) VALUES ('" + login + "','" + hashPass + "','" + name + "' ,'" + surname + "','" + patronymic + "','" + area + "','" + school + "','" + phone + "','" + role + "')";
            const result  = dbObj.create(sql)
            if(result){
                response.status(200,{message:'Регистрация прошла успешно!'},res)
            }else{
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
            const sql = `select id, login, password, role, status from users where login = "${login}"`;
            const obj = new DB()
            const rows = await obj.create(sql)

            if(rows.length <= 0){
                response.status(401, {message:`Пользователь с таким email ${login} не найден!`},res)
                return false
            } else {
            if(rows[0].password){
                const passwordTrue = bcrypt.compareSync(password, rows[0].password)
                console.log(passwordTrue)
                if(passwordTrue) {
                    //генерируем токен
                    const token = jwt.sign({
                        userId: rows.id,
                        login: rows.login,
                        role: rows.role,
                        status: rows.status,
                    },config.jwt, {
                        expiresIn: 120 * 120
                    })
                    const sql2 = "INSERT INTO `authorization`(`token_key`,`login`,`role`) VALUES ('" + `Bearer ${token}` + "','" + rows[0].login + "','" + rows[0].role + "')"
                    const row2 = await obj.create(sql2)
                    if(!row2){
                        response.status(400,{message:'Ошибка при авторизации, попробуйте снова'},res)
                        return false
                    }
                    response.status(200,
                        {token: `Bearer ${token}`,
                                login: rows[0].login,
                                role: rows[0].role,
                                status: rows[0].status},res)
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
        const {login} = req.body
        const sql = "DELETE FROM `authorization` WHERE login " + login
        const obj = new DB()
        const rows = await obj.create(sql)

    } catch (e) {
        console.log("Ошибка при выходе")
    }
}

exports.getRole = async (req, res) => {
    try{
        const {login} = req.body
        const sql = `SELECT role FROM users WHERE login = "${login}"`
        const obj = new DB()
        const rows = await obj.create(sql)
        if(rows.length) {
            response.status(200,{role: rows[0].role}, res)
        }else {
            response.status(401, {}, res)
        }
    } catch (e) {

    }
}
