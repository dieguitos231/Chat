
const Chat=require("./src/Models/Chat")
module.exports = function (io) {
    let users = {};
    io.on('connection',async socket => {
        console.log("Nuevo usuario conectado");
        let messages=await Chat.find({}).limit(20)
        socket.emit('Cargando viejos mensajes',messages)
        socket.on('Nuevo usuario', (data, cb) => {
            if (data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname]=socket;
                updateNickName();
                io.sockets.emit('Nuevo mensaje', {
                    msg: 'se ha unido al chat',
                    nick: socket.nickname,
                    isSystem: true
                });
            }
        });

        socket.on('disconnect', (data) => {
            if (!socket.nickname) return;
            delete users[socket.nickname];
            updateNickName();
            io.sockets.emit('Nuevo mensaje', {
                msg: 'ha salido del chat',
                nick: socket.nickname,
                isSystem: true
            });
        });

        function updateNickName() {
            io.sockets.emit('usernames', Object.keys(users));
        }

        // socket.on('Enviar mensaje', function (data,cb) {
        //     io.sockets.emit('Nuevo mensaje', {
        //         msg: data,
        //         nick: socket.nickname
        //     });
        // });
        socket.on('Enviar mensaje', async function (data, cb) {
            let msg = data.trim();
            if (msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                let index = msg.indexOf(' ');
                if (index !== -1) {
                    let name = msg.substring(0, index);
                    let whisperMsg = msg.substring(index + 1);

                    if (name in users) {
                        users[name].emit('whisper', {
                            msg: whisperMsg,
                            nick: socket.nickname
                        });
                        // Optional: Send feedback to sender
                        socket.emit('whisper', {
                            msg: whisperMsg,
                            nick: socket.nickname,
                            to: name
                        });
                    } else {
                        cb('Error! Por favor entra un usuario válido.');
                    }
                } else {
                    cb('Error! Por favor ingresa tu mensaje después del nombre de usuario.');
                }
            } else {
                let newMsg=new Chat({
                    msg:data,
                    nick:socket.nickname
                })
                await newMsg.save();
                io.sockets.emit('Nuevo mensaje', {
                    msg: data,
                    nick: socket.nickname
                });
            }
        });




    });
};