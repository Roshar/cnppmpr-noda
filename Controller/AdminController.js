'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getStudentsCount = async(req,res) => {
    try {
        const userObj = new DB()
        let sql = `SELECT COUNT(*) FROM students`
        let sqlData = await userObj.create(sql)
        if(!sqlData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                sqlData[0]['COUNT(*)'],res)
            return true
        }
    }catch (e) {

    }
}
exports.getOptionFromStudents = async(req,res) => {
    try {
        const userObj = new DB()
        console.log(req.body)
        const column = req.body.column
        const tbl = req.body.table
        const value = req.body.value.val
        const parameter = req.body.value.parameter
        let optionSql
        if(parameter == 'age'){
            optionSql = `SELECT id as 'COUNT(${column})' FROM students 
                         WHERE TIMESTAMPDIFF(YEAR, birthday, CURDATE())  > ${value.start} 
                         AND TIMESTAMPDIFF(YEAR, birthday, CURDATE()) <= ${value.end}`
        }else if(parameter == 'number') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = ${value}`;
        }else if(parameter == 'string') {
            optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = "${value}"`
        }
        let optionData = await userObj.create(optionSql)
        if(!optionData.length) {
            response.status(201, {},res)
        }else {
            response.status(200,
                optionData[0][`COUNT(${column})`],res)
            return true
        }
    }catch (e) {

    }
}

// exports.getAgeStudents = async(req,res) => {
//     try {
//         const userObj = new DB()
//         const column = req.body.value
//         const tbl = req.body.table
//         const limit = req.body.index
//         // console.log(req.body)
//         let optionSql;
//         if (column == 'birthday') {
//             optionSql = `SELECT id FROM students WHERE TIMESTAMPDIFF(YEAR, birthday, CURDATE())  > 21`
//         }
//         // if(typeof index == 'number') {
//         //     // optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = ${index}`
//         // }else {
//         //     // optionSql = `SELECT COUNT(${column}) FROM ${tbl} WHERE ${column} = "${index}"`
//         // }
//
//         let optionData = await userObj.create(optionSql)
//         console.log(optionData)
//
//         if(!optionData.length) {
//             response.status(201, {},res)
//         }else {
//             response.status(200,
//                 optionData[0][`COUNT(${column})`],res)
//             return true
//         }
//     }catch (e) {
//
//     }
// }