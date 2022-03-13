class Node{
    static root(initialState) {
        return new Node(null, null, initialState);
    }

    constructor(parent, parentAction, state) {
        this.parent = parent;
        this.parentAction = parentAction;

        this.state = state;
        this.valuesSum = 0.;
        this.numVisits = 0;

        this.children = [];
        this.unexploredActions = this.state.legalMoves;
    }

    calcUcb(exploration_bias) {
        let n = this.numVisits;
        let N = this.parent.numVisits;

        let v = this.valuesSum / this.numVisits;
        let u = exploration_bias * Math.sqrt(Math.log(N) / n);

        return v + u
    }

    selectChild(exploration_bias=Math.sqrt(2)) {
        let highestUcb = undefined;
        let selected = undefined;
        
        this.children.forEach(child => {
            let currentUcb = child.calcUcb(exploration_bias);
            
            if (currentUcb > highestUcb || highestUcb == undefined) {
                highestUcb = currentUcb;
                selected = child;
            }
        })

        return selected
    }

    isFullyExpanded() {
        return this.unexploredActions.length == 0;
    }

    traverse() {
        let currentNode = this;

        while(currentNode.isFullyExpanded() && !currentNode.state.isTerminal) {
            currentNode = currentNode.selectChild();
        }

        return currentNode;
    }  
    
    expand() {
        let action = this.unexploredActions.pop();
        let new_state = this.state.step(action);
        let new_child = new Node(this, action, new_state);

        this.children.push(new_child);

        return new_child;
    }

    static randomPolicy(state) {
        let possibleActions = state.legalMoves;
        let randomIndex = Math.floor(Math.random() * possibleActions.length);

        return state.step(possibleActions[randomIndex]);
    }

    rollout() {
        let currentState = this.state;
        
        while(!currentState.isTerminal){
            currentState = Node.randomPolicy(currentState);
        }

        return currentState.intermediateReward;
    }

    backprop(value) {
        let currentNode = this

        while(currentNode != null) {
            currentNode.valuesSum += value;
            currentNode.numVisits += 1;

            currentNode = currentNode.parent;
            value = -value;
        }
    }

    bestAction() {
        let bestChild = undefined;
        let highestVisits = undefined;

        this.children.forEach(child => {
            let currentVisits = child.numVisits;

            if (currentVisits > highestVisits || highestVisits == undefined) {
                highestVisits = currentVisits;
                bestChild = child;
            }
        })

        return bestChild.parentAction;
    }
}

function search(initialState, iterations) {
    let root = Node.root(initialState);

    for(let i = 0; i < iterations; i++) {
        let selectedNode = root.traverse();

        if (!selectedNode.state.isTerminal) {
            selectedNode = selectedNode.expand();

            value = selectedNode.rollout()
        } else {
            value = selectedNode.state.intermediateReward;
        }

        selectedNode.backprop(value);
    }

    return root.bestAction()
}


class Player {
    static WHITE() {
        return new Player(1)
    }

    static BLACK() {
        return new Player(-1)
    }

    constructor(color) {
        this.color = color
    }

    opponent() {
        return new Player(-this.color)
    }
}

class Board {
    static initial(height, width) {
        let grid = []
        
        for(let y = 0; y < height; y++){
            let column = []

            for (let x = 0; x < width; x++) {
                column.push(0)
            }

            grid.push(column)
        }

        return new Board(grid, height, width)
    }

    constructor(grid, height, width) {
        this.grid = grid
        this.height = height
        this.width = width
    }

    clone() {
        let gridCopy = JSON.parse(JSON.stringify(this.grid));
        
        return new Board(gridCopy, this.height, this.width)
    }

    placePiece(x, color) {
        for(let y = this.height - 1; y >= 0; y--) {
            let currentPiece = this.grid[y][x]

            if (currentPiece == 0) {
                this.grid[y][x] = color

                return true
            }
        }

        return false
    }

    generateLegalMoves() {
        let legalMoves = []

        for(let column = 0; column < this.width; column++) {
            let cur = this.grid[0][column]
            
            if (cur == 0) {
                legalMoves.push(column)
            } 
        }

        return legalMoves
    }

    containsStraightStreak() {
        for(let y = 0; y < this.height; y++) {
            let streak = 0
            let last = 0
            
            for (let x = 0; x < this.width; x++) {
                let cur = this.grid[y][x]

                if (cur != last) {
                    streak = 0
                    last = cur
                } else if (streak == 3 && cur != 0) {
                    return true
                }

                streak += 1
            }
        }

        for(let x = 0; x < this.width; x++) {
            let streak = 0
            let last = 0
            
            for (let y = 0; y < this.height; y++) {
                let cur = this.grid[y][x]

                if (cur != last) {
                    streak = 0
                    last = cur
                } else if (streak == 3 && cur != 0) {
                    return true
                }

                streak += 1
            }
        }

        return false
    }

    containsDiagonalStreak() {
        for(let x = -this.height; x < this.width + this.height; x++) {
            let streak = 0
            let last = 0

            for (let y = 0; y < this.height; y++) {
                let x_pos = x + y

                if(!(0 <= x_pos && x_pos < this.width)) {
                    continue
                }

                let cur = this.grid[y][x_pos]

                if (cur != last) {
                    streak = 0
                    last = cur
                } else if (streak == 3 && cur != 0) {
                    return true;
                }

                streak += 1
            }
        }

        for(let x = this.width + this.height; x > -this.height; x--) {
            let streak = 0
            let last = 0

            for (let y = 0; y < this.height; y++) {
                let x_pos = x - y

                if(!(0 <= x_pos && x_pos < this.width)) {
                    continue
                }

                let cur = this.grid[y][x_pos]

                if (cur != last) {
                    streak = 0
                    last = cur
                } else if (streak == 3 && cur != 0) {
                    return true;
                }

                streak += 1
            }
        }

        return false
    }

    containsStreak() {
        if (this.containsStraightStreak()) {
            return true
        } else if (this.containsDiagonalStreak()) {
            return true
        } else {
            return false
        }
    }
}

class GameState {
    static initial(height, width) {
        let board = Board.initial(height, width)
        let gameState = new GameState(board, Player.WHITE())

        return gameState
    }
    
    constructor(board, activePlayer) {
        this.board = board
        this.activePlayer = activePlayer

        this.legalMoves = board.generateLegalMoves()
        this.isTerminal = board.containsStreak() || this.legalMoves.length == 0
        this.intermediateReward = this.generateReward()
    }

    step(column) {
        let newBoard = this.board.clone()
        newBoard.placePiece(column, this.activePlayer.color)

        let opponent = this.activePlayer.opponent()

        return new GameState(newBoard, opponent)
    }

    generateReward() {
        let reward = 0.
        
        if (this.isTerminal && this.legalMoves.length != 0) {
            reward = 1.
        }
        
        return reward
    }   
}