var Hapi = require('hapi');
var fs = require('fs');
var server = new Hapi.Server();
server.connection({ port: 3000 });
var io = require('socket.io')(server.listener);

// Holds the history of the chat, so
// anyone joining can see the whole thing
var history = [];

server.route({
	method: 'GET',
	path: '/{param*}',
	handler: {
		directory: {
			path: __dirname
		}
	}
});

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply){
  	reply.file(__dirname + '/index.html');
  }
});

server.route({
	method: 'GET',
	path: '/emojies',
	handler: function(request, reply){
		var img_dir =  __dirname + '/bower_components/emojify.js/dist/images/basic';
		fs.readdir(img_dir, function(err, files){
			if(err) {
				console.error(err);
				reply
			}
			filenames = files.map(function(filename){
				return { name: filename.replace('.png','') };
			});
			reply(filenames);
		});
	}
});

io.on('connection', function(socket){

	socket.emit('welcome', history);

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    history.push(msg);
  });
});

server.start(function(){
  console.log('listening at: ', server.info.uri);
});
