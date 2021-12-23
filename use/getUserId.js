const response = require('./../response')
const userId = async (db_connect,token) => {
    const sqlGetUserId = `SELECT user_id,role FROM authorization WHERE token_key = "${token}"`
    const [id_user] = await db_connect.execute(sqlGetUserId)
    return id_user
}
module.exports = userId

