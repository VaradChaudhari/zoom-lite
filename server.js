const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static(__dirname));

io.on("connection", socket => {
    console.log("User connected:", socket.id);

    socket.on("join-room", userId => {
        socket.broadcast.emit("user-connected", userId);
    });

    socket.on("message", msg => {
        socket.broadcast.emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        socket.broadcast.emit("user-disconnected", socket.id);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
