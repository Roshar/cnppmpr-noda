const mysql = require('mysql')

const db = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'root',
    database: 'srm'
})

db.connect((er)=>{
    if(er) {
        console.log('Ошибка при подключении!')
    }else{
        console.log('Успешно подключено к БД')
    }
})
module.exports = db