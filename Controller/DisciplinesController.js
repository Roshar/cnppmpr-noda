'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getDisciplines = async(req, res) => {
    try {
        const schoolsObj = new DB()
        const sql = "SELECT * FROM discipline"
        const discipines = await schoolsObj.create(sql)
        if(discipines.length <= 0) {
            response.status(401, {message:"пусто"},res)
        }else {
            response.status(200,
                discipines,res)
            return true
        }
    }catch (e) {
        return e
    }
}

