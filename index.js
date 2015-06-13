var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Holds the history of the chat, so
// anyone joining can see the whole thing
var history = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

	socket.emit('welcome', history);

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    history.push(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
