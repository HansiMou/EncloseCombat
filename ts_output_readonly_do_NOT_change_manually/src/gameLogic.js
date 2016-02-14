//TODO: have not written refresh method if there is no move can make.
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 8;
    gameLogic.COLS = 6;
    gameLogic.num_of_players = 2;
    gameLogic.total_turns = 10;
    gameLogic.num_of_colors = 3;
    /** Returns the initial EncloseCombat board, which is a ROWSxCOLS matrix containing the initial of a certain color. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                // board[i][j] = getRandomColor();
                board[i][j] = 'C';
            }
        }
        return board;
    }
    /** Between 1 to num_of_colors, a random number is chosen and return a corresponding color */
    function getRandomColor() {
        var res = Math.floor((Math.random() * gameLogic.num_of_colors) + 1);
        switch (res) {
            case 1:
                return 'C'; // short for cyan
                break;
            case 2:
                return 'G'; // short for green
                break;
            case 3:
                return 'B'; // short for blue
                break;
            default:
                break;
        }
    }
    function getIntialScores() {
        var scores = [];
        for (var i = 0; i < gameLogic.num_of_players; i++) {
            scores[i] = 0;
        }
        return scores;
    }
    /** Set the first turn to be 1, and the intial score for all players to be 0 */
    function getInitialState() {
        return { board: getInitialBoard(), delta: null, current_turn: 1, scores: getIntialScores() };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Returns true if the game ended in a tie because game reaches the maximum of turns,
     * and at least two players have the identical scores.
     */
    function isTie(FState) {
        if (FState.current_turn >= gameLogic.total_turns && twoOrMoreHaveSameScores(FState.scores)) {
            return true;
        }
        return false;
    }
    /** Check if at least two players have the same scores
     * reference: http://superivan.iteye.com/blog/1131328
     * UNTESTED
    */
    function twoOrMoreHaveSameScores(scores) {
        var s = scores.join(",") + ",";
        for (var i = 0; i < scores.length; i++) {
            if (s.replace(scores[i] + ",", "").indexOf(scores[i] + ",") > -1) {
                return true;
            }
        }
        return false;
    }
    /**
     * Return the winner (either '1' or '2' or '3' ...) or '' if there is no winner.
     * getWinner will return the player with highest score at the final turn.
     */
    function getWinner(S) {
        if (isTie(S)) {
            return '';
        }
        if (S.current_turn == gameLogic.total_turns) {
            // Find the one with maximum score
            var max = Math.max.apply(null, S.scores);
            for (var i = 0; i < S.scores.length; i++) {
                if (max == S.scores[i]) {
                    return i + 1 + '';
                }
            }
        }
        return '';
    }
    /** return wether one number is in the array */
    function contains(a, row, col) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].row === row && a[i].col === col) {
                return true;
            }
        }
        return false;
    }
    function getBoardAndScore(board, moves) {
        var score = 0;
        var boardAfterMove = board;
        var helper = [];
        // initialize the auxiliary boolean[][] array. 
        for (var i = 0; i < gameLogic.ROWS; i++) {
            helper[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                helper[i][j] = false;
            }
        }
        // Value inside of the circle will be set to 'true', otherwise false  
        for (var i = 0; i < gameLogic.ROWS; i++) {
            var left = 0;
            var right = 0;
            outer: while (left < gameLogic.COLS) {
                if (contains(moves, i, left)) {
                    helper[i][left] = true;
                    score++;
                    right = left + 1;
                    inner: while (right < gameLogic.COLS) {
                        if (contains(moves, i, right)) {
                            for (var j = left + 1; j <= right; j++) {
                                helper[i][j] = true;
                                score++;
                            }
                            left = right + 1;
                            break inner;
                        }
                        else {
                            helper[i][right++] = false;
                        }
                    }
                    if (right === gameLogic.COLS) {
                        break outer;
                    }
                }
                else {
                    helper[i][left++] = false;
                }
            }
        }
        //   refill the circle with the chips above and refill the above empty ones with random color
        for (var j = gameLogic.COLS - 1; j >= 0; j--) {
            var flag = gameLogic.ROWS - 1;
            for (var i = gameLogic.ROWS - 1; i >= 0; i--) {
                var tmp = getColor(boardAfterMove, helper, flag, i, j);
                flag = tmp.flag;
                boardAfterMove[i][j] = tmp.color;
                flag--;
            }
        }
        return { score: score, board: boardAfterMove };
    }
    function getColor(board, helper, flag, row, col) {
        while (flag >= 0) {
            if (helper[flag][col] === false) {
                break;
            }
            else {
                flag--;
            }
        }
        if (flag < 0) {
            //   return {color: getRandomColor(), flag: flag};
            return { color: 'R', flag: flag };
        }
        return { color: board[flag][col], flag: flag };
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, moves, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        checkMove(board, moves);
        if (isTie(stateBeforeMove) || getWinner(stateBeforeMove) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        // TODO: to refill the board
        var tmp = getBoardAndScore(board, moves);
        var boardAfterMove = tmp.board;
        /**Get the updated scores */
        var scores = stateBeforeMove.scores;
        scores[turnIndexBeforeMove] += tmp.score;
        var stateAfterMove = {
            board: boardAfterMove,
            delta: moves,
            current_turn: stateBeforeMove.current_turn + 1,
            scores: scores
        };
        var winner = getWinner(stateAfterMove);
        var currentScore = scores;
        var turnIndexAfterMove;
        if (winner !== '' || isTie(stateAfterMove)) {
            // Game over.
            turnIndexAfterMove = -1;
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndexAfterMove = gameLogic.num_of_players - 1 - turnIndexBeforeMove;
        }
        return { turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove };
    }
    gameLogic.createMove = createMove;
    /** check if this move sticks to the rule and throws responding error */
    function checkMove(board, moves) {
        // it should have at least three points
        if (moves.length <= 3) {
            throw new Error("You should draw a circle with at least three points");
            return false;
        }
        // last point should be the first point 
        if (!(moves[0].row == moves[moves.length - 1].row && moves[0].col == moves[moves.length - 1].col)) {
            throw new Error("You should draw a enclosed circle");
            return false;
        }
        // there should not be duplicate points except for the last point
        if (checkDuplicate(moves)) {
            throw new Error("You should a draw enclosed circle without duplicates");
            return false;
        }
        for (var i = 1; i < moves.length; i++) {
            // points should be next the previous one
            if (!(Math.abs(moves[i].row - moves[i - 1].row) <= 1 && Math.abs(moves[i].col - moves[i - 1].col) <= 1)) {
                throw new Error("Point selected should be closed to the previous one");
                return false;
            }
            // Points should all be the same color
            if (board[moves[i].row][moves[i].col] != board[moves[i - 1].row][moves[i - 1].col]) {
                throw new Error("Points should all be the same color");
                return false;
            }
        }
        return true;
    }
    /** Check if there are any duplicate points in the moves except for the last one */
    function checkDuplicate(moves) {
        var tmp = [];
        for (var i = 0; i < moves.length - 1; i++) {
            tmp[i] = moves[i].row * gameLogic.COLS + moves[i].col;
        }
        var s = tmp.join(",") + ",";
        for (var i = 0; i < tmp.length; i++) {
            if (s.replace(tmp[i] + ",", "").indexOf(tmp[i] + ",") > -1) {
                return true;
            }
        }
        return false;
    }
    function checkMoveOk(stateTransition) {
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that the move is OK.
        var turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        var stateBeforeMove = stateTransition.stateBeforeMove;
        var move = stateTransition.move;
        var deltaValue = stateTransition.move.stateAfterMove.delta;
        var expectedMove = createMove(stateBeforeMove, deltaValue, turnIndexBeforeMove);
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(expectedMove, true) +
                ", but got stateTransition=" + angular.toJson(stateTransition, true));
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, [{ row: 0, col: 0 }], 0);
        log.log("move=", move);
        var params = {
            turnIndexBeforeMove: 0,
            stateBeforeMove: null,
            move: move,
            numberOfPlayers: 2 };
        gameLogic.checkMoveOk(params);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map