'use strict'
const response = require('./../response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./../settings/db')
const config = require('./../dbenv')
const {body, validationResult} = require('express-validator')

// exports.getAllUsers = (req, res) => {
//     db.query('SELECT * FROM `users`', (error,rows) => {
//         if(error){
//             response.status(400,error,res)
//         }else {
//             response.status(200,rows, res)
//         }
//     })
// }

exports.getAllUsers = async (req, res) => {
    await db('SELECT * FROM `users`')
}

exports.signup = (req, res) => {
    const {login, password, passwordConfirm, name} = req.body

    const sql = `select * from users where login = "${login}"`;

    db.query(sql,(error, rows) => {
        if (error) {
           response.status(400, error, res)
        } else if (rows.length) {
            response.status(302, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        } else if(password != passwordConfirm) {
            response.status(400, {message:'Пароль не был корректно подтвержден. Пароль и подтверждение должны совпадать'},res)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password,salt)
            const sql = "INSERT INTO `users`(`login`,`password`,`name`) VALUES ('" + login + "','" + hashPass + "','" + name + "')";
            db.query(sql, (error,results) => {
                if(error){
                    response.status(400,error,res)
                }else{
                    response.status(200,{message:'Регистрация прошла успешно!',results},res)
                }
            })
        }
    })
}

exports.singin = async (req, res) => {
        try {
            const {login, password} = req.body
            const sql = `select id, login, password, role, status from users where login = "${login}"`;
            const obj = new db()
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
                    response.status(200,
                        {token: `${token}`,
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

// exports.singin = (req, res) => {
//     const {login, password} = req.body
//
//     const sql = `select id, login, password, role, status from users where login = "${login}"`;
//     db.query(sql,(err, rows) => {
//         if(err){
//             response.status(400, {message:'sdsdsdsd'}, res)
//         } else if(rows.length <= 0) {
//             response.status(401, {message: `Пользователь с таким email ${login} не найден!`},res)
//             return false
//         } else {
//             if(rows[0].password){
//                 const passwordTrue = bcrypt.compareSync(password, rows[0].password)
//                 console.log(passwordTrue)
//                 if(passwordTrue) {
//                     //генерируем токен
//                     const token = jwt.sign({
//                         userId: rows.id,
//                         login: rows.login,
//                         role: rows.role,
//                         status: rows.status,
//                     },config.jwt, {
//                         expiresIn: 120 * 120
//                     })
//                     response.status(200,
//                         {token: `${token}`,
//                             login: rows[0].login,
//                             role: rows[0].role,
//                             status: rows[0].status},res)
//                 }else{
//                     response.status(401, {message:`Пароль не верный.`},res)
//                 }
//             }
//             return true
//         }
//     })
// }