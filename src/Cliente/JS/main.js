$(function () {
    const socket = io();
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $("#chat");
    const $nickForm = $('#nick-form');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');
    const $users = $("#usernames");

    // Login logic
    $nickForm.submit(e => {
        e.preventDefault();
        const nicknameValue = $nickname.val().trim();

        if (!nicknameValue) {
            $nickError.html('<div class="alert alert-danger">Debes ingresar un nombre!</div>');
            return;
        }

        console.log("Enviando nombre de usuario:", nicknameValue);

        socket.emit('Nuevo usuario', nicknameValue, data => {
            console.log("Respuesta del servidor:", data);
            if (data) {
                $('#nickWrap').fadeOut(300, function () {
                    $('#contentWrap').fadeIn(300);
                });
            } else {
                $nickError.html('<div class="alert alert-danger">Ese usuario ya existe! Intenta otro.</div>');
            }
        });
        $nickname.val('');
    });

    // Chat messages logic
    $messageForm.submit(e => {
        e.preventDefault();
        let msg = $messageBox.val().trim();
        if (msg) {
            socket.emit('Enviar mensaje', msg,data=>{
                $chat.append(`<p class="error">${data}</p>`)
            });
            $messageBox.val('');
        }
    });
    let userColors={}
    const colores = ["primary","success","danger","warning","info","secondary","dark"];
    function getColor(nick){
        if(!userColors[nick]){
            const random = Math.floor(Math.random() * colores.length);
            userColors[nick] = colores[random];
        }

        return userColors[nick];
    }

    socket.on('Nuevo mensaje', data => {
        if (data.isSystem) {
            $chat.append(`<div class="mb-1 text-center text-secondary"><b>${data.nick}</b> ${data.msg}</div>`);
        } else {
            const color = getColor(data.nick);
            $chat.append(`<div class="mb-1"><b class="text-${color}">${data.nick}:</b> ${data.msg}</div>`);
        }
        $chat.scrollTop($chat[0].scrollHeight);
    });

    socket.on('whisper', data => {
        const whisperHeader = data.to ? `Para ${data.to}` : `De ${data.nick}`;
        $chat.append(`<div class="mb-1 whisper"><b>${whisperHeader}:</b> ${data.msg}</div>`);
        $chat.scrollTop($chat[0].scrollHeight);
    });
    socket.on('Cargando viejos mensajes',msgs =>{
        for (let index = 0; index < msgs.length; index++) {
            displayMsg(msgs[index])
        }
    })
    function displayMsg(data){
        $chat.append(`<p class="whisper"><b>${data.nick}:</b>${data.msg}</p>`)
    }

    // Update user list
    socket.on('usernames', data => {
        console.log("Usuarios conectados:", data);
        let html = '';
        for (let i = 0; i < data.length; i++) {
            html += `<p><i class="fa-solid fa-user text-warning me-2"></i> ${data[i]}</p>`;
        }
        $users.html(html);
    });
});