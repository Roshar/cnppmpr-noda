const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3500


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const routes = require('./settings/routes')

routes(app)


app.listen(PORT, ()=> {
    console.log(`App listen on ${PORT}`)
})