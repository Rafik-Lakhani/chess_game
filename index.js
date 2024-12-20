const express = require("express");
const socket = require('socket.io');
const http = require("http");
const { Chess } = require("chess.js");
const app = express();
const path = require("path")
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();

// create variable
let player = {};
let currentplayer = "w";


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", (uniquesocket) => {
    console.log("connect");

    // game logic and this is player color logic 

    if (!player.w) {
        player.w = uniquesocket.id;
        uniquesocket.emit("userrole", "w")
    }
    else if (!player.b) {
        player.b = uniquesocket.id;
        uniquesocket.emit("userrole", "b");
    }
    else {
        uniquesocket.emit("spectator");
        uniquesocket.emit("boardstate",chess.fen());
        console.log("three use conected");
    }

    uniquesocket.on("disconnect", () => {
        delete player.w;
        delete player.b;
        uniquesocket.emit("gameover");
        console.log("game over");
    })

    uniquesocket.on("move",(move) => {
        try{
            if(chess.turn()==="white" && uniquesocket.id !== player.w) return;
            if(chess.turn()==="black" && uniquesocket.id !== player.b) return;
            const result=chess.move(move);
            if(result){
                currentplayer=chess.turn();
                io.emit("move",move);
                io.emit("boardstate",chess.fen());
            }
        }
        catch(err){
            console.log("invalid move",move);
            uniquesocket.emit("invalid move",move)
        }
    })

});


server.listen(PORT,()=> console.log(`server listening on ${PORT}port`));
