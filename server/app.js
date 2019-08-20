var conn = require("http").createServer(handler);
var io = require("socket.io")(conn);
var fs = require("fs");

conn.listen(5555);

function handler(req, res) {
     fs.readFile(__dirname + "/index.html", function(err, data) {
          if (err) {
               res.writeHead(500);
               return res.end("Error loading index.html");
          }
          res.writeHead(200);
          res.end(data);
     });
}

io.on("connection", function(socket) {
     socket.emit("news", { hello: "world" });
     socket.on("my other event", function(data) {
          console.log(data);
     });
});
console.log("lol");
