//-------------------------------------------------socket io server

var app = require("http").createServer();
var io = require("socket.io")(app);

app.listen(8080);
console.log("server is up");

const gameState = {
     players: {}
};

io.on("connection", socket => {
     console.log("a user connected:", socket.id);
     socket.on("disconnect", function() {
          console.log("user disconnected");
          delete gameState.players[socket.id];
     });
     socket.on("newPlayer", newPlayer => {
          gameState.players[socket.id] = {
               score: 0,
               y: newPlayer.y
          };
          socket.emit("newGame");
     });
     socket.on("playerState", playerState => {
          gameState.players[socket.id] = { y: playerState.y, score: playerState.score, circleX: playerState.circleX, circleY: playerState.circleY };
     });
});

setInterval(() => {
     io.sockets.emit("state", gameState);
}, 1000 / 60);
