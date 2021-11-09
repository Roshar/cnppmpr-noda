const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 3500
const db = require('./settings/db')

db.connect().then((dbh) => {
    const app = express()
    app.use((req, res, next) => {
        req.db = dbh;
        next()
    })
    app.use(express.json({limit: '50mb'}))
    app.use(express.urlencoded({limit: '50mb',extended:true}))
    app.use(cors())
    app.use(express.static(__dirname + '/uploads/avatar'))
    const routes = require('./settings/routes')
    routes(app)
    app.listen(PORT, ()=> {
        console.log(`App listen on ${PORT}`)
    })
})


