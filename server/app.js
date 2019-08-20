var app = require("http")
     .createServer(function(req, res) {
          res.writeHead(200, { "Content-Type": "text/plain" });
     })
     .listen(8080);
var io = require("socket.io")(app);

io.on("connection", function(socket) {
     console.log("a user connected");
     socket.on("disconnect", function() {
          console.log("user disconnected");
     });
});
