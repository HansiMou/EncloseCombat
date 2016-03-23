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
                    }
                    catch (e) {
                    }
                }
            }
        }
        return possibleMove;
    }
    aiService.findSimplyComputerMove = findSimplyComputerMove;
    /** Returns a more intelligent move that the computer player should do for the given state in move. */
    function findCleverComputerMove(move) {
        var res = null;
        var maxlen = 0;
        var maxmoves = new Array();
        var used = new Array();
        var moves = new Array();
        for (var i = 0; i < gameLogic.ROWS; i++) {
            used[i] = new Array();
            for (var j = 0; j < gameLogic.COLS; j++) {
                used[i][j] = false;
            }
        }
        log.info("rrr");
        try {
            for (var i = 0; i < gameLogic.ROWS; i++) {
                for (var j = 0; j < gameLogic.COLS; j++) {
                    var tmpres = search(move.stateAfterMove.board, i, j, '', moves, used);
                    if (tmpres.len > maxlen) {
                        maxmoves = tmpres.moves;
                    }
                }
            }
            res = gameLogic.createMove(move.stateAfterMove, maxmoves, move.turnIndexAfterMove);
        }
        catch (e) {
            log.info(e);
        }
        return res;
    }
    aiService.findCleverComputerMove = findCleverComputerMove;
    function search(board, row, col, color, moves, used) {
        if (row < 0 || row > gameLogic.ROWS || col < 0 || col > gameLogic.COLS || (color !== '' && board[row][col] !== color)) {
            return { len: 0, moves: null };
        }
        if (color !== '' && moves !== null && moves.length >= 3 && used[row][col] === true
            && row === moves[0].row && col === moves[0].col) {
            moves.push({ row: row, col: col });
            return { len: moves.length - 1, moves: moves };
        }
        if (color === '') {
            color = board[row][col];
        }
        used[row][col] = true;
        moves.push({ row: row, col: col });
        var r = new Array();
        if (row + 1 < gameLogic.ROWS && board[row + 1][col] === color) {
            r.push(search(board, row + 1, col, color, moves, used));
        }
        if (row + 1 < gameLogic.ROWS && col + 1 < gameLogic.COLS && board[row + 1][col + 1] === color) {
            r.push(search(board, row + 1, col + 1, color, moves, used));
        }
        if (row + 1 < gameLogic.ROWS && col - 1 > 0 && board[row + 1][col - 1] === color) {
            r.push(search(board, row + 1, col - 1, color, moves, used));
        }
        if (col + 1 < gameLogic.COLS && board[row][col + 1] === color) {
            r.push(search(board, row, col + 1, color, moves, used));
        }
        if (col - 1 > 0 && board[row][col - 1] === color) {
            r.push(search(board, row, col - 1, color, moves, used));
        }
        if (row - 1 > 0 && col - 1 > 0 && board[row - 1][col - 1] === color) {
            r.push(search(board, row - 1, col - 1, color, moves, used));
        }
        if (row - 1 > 0 && board[row - 1][col] === color) {
            r.push(search(board, row - 1, col, color, moves, used));
        }
        if (row - 1 > 0 && col + 1 < gameLogic.COLS && board[row - 1][col + 1] === color) {
            r.push(search(board, row - 1, col + 1, color, moves, used));
        }
        moves.pop();
        used[row][col] = false;
        var maxlen = 0;
        var maxmoves = new Array();
        for (var i = 0; i < r.length; i++) {
            if (r[i].len > maxlen) {
                maxlen = r[i].len;
                maxmoves = r[i].moves;
            }
        }
        return { len: maxlen, moves: maxmoves };
    }
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