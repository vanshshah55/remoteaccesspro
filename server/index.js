var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/remoteview', (req, res) => {
    res.sendFile(__dirname + '/display.html');
})

let username = '';

io.on('connection', (socket) => {
    socket.on('username', (data) => {
        // Store the username data in a variable
        username = data;
        // const ip = socket.request.connection.address().address;
        //console.log("Username entered: " + username);
    });



    socket.on("join-message", (roomId) => {
        socket.join(roomId);
        console.log(username + " joined in a room using : " + roomId + "\n");

    });






    socket.on("screen-data", function (data) {
        data = JSON.parse(data);
        var room = data.room;
        var imgStr = data.image;
        socket.broadcast.to(room).emit('screen-data', imgStr);
    });

    socket.on("mouse-move", function (data) {
        var room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("mouse-move", data);
    });

    socket.on("mouse-click", function (data) {
        var room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("mouse-click", data);
    });

    socket.on("type", function (data) {
        var room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("type", data);
    });



});

var server_port = process.env.YOUR_PORT || process.env.PORT || 5001;
http.listen(server_port, () => {
    console.log("Started on port : " + server_port + "\n");
})
