const express = require('express')
const app = express()
const {createServer} = require('http')
const server = createServer(app)
const socket = require("socket.io");

const io = socket(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
})


const bodyParser = require('body-parser')
const passport = require('passport')
const cors = require('cors')
const PORT = process.env.PORT || 3500
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(cors())
require('./middleware/passport')(passport)
const routes = require('./settings/routes')
routes(app)

server.listen(PORT, ()=> {
    console.log(`App listen on ${PORT}`)
})

io.on('connection', (socket) => {
    console.log('user connected');
    io.emit('CONNECT', 'msg');

    socket.on('add_message', (msg, userId) => {
      //TODO
      //добавить сообщение в бд

      //отправить сообщения в store
        
       io.emit('SOCKET_ADD_MESSAGE', msg)
       console.log('new event from server', msg)
    })
})