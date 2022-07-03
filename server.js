const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 8088
const db = require('./settings/db')
require('./settings/helper')

// предварительно прверяем DB соединение
db.connect().then((dbh) => {
    const app = express()
    app.use((req, res, next) => {
            req.db = dbh;
            // TODO изменить на более эффективный способ
        setInterval(async() => {
            const sql = `SELECT 1`
            const [rows] = await req.db.execute(sql)
        }, 60000)
            next()
    })
    app.use(express.json({limit: '50mb'}))
    app.use(express.urlencoded({limit: '50mb',extended:true}))
    app.use(cors())
    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    app.use(express.static(__dirname + '/uploads/avatar'))
    app.use(express.static(__dirname + '/uploads/report'))
    const routes = require('./settings/routes')
    routes(app)
    app.listen(PORT, ()=> {
        console.log(`App listen on ${PORT}`)
    })
})


