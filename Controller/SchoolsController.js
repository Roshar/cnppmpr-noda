'use strict'
const response = require('./../response')
const DB = require('./../settings/db')



exports.getSchoolsByAreaId = async(req, res) => {
    try {
        const schoolsObj = new DB()
        const sql = "SELECT * FROM schools WHERE area_id =" + req.body.id
        const schools = await schoolsObj.create(sql)
        if(schools.length <= 0) {
            response.status(401, {message:"пусто"},res)
        }else {
            response.status(200,
                schools,res)
            return true
        }
    }catch (e) {
        return e
    }
}

exports.getAreas = async(req, res) => {
    try {
        const schoolsObj = new DB()
        const sql = "SELECT * FROM area"
        const areas = await schoolsObj.create(sql)
        if(areas.length <= 0) {
            response.status(401, {message:"пусто"},res)
        }else {
            response.status(200,
                areas,res)
            return true
        }
    }catch (e) {
        return e
    }
}

