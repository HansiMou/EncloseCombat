//TODO: have not written refresh method if there is no move can make.
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 8;
    gameLogic.COLS = 6;
    gameLogic.num_of_players = 2;
    gameLogic.total_turns = 20;
    gameLogic.num_of_colors = 4;
    /** Returns the initial EncloseCombat board, which is a ROWSxCOLS matrix containing the initial of a certain color. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = getRandomColor();
            }
        }
        while (!CheckMovesAvaiable(board)) {
            board = getInitialBoard();
        }
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    /** Between 1 to num_of_colors, a random number is chosen and return a corresponding color */
    function getRandomColor() {
        var res = Math.floor((Math.random() * gameLogic.num_of_colors) + 1);
        switch (res) {
            case 1:
                return 'R'; // short for red
            case 2:
                return 'G'; // short for green
            case 3:
                return 'B'; // short for blue
            case 4:
                return 'X'; // short for blue
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
    gameLogic.getIntialScores = getIntialScores;
    /** Set the first turn to be 1, and the intial score for all players to be 0 */
    function getInitialState() {
        var ib = getInitialBoard();
        var index = Math.floor((Math.random() * 18) + 1);
        return { board: angular.copy(ib), delta: null, current_turn: 0, scores: getIntialScores(), initialboard: angular.copy(ib), changed_delta: null, random: index % 2 === 0 ? index - 1 : index };
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
    function getBoardAndScoreAndChangedArea(board, moves) {
        var score = 0;
        var boardAfterMove = board;
        var changed_delta = [];
        var helper = [];
        var cleanR = false;
        var cleanG = false;
        var cleanB = false;
        var cleanX = false;
        var bonus_multiplyingpower = 1;
        // initialize the auxiliary boolean[][] array. 
        for (var i = 0; i < gameLogic.ROWS; i++) {
            helper[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                helper[i][j] = false;
            }
        }
        // Value inside of the circle will be set to 'true', otherwise false  
        for (var i = 0; i < gameLogic.ROWS; i++) {
            var range = foundRangeOfCertainRow(moves, i);
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (j >= range.left && j <= range.right) {
                    helper[i][j] = true;
                }
                else {
                    helper[i][j] = false;
                }
            }
        }
        for (var i = 0; i < gameLogic.COLS; i++) {
            var range = foundRangeOfCertainCol(moves, i);
            for (var j = 0; j < gameLogic.ROWS; j++) {
                if (j >= range.left && j <= range.right && helper[j][i] == true) {
                    if (!contains(moves, j, i)) {
                        switch (board[j][i]) {
                            case 'R':
                                cleanR = true;
                                break;
                            case 'G':
                                cleanG = true;
                                break;
                            case 'B':
                                cleanB = true;
                                break;
                            case 'X':
                                cleanX = true;
                                break;
                        }
                    }
                }
                else {
                    helper[j][i] = false;
                }
            }
        }
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (cleanR === true && board[i][j] === 'R') {
                    helper[i][j] = true;
                }
                else if (cleanG === true && board[i][j] === 'G') {
                    helper[i][j] = true;
                }
                else if (cleanB === true && board[i][j] === 'B') {
                    helper[i][j] = true;
                }
                else if (cleanX === true && board[i][j] === 'X') {
                    helper[i][j] = true;
                }
                if (helper[i][j] === true) {
                    changed_delta.push({ row: i, col: j });
                    score++;
                }
            }
        }
        //   throw new Error(angular.toJson(helper, true));
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
        // score = score * multiply factor
        score = score * (1 + (cleanB == true ? 1 : 0) + (cleanG == true ? 1 : 0) + (cleanR == true ? 1 : 0) + (cleanX == true ? 1 : 0));
        return { score: score * bonus_multiplyingpower, board: boardAfterMove, changed_delta: changed_delta };
    }
    function foundRangeOfCertainRow(moves, row) {
        var left = 100;
        var right = -2;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].row === row) {
                left = Math.min(moves[i].col, left);
                right = Math.max(moves[i].col, right);
            }
        }
        return { left: left, right: right };
    }
    function foundRangeOfCertainCol(moves, col) {
        var left = 100;
        var right = -2;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].col === col) {
                left = Math.min(moves[i].row, left);
                right = Math.max(moves[i].row, right);
            }
        }
        return { left: left, right: right };
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
            return { color: getRandomColor(), flag: flag };
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
        // log.info(["before", angular.toJson(board)]);
        checkMove(board, moves);
        if (isTie(stateBeforeMove) || getWinner(stateBeforeMove) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        // TODO: to refill the board
        var boardAfterMove = angular.copy(board);
        var tmp = getBoardAndScoreAndChangedArea(boardAfterMove, moves);
        boardAfterMove = tmp.board;
        while (!CheckMovesAvaiable(boardAfterMove)) {
            boardAfterMove = getInitialBoard();
        }
        // log.info(["after", angular.toJson(boardAfterMove)]);
        /**Get the updated scores */
        var scores = angular.copy(stateBeforeMove.scores);
        scores[turnIndexBeforeMove] += tmp.score;
        var tmpp = angular.copy(stateBeforeMove.initialboard ? stateBeforeMove.initialboard : stateBeforeMove.board);
        if (!stateBeforeMove.initialboard) {
            log.info("wtf2", stateBeforeMove);
        }
        var stateAfterMove = {
            board: boardAfterMove,
            delta: moves,
            current_turn: stateBeforeMove.current_turn + 1,
            scores: scores,
            initialboard: tmpp,
            changed_delta: angular.copy(tmp.changed_delta),
            random: stateBeforeMove.random,
        };
        var winner = getWinner(stateAfterMove);
        var endMatchScores;
        var currentScore = scores;
        var turnIndexAfterMove;
        if (winner !== '' || isTie(stateAfterMove)) {
            // Game over.
            turnIndexAfterMove = -1;
            endMatchScores = winner === '1' ? [1, 0] : winner === '2' ? [0, 1] : [0, 0];
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndexAfterMove = gameLogic.num_of_players - 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        return { endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove };
    }
    gameLogic.createMove = createMove;
    /** check if there is more available moves */
    function CheckMovesAvaiable(board) {
        log.info("really? wsgo");
        var used = [];
        for (var i = 0; i < board.length; i++) {
            used[i] = [];
            for (var j = 0; j < board[0].length; j++) {
                used[i][j] = false;
            }
        }
        for (var i = 0; i < board.length; i++) {
            used[i] = [];
            for (var j = 0; j < board[0].length; j++) {
                if (search(board, i, j, 0, used, i, j)) {
                    log.info("really? available", board);
                    return true;
                }
            }
        }
        log.info("really?", board);
        return false;
    }
    function search(board, i, j, index, used, si, sj) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length
            || board[i][j] != board[si][sj] || used[i][j] == true)
            return false;
        if (index >= 2 && board[i][j] == board[si][sj] && Math.abs(si - i) <= 1
            && Math.abs(sj - j) <= 1)
            return true;
        used[i][j] = true;
        var res = search(board, i + 1, j, index + 1, used, si, sj)
            || search(board, i - 1, j, index + 1, used, si, sj)
            || search(board, i + 1, j + 1, index + 1, used, si, sj)
            || search(board, i + 1, j - 1, index + 1, used, si, sj)
            || search(board, i - 1, j + 1, index + 1, used, si, sj)
            || search(board, i - 1, j - 1, index + 1, used, si, sj)
            || search(board, i, j + 1, index + 1, used, si, sj)
            || search(board, i, j - 1, index + 1, used, si, sj);
        used[i][j] = false;
        return res;
    }
    /** check if this move sticks to the rule and throws responding error */
    function checkMove(board, moves) {
        // all moves should be positive
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].row < 0 || moves[i].col < 0 || moves[i].row >= 8 || moves[i].col >= 6) {
                throw new Error("All moves should be positive");
            }
        }
        // it should have at least three points
        if (moves.length <= 3) {
            throw new Error("You should draw a circle with at least three points");
        }
        // last point should be the first point 
        if (!(moves[0].row === moves[moves.length - 1].row && moves[0].col === moves[moves.length - 1].col)) {
            throw new Error("You should draw a enclosed circle");
        }
        // there should not be duplicate points except for the last point
        if (checkDuplicate(moves)) {
            throw new Error("You should a draw enclosed circle without duplicates");
        }
        for (var i = 1; i < moves.length; i++) {
            // points should be next the previous one
            if (!(Math.abs(moves[i].row - moves[i - 1].row) <= 1 && Math.abs(moves[i].col - moves[i - 1].col) <= 1)) {
                throw new Error("Point selected should be closed to the previous one");
            }
            // Points should all be the same color
            if (board[moves[i].row][moves[i].col] !== board[moves[i - 1].row][moves[i - 1].col]) {
                log.info("after", angular.toJson(board));
                throw new Error("Points should all be the same color");
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
        var ntmp = tmp.sort();
        log.info(ntmp);
        for (var i = 0; i < ntmp.length - 1; i++) {
            if (ntmp[i] === ntmp[i + 1]) {
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
    function checkMoveOkNoOp(stateTransition) {
    }
    gameLogic.checkMoveOkNoOp = checkMoveOkNoOp;
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