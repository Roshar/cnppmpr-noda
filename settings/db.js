const mysql = require('mysql')
const env = require('./../dbenv')

const db = mysql.createConnection({
    host:env.HOST,
    socketPath: env.SOCKET,
    port: env.PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
})

db.connect((er)=>{
    if(er) {
        console.log('Ошибка при подключении!')
    }else{
        console.log('Успешно подключено к БД')
    }
})
module.exports = db