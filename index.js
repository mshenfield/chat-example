var Hapi = require('hapi');
var Good = require('good');
var fs = require('fs');
var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: '0.0.0.0' });
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
		var emojiDescriptionsFilePath =  __dirname + '/bower_components/emojione/emoji_strategy.json';
		var emojiDescriptions = JSON.parse(fs.readFileSync(emojiDescriptionsFilePath, 'utf8'));
		var descriptionsNoKeys = [];
		for(key in emojiDescriptions) {
			description = emojiDescriptions[key]
			// We want to be able to use this as a lookup key - so replace
			// colons when pushing up
			description["shortname"] = description["shortname"].replace(/:/gi, "");
			descriptionsNoKeys.push(description);
		}

		reply(descriptionsNoKeys);
	}
});

server.register({
	register: Good,
	options: {
		reporters: [{
			reporter: require('good-console'),
			events: {
				response: '*',
				log: '*',
			}
		}]
	}
}, function (err) {
	if (err) {
		throw err;
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
	server.log('listening at: ' +  server.info.uri);
});
