const env = require('./../dbenv')
const mysql  = require('mysql');


const db = mysql.createConnection({
    host: env.HOST,
    socketPath: env.SOCKET,
    port: env.PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
});

db.connect((err) => {
    if(err) {
        console.log("error with connect")
    }else {
        console.log("good")
    }
});

module.exports = db

