const response = require('./../response')
const DB = require('./../settings/db')
const userId = async (token) => {
    const userObj = new DB()
    const sqlGetUserId = `SELECT user_id FROM authorization WHERE token_key = "${token}"`
    const id_user = await userObj.create(sqlGetUserId)
    return id_user
}
module.exports = userId