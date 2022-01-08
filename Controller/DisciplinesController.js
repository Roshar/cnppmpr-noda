'use strict'
const response = require('./../response')

exports.getDisciplines = async(req, res) => {
    try {
        const sql = "SELECT * FROM discipline"
        const [discipines] = await req.db.execute(sql)
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

exports.getLevels = async(req, res) => {
    try {
        const sql = "SELECT * FROM global_iom_levels"
        const [levels] = await req.db.execute(sql)
        if(levels.length <= 0) {
            response.status(401, {message:"пусто"}, res)
        }else {
            response.status(200,
                levels,res)
            return true
        }
    }catch (e) {
        return e
    }
}

