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

exports.sendCodeToMail = async(req, res) => {
    const token = req.body.token

    try {
        const sql = 'SELECT login, token_key FROM `authorization` WHERE token_key = "'+  token + '"'
        const dbObj = new DB()
        const result = await dbObj.create(sql)
        console.log(result)
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
            console.log('code ' + code)
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


exports.signup = async (req, res) => {
    try{
        const {login, password, confirmPassword, name, surname, patronymic="", area, school,phone, role } = req.body

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
                    const sql2 = "INSERT INTO `authorization`(`token_key`,`login`,`role`,`status`) VALUES ('" + `Bearer ${token}` + "','" + rows[0].login + "','" + rows[0].role + "','" + rows[0].status + "')"
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
        const token = req.body.token
        const sql = 'DELETE FROM `authorization` WHERE `token_key` = "' + `${token}` +'"'
        const obj = new DB()
        const rows = await obj.create(sql)
        response.status(200, {"result":rows}, res)
    } catch (e) {
        console.log("Ошибка при выходе")
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
