

const chess = new Chess();
const socket = io();
const boardelement = document.querySelector(".chessborad");

var dragpiece = null;
var sourcesquare = null;
var playerroll = null;
var pieceelement;

function renderboard() {
    const board = chess.board();
    boardelement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareelement = document.createElement("div");
            squareelement.classList.add("square", (rowindex + squareindex) % 2 == 0 ? "light" : "dark");
            squareelement.dataset.row = rowindex;
            squareelement.dataset.col = squareindex;

            if (square) {
                 pieceelement = document.createElement("div");
                pieceelement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceelement.innerText = getpieceunicode(square);

                pieceelement.draggable = playerroll === square.color;
                pieceelement.addEventListener("dragstart", (event) => {
                    console.log(playerroll);
                    console.log(square.color);
                    console.log(playerroll==square.color);
                    if (playerroll==square.color) {
                        dragpiece = pieceelement;
                        sourcesquare = { row: rowindex, col: squareindex };
                        event.dataTransfer.setData("text/plain", "");
                        console.log(playerroll);
                    }
                });


                squareelement.appendChild(pieceelement);
            }

            squareelement.addEventListener("dragover",(event) => {
                event.preventDefault();
            });

            squareelement.addEventListener("drop",(event) =>{
                event.preventDefault();
                if(dragpiece){
                    const targetsource={
                        row:parseInt(squareelement.dataset.row),
                        col:parseInt(squareelement.dataset.col)
                    };
                    handlemove(sourcesquare, targetsource);
                }
            });

            boardelement.appendChild(squareelement);
        });

        
        pieceelement.addEventListener("dragend", (event) => {
            dragpiece = null;
            sourcesquare = null;
        });
    });

    // if(playerroll==="w"){
    //     boardelement.classList.add("flipped")
    // }
    // else{
    //     boardelement.classList.remove("flipped");
    // }
}

function handlemove(source, target) { 
    // Add logic to handle the move
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }

    socket.emit("move",move);
}

function getpieceunicode(piece) { 
    const unicodepiecse={
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚",
    }
    return unicodepiecse[piece.type] || "";
}

renderboard();

socket.on("userrole",function(rol){
    alert("your playerroll is "+rol)
    playerroll=rol;
        if (playerroll === "b") {
          boardelement.classList.add("flipped");
        } else {
          boardelement.classList.remove("flipped");
        }
    renderboard();

})

socket.on("spectator",function(){
    alert("your player is spectator");
    playerroll=null;
    renderboard();
})

socket.on("boardstate",function(fen){
    chess.load(fen);
    renderboard();
})

socket.on("move",function(move){
    chess.move(move);
    renderboard();
})


socket.on("gameover",function() {
    alert("player leave game and you win game");
})


// highlight part code start from here 

// pieceelement.addEventListener("click",(event)=>{
//     event.preventDefault();
//     let square=chess.get(piece);
//     const posiblemove= chess.move({square,verbose:true});
//     console.log(posiblemove);
// })






