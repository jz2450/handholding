// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Here is the actual HTTP server 
var http = require('http');
// We pass in the Express object
var httpServer = http.createServer(app);
// Listen on port 80
httpServer.listen(80);

// WebSocket Portion
// WebSockets work with the HTTP server
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

//var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

	
		// // When this user "send" from clientside javascript, we get a "message"
		// // client side: socket.send("the message");  or socket.emit('message', "the message");
		// socket.on('message', 
		// 	// Run this function when a message is sent
		// 	function (data) {
		// 		console.log("message: " + data);
							
		// 		// To all clients
		// 		io.sockets.emit('message', data);
		// 	}
		// );
		
		// // When this user emits, client side: socket.emit('otherevent',some data);
		// socket.on('otherevent', function(data) {
		// 	// Data comes in as whatever was sent, including objects
		// 	console.log("Received: 'otherevent' " + data);
		// });

		// for HANDHOLDING
		socket.on('w3mouse', function(data) {
			// io.emit("mouse", data);
			// console.log("mouse moved serverside");
			var dataPlusId = {
				x: data.x,
				y: data.y,
				handId: socket.id
			}
			// console.log(dataPlusId);
			socket.broadcast.emit('w3mouse', dataPlusId);
			// io.emit('w3mouse', dataPlusId);
		  });


    
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
			io.emit('disconnected', socket.id);
		});
	}
);
