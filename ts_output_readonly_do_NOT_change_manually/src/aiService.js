var aiService;
(function (aiService) {
    /** Returns a simply random move that the computer player should do for the given state in move. */
    function findSimplyComputerMove(move) {
        var possibleMove = null;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 1; j < gameLogic.COLS; j++) {
                for (var k = 0; k <= 3; k++) {
                    try {
                        var moves = new Array();
                        moves.push({ row: i, col: j - 1 });
                        moves.push({ row: i, col: j });
                        switch (k) {
                            case 0:
                                moves.push({ row: i - 1, col: j - 1 });
                                break;
                            case 1:
                                moves.push({ row: i - 1, col: j });
                                break;
                            case 2:
                                moves.push({ row: i + 1, col: j });
                                break;
                            case 3:
                                moves.push({ row: i + 1, col: j - 1 });
                                break;
                        }
                        moves.push({ row: i, col: j - 1 });
                        possibleMove = gameLogic.createMove(move.stateAfterMove, moves, move.turnIndexAfterMove);
                        return possibleMove;
                        break;
                    }
                    catch (e) {
                    }
                }
            }
        }
        return possibleMove;
    }
    aiService.findSimplyComputerMove = findSimplyComputerMove;
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move) {
        return createComputerMove(move, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 });
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * Returns all the possible moves for the given state and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                try {
                }
                catch (e) {
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given state.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(move, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        return alphaBetaService.alphaBetaDecision(move, move.turnIndexAfterMove, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        var endMatchScores = move.endMatchScores;
        if (endMatchScores) {
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move.stateAfterMove, playerIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map