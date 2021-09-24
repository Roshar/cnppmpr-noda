'use strict'
const response = require('./../response')
const DB = require('./../settings/db')



exports.getUserData = async(req, res) => {
    try {
        console.log(req.body)
        const userObj = new DB()
        const sql = `SELECT * FROM authorization WHERE token_key = "${req.body.user}" `
        const userData = await userObj.create(sql)
        console.log(userData)
        if(userData.length <= 0) {
            response.status(401, {message:"пусто"},res)
        }else {
            response.status(200,
                userData,res)
            return true
        }
    }catch (e) {
        return e
    }
}