'use strict'
const bcrypt = require('bcryptjs')
const response = require('./../response')
const db = require('./../settings/db')

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
    const {login, password, firstname} = req.body
    const sql = `select * from users where login = "${login}"`;

    db.query(sql,(error, rows) => {
        if (error) {
           response.status(400, error, res)
        } else if (rows.length) {
            response.status(302, {message:`Пользователь с таким email - ${login} уже зарегистрирован!`}, res)
        }else {
            const sql = "INSERT INTO `users`(`login`,`password`,`firstname`) VALUES ('" + login + "','" + password +"','" + firstname + "')";
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

exports.login = (req, res) => {
    const {login, password} = req.body
    const sql = `select count(id ) from users where login = "${login}"`;
}