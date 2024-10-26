const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from public directory
app.use(express.static('public'));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Track connected users
let connectedUsers = new Set();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle new user joining
  socket.on('new user', (username) => {
    socket.username = username;
    connectedUsers.add(username);
    
    // Broadcast to all clients that a new user joined
    io.emit('user joined', {
      username: username,
      userCount: connectedUsers.size
    });
    
    // Send current user list to the new user
    socket.emit('user list', Array.from(connectedUsers));
  });

  // Handle chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      username: socket.username,
      message: msg,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      connectedUsers.delete(socket.username);
      io.emit('user left', {
        username: socket.username,
        userCount: connectedUsers.size
      });
    }
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
.on('error', function (err) {
    console.log(err);
});
