const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const socketio=require('socket.io');
const server=http.createServer(app);
const io=socketio(server);
const mongoose=require('mongoose');
app.set('port', process.env.PORT || 3000);
require("./sockets")(io);
app.use(express.static(path.join(__dirname,'src/Cliente')));

server.listen(app.get('port'),'0.0.0.0',()=>{
    console.log("Servidor en el puesto",app.get('port'));
})
const dbUri=process.env.MONGODB_URI || 'mongodb://127.0.0.1/chat-database'
mongoose.connect(dbUri)
    .then(()=>console.log("base de datos conectada"))
    .catch(err => console.log("Error en DB",err))
