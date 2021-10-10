'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getMentorData = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let exerciseSql = `SELECT * FROM ${tblCollection.mentor}`
        let exerciseData = await userObj.create(exerciseSql)
        if(!exerciseData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                exerciseData,res)
            return true
        }
    }catch (e) {
        return e
    }
}