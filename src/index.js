/* Core Node Modules */ 
const path = require('path')
const http = require('http')

/* npm Modules */
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')


/* Custom modules */
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')


// import routers for each resource
const renderRouter = require('./routers/renders')

// Create app
const app = express() // generate new express app instance
const port = process.env.PORT // PORT val in config, dev.env

/* Create HTTP server */
const server = http.createServer(app) // allows us to create a new webserver, the express library does this behind the scenes

/* Create new instance of socketio to config websockets to work w/ our server */
// socketio expects it to be called w/ the http server as its param
const io = socketio(server) // now our server supports websockets


/* Configure Server */
/* Define paths for express config */
const publicDirPath =  path.join(__dirname, '../public')

/* Setup static directory to serve */
// this is the express static middleware
// and it serves up whatever is inside the path directory
app.use(express.static(publicDirPath))

/* Customize server app , w/ express */
// app.use(renderRouter) // use all routers inside of renders.js

// .on -> listening for an event. 'connction' fires whenever new connection takes places
io.on('connection',(socket)=>{
    
    socket.on('join', ({username, room}, callback)=>{
        const { error, user } = addUser({id: socket.id, username,room})

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (msg, callback)=>{

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('ERROR: Profanity now allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',  generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    })
})



// setup server listener 
server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})


