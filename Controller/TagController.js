'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getTag = async(req,res) => {
    try {
        const userObj = new DB()
        let exerciseSql = `SELECT * FROM tag`
        let exerciseData = await userObj.create(exerciseSql)
        if(!exerciseData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }
    }catch (e) {

    }
}