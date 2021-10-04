'use strict'
const response = require('./../response')
const uniqid = require('uniqid');
const DB = require('./../settings/db')
const tblMethod = require('./../use/tutorTblCollection')
const userId = require('./../use/getUserId')

exports.getData = async(req, res) => {
    try {
        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT * FROM ${tblCollection.iom}`
        let iomData = await userObj.create(iomSql)
        if(!id_user) {
            response.status(401, {message:"пусто"},res)
        }else {
            response.status(200,
                iomData,res)
            return true
        }

    }catch (e) {
        return e
    }
}

exports.addNewIom = async(req, res) => {
    try {
        const userObj = new DB()
        let iomId = uniqid('itinerary-')
        const titleIom = req.body.payload.title
        const description = req.body.payload.description || null
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        const iomSql = `INSERT INTO ${tblCollection.iom} (iom_id, title,description) VALUES ("${iomId}","${titleIom}","${description}")`
        let result = await userObj.create(iomSql)
        // console.log(result)
        if(!result) {
            response.status(400,{message:'Ошибка при создании ИОМа'},res)
        }else {
            response.status(200,
                    {message: 'Индвидуальный образовательный маршрут создан', iomId: iomId },res)
            return true
        }

    }catch (e) {
        return e
    }
}
exports.issetIomId = async(req, res) => {
    try {

        const userObj = new DB()
        const id = await userId(req.body.token)
        const tblCollection = tblMethod.tbleCollection(id[0]['user_id'])
        let iomSql = `SELECT id FROM ${tblCollection.iom} WHERE iom_id = "${req.body.payload.id}"`
        let iomData = await userObj.create(iomSql)
        if(!iomData) {
            response.status(401, {message:"не существующий маршрут"},res)
        }else {
            response.status(200,
                iomData,res)
            return true
        }

    }catch (e) {
        return e
    }
}