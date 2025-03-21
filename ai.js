// ai.js

class AIPlayer {
    constructor(difficulty = 'medium', symbol = 'O') {
        this.difficulty = difficulty;
        this.symbol = symbol;
        this.opponentSymbol = symbol === 'X' ? 'O' : 'X'; // Determine opponent's symbol
    }

    getMove(gameState) {
        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove(gameState);
            case 'medium':
                return this.getMediumMove(gameState);
            case 'hard':
                return this.getMinimaxMove(gameState); // Implement later
            default:
                return this.getRandomMove(gameState);
        }
    }

    getRandomMove(gameState) {
        const availableMoves = [];
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                availableMoves.push(i);
            }
        }
        if (availableMoves.length === 0) {
            return null; // No moves available (tie game)
        }
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    getMediumMove(gameState) {
        // 1. Check if AI can win in the next move
        const winningMove = this.findWinningMove(gameState, this.symbol);
        if (winningMove !== null) {
            return winningMove;
        }

        // 2. Check if opponent can win in the next move, and block
        const blockingMove = this.findWinningMove(gameState, this.opponentSymbol);
        if (blockingMove !== null) {
            return blockingMove;
        }

        // 3. Otherwise, choose a random available move
        return this.getRandomMove(gameState);
    }
    findWinningMove(gameState, symbol) {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === symbol && gameState[b] === symbol && gameState[c] === '') return c;
            if (gameState[a] === symbol && gameState[c] === symbol && gameState[b] === '') return b;
            if (gameState[b] === symbol && gameState[c] === symbol && gameState[a] === '') return a;
        }

        return null; // No winning move found
    }
 getMinimaxMove(gameState) {
        // Call the minimax function with initial values
        return this.minimax(gameState, this.symbol, 0).index;
    }

    minimax(gameState, currentPlayer, depth) {
        // 1. Check for terminal states (win, lose, tie)
        const winner = this.checkWinner(gameState);
        if (winner === this.symbol) {
            return { score: 10 - depth }; // Higher score for quicker wins
        } else if (winner === this.opponentSymbol) {
            return { score: depth - 10 }; // Lower score for quicker losses
        } else if (this.isTie(gameState)) {
            return { score: 0 };
        }

        // 2. Initialize best move object
        const moves = [];

        // 3. Iterate through available moves
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                // Create a new board state with the potential move
                const newGameState = [...gameState];
                newGameState[i] = currentPlayer;

                // Recursively call minimax for the opponent's turn
                const result = this.minimax(newGameState, currentPlayer === this.symbol ? this.opponentSymbol : this.symbol, depth + 1);

                // Store the move and its score
                moves.push({
                    index: i,
                    score: result.score
                });
            }
        }

        // 4. Choose the best move based on the current player
        let bestMove;
        if (currentPlayer === this.symbol) {
            // Maximizing player (AI)
            let bestScore = -Infinity;
            for (const move of moves) {
                if (move.score > bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        } else {
            // Minimizing player (opponent)
            let bestScore = Infinity;
            for (const move of moves) {
                if (move.score < bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        }
        return bestMove;
    }

    checkWinner(gameState) {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return gameState[a]; // Return the winning symbol ('X' or 'O')
            }
        }
        return null; // No winner
    }

    isTie(gameState) {
        return !gameState.includes(''); // Check if there are no empty cells
    }

}
 export default AIPlayer;
