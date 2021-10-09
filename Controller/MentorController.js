'use strict'
const response = require('./../response')
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getData = async(req, res) => {
    // try {
    //     const userObj = new DB()
    //     const id = await userId(req.body.token)
    //     const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
    //     let iomSql = `SELECT * FROM ${tblCollection.mentor}`
    //     let iomData = await userObj.create(iomSql)
    //     // console.log(iomData)
    //     if(!iomData.length) {
    //         response.status(200, {message:"пусто"},res)
    //     }else {
    //         response.status(200,
    //             iomData,res)
    //         return true
    //     }
    // }catch (e) {
    //     return e
    // }
}