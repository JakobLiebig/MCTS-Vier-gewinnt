var gameState
var mctsIterations

function startGame() {
    let board_size = document.getElementById("sizeInput").value
    let mcts_strength = document.getElementById("strengthInput").value

    gameState = GameState.initial(board_size, board_size)
    mctsIterations = mcts_strength

    let message_box = document.getElementById("messagebox")
    message_box.innerText = "Überleg dir deinen Zug gut!!"

    drawTable()
}

function act(consoleAction) {
    gameState = gameState.step(consoleAction)
    
    if (!gameState.isTerminal) {
        mcts_action = search(gameState, mctsIterations)
        gameState = gameState.step(mcts_action)
    }

    drawTable()

    if (gameState.isTerminal) {
        let place_buttons = document.getElementsByClassName("placeButton")
        for(let i = 0; i < place_buttons.length; i++) {
            place_buttons[i].disabled = true;
        }

        let msg
        let active_player = gameState.activePlayer
        
        if (JSON.stringify(active_player) == JSON.stringify(Player.BLACK())) {
            msg = "Gewonnen! Sehr gut!"
        } else {
            msg = "Verloren! Bruh"
        }

        let message_box = document.getElementById("messagebox")
        message_box.innerText = msg
    }
}

function updateSizeRange() {
    size = document.getElementById("sizeInput").value
    document.getElementById("sizeLabel").innerText = "Größe (" + size + "x" + size + ")"
}

function updateStrengthRange() {
    strength = document.getElementById("strengthInput").value
    document.getElementById("strengthLabel").innerText = "Stärke (" + strength + ")"
}

function drawTable() {
    let grid = gameState.board.grid
    let legalMoves = gameState.legalMoves
    
    let gameBoard = document.getElementById("gameboard")

    gameBoard.innerHTML = ""

    let tr = document.createElement("tr")
    for(let x = 0; x < grid.length; x++) {
        let th = document.createElement("th")
        let button = document.createElement("button")

        button.innerText = "V"
        button.classList.add("placeButton")

        if (legalMoves.includes(x)) {
            button.addEventListener("click", function () {
                act(x)
            })
        } else {
            button.disabled = true
        }

        th.appendChild(button)
        tr.appendChild(th)
    }
    gameBoard.appendChild(tr)

    for(let y = 0; y < grid.length; y++) {
        let tr = document.createElement("tr")

        for(let x = 0; x < grid[0].length; x++) {
            td = document.createElement("td")
            
            td.id = y + ":" + x

            if (grid[y][x] == 1) {
                td.classList.add("white")
            } else if (grid[y][x] == -1) {
                td.classList.add("black")
            }

            tr.appendChild(td)
        }

        gameBoard.appendChild(tr)
    }
}