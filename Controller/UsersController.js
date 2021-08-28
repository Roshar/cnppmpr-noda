'use strict'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const response = require('./../response')
const db = require('./../settings/db')
const config = require('./../dbenv')

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM `users`', (error,rows) => {
        if(error){
            response.status(400,error,res)
        }else {
            response.status(200,rows, res)
        }
    })
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

exports.singin = (req, res) => {
    const {login, password} = req.body

    const sql = `select id, login, password from users where login = "${login}"`;
    db.query(sql,(error, rows) => {
        console.log(rows[0].password)
        if(error){
            response.status(400, error, res)
        } else if(rows.length <= 0) {
            response.status(401, {message: `Пользователь с таким email ${login} не найден!`})
        } else {
            const passwordTrue = bcrypt.compareSync(password, rows[0].password)
            console.log(passwordTrue)

            if(passwordTrue) {
                //генерируем токен
                const token = jwt.sign({
                    userId: rows.id,
                    login: rows.login
                },config.jwt, {
                    expiresIn: 120 * 120
                })
                response.status(200, {token: `Bearer ${token}`},res)
            }else{
                response.status(401, {message:`Пароль не верный.`},res)
            }
        return true
        }
    })
}