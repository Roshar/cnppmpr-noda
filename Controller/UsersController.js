'use strict'

const response = require('./../response')
const db = require('./../settings/db')

exports.users = (req, res) => {
    db.query('SELECT * FROM `users`', (err,rows,fields) => {
        if(err){
            console.log(err.message)
        }else {
            response.status(rows, res)
        }
    })
}