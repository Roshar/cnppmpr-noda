'use strict'
const response = require('./../response')
const DB = require('./../settings/db')

exports.getData = async(req, res) => {
    try {
        console.log('pppp')
        const userObj = new DB()
        const sqlGetUserId = `SELECT user_id FROM authorization WHERE token_key = "${req.body.token}"`
        const id_user = await userObj.create(sqlGetUserId)
        let tblCollection = {
            iom: id_user[0]['user_id'] + '_iom',
            student: id_user[0]['user_id']+ '_student',
            report: id_user[0]['user_id'] + '_report',
            library: id_user[0]['user_id'] + '_library',
            subTypeTableIom: id_user[0]['user_id'] +'_sub_type_table_iom'
        }
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