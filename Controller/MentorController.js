'use strict'
const response = require('./../response')

exports.getMentorData = async(req, res) => {
    try {
        let exerciseSql = `SELECT * FROM a_mentor`
        let [exerciseData] = await req.db.execute(exerciseSql)
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