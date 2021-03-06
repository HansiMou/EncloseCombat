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
;
;
var game;
(function (game) {
    // I export all letiables to make it easy to debug in the browser by
    // simply typing in the console:
    // game.state
    game.currentUpdateUI = null;
    game.animationEnded = false;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.state = null;
    game.isHelpModalShown = false;
    game.moves = new Array();
    game.msg = "";
    game.animationEndedTimeout = null;
    game.ismyscore = 0;
    game.shouldshowscore = true;
    game.linesstyle = false;
    function init($http) {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_ENCLOSECOMBAT' is " + translate('RULES_OF_ENCLOSECOMBAT'));
        resizeGameAreaService.setWidthToHeight(0.6818);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOkNoOp,
            updateUI: updateUI
        });
        var w = window;
        if (w["HTMLInspector"]) {
            setInterval(function () {
                w["HTMLInspector"].inspect({
                    excludeRules: ["unused-classes", "script-placement"],
                });
            }, 3000);
        }
        $http({
            method: 'GET',
            url: 'http://cs.nyu.edu/~hm1305/smg/score'
        }).then(function successCallback(response) {
            game.record = parseInt(response.data);
            log.info("finallll", angular.toJson(response.data));
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            log.info("finalll", response);
            game.record = 0;
        });
    }
    game.init = init;
    function getTranslations() {
        return {
            RULES_OF_ENCLOSECOMBAT: {
                en: "Rules of EncloseCombat",
                zh: "滑块大战的规则",
            },
            ENCLOSECOMBAT_RULES_SLIDE1: {
                en: "You and your opponent take turns to draw an enclosed shape over the chips of same color. The more the area is, the higher the score will be.",
                zh: "你和你的对手轮流操作，在相同颜色的卡片上围成一个闭合的形状。然后这个形状上和其内的卡片会消失，上面的会掉下来，新的卡片也会补充进来。",
            },
            ENCLOSECOMBAT_RULES_SLIDE2: {
                en: "If you have chips INSIDE the shape, all the same color chips will be gone with an extra bonus. After 20 turns, player with higher score win.",
                zh: "如果内部有色块，所有相同颜色的色块都会消失，你也会得到奖励。面积越大，分数越高，二十个回合之后分数高的人获胜。",
            },
            CLOSE: {
                en: "Close",
                zh: "关闭",
            },
            LEFT_TURNS: {
                en: "Turns left",
                zh: "剩余回合",
            },
            YOUR_SCORE: {
                en: "Current",
                zh: "当前分数",
            },
            HIGHEST_SCORE: {
                en: "Record",
                zh: "记录",
            },
            PLAYER: {
                en: "Player",
                zh: "玩家",
            },
            PLAYER1: {
                en: "Captain",
                zh: "美队",
            },
            PLAYER2: {
                en: "Ironman",
                zh: "钢铁侠",
            },
            PLAYER3: {
                en: "Batman",
                zh: "蝙蝠侠",
            },
            PLAYER4: {
                en: "Superman",
                zh: "超人",
            },
            PLAYER5: {
                en: "Deadpool",
                zh: "死侍",
            },
            PLAYER6: {
                en: "Ladypool",
                zh: "女死侍",
            },
            PLAYER7: {
                en: "Blade",
                zh: "刀锋",
            },
            PLAYER8: {
                en: "Deacon",
                zh: "Deacon",
            },
            PLAYER9: {
                en: "Thor",
                zh: "索尔",
            },
            PLAYER10: {
                en: "Loki",
                zh: "洛基",
            },
            PLAYER11: {
                en: "Hulk",
                zh: "浩克",
            },
            PLAYER12: {
                en: "Black Widow",
                zh: "黑寡妇",
            },
            PLAYER13: {
                en: "Batman",
                zh: "蝙蝠侠",
            },
            PLAYER14: {
                en: "Joker",
                zh: "小丑",
            },
            PLAYER15: {
                en: "Charles",
                zh: "X",
            },
            PLAYER16: {
                en: "Magneto",
                zh: "万磁王",
            },
            PLAYER17: {
                en: "Harley Quinn",
                zh: "哈莉·奎茵",
            },
            PLAYER18: {
                en: "Joker",
                zh: "小丑",
            }
        };
    }
    function animationEndedCallback() {
        log.info("Hi");
        log.info("Animation ended");
        game.animationEnded = true;
        game.shouldshowscore = true;
        clearAnimationTimeout();
        maybeSendComputerMove();
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn()) {
            return;
        }
        game.didMakeMove = true;
        var rline = document.getElementById("rline");
        var gameArea = document.getElementById("gameArea");
        var scorenotice = document.getElementById("scorenotice");
        var width = gameArea.clientWidth / gameLogic.COLS;
        var height = gameArea.clientHeight * 0.9 / gameLogic.ROWS;
        var tmp = "";
        var nextAIMove = aiService.findSimplyComputerMove(game.currentUpdateUI.move);
        nextAIMove.stateAfterMove.delta.forEach(function (entry) {
            var x = entry.col * width + width / 2;
            var y = entry.row * height + height / 2;
            tmp = tmp + x + "," + y + " ";
        });
        game.linesstyle = true;
        rline.setAttribute("points", tmp);
        scorenotice.setAttribute("z-index", "50");
        $timeout(function () {
            game.linesstyle = false;
            rline.setAttribute("points", "");
            moveService.makeMove(nextAIMove);
        }, 1500);
    }
    function updateUI(params) {
        // global and my local scoreboard update
        if (params.playMode === "passAndPlay" && params.move.stateAfterMove !== undefined) {
            var current_game_score = params.move.stateAfterMove.scores[0] + params.move.stateAfterMove.scores[1];
            if (current_game_score > parseInt(game.getHighestScore())) {
                localStorage.setItem("score", current_game_score + "");
            }
            if (current_game_score > game.getHighestScoreGlobally()) {
                game.$httpt({
                    method: 'GET',
                    url: 'http://cs.nyu.edu/~hm1305/smg/index.php?NameAndScore=' + current_game_score
                }).then(function successCallback(response) {
                    log.info("finallll", angular.toJson(response));
                    game.record = current_game_score;
                }, function errorCallback(response) {
                    log.info("finalll", response);
                });
            }
        }
        log.info("Game got updateUI???:", params);
        game.animationEnded = false;
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        var rline = document.getElementById("rline");
        var gameArea = document.getElementById("gameArea");
        var width = gameArea.clientWidth / gameLogic.COLS;
        var height = gameArea.clientHeight * 0.9 / gameLogic.ROWS;
        clearAnimationTimeout();
        log.info(params.stateBeforeMove);
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
            // This is the first move in the match, so
            // there is not going to be an animation, so
            // call maybeSendComputerMove() now (can happen in ?onlyAIs mode)
            maybeSendComputerMove();
        }
        else {
            // set up the state before move 
            if (params.stateBeforeMove !== undefined) {
                game.state = params.stateBeforeMove;
                game.state.changed_delta = null;
                game.state = {
                    initialboard: params.stateBeforeMove.initialboard,
                    delta: params.stateBeforeMove.delta,
                    current_turn: params.stateBeforeMove.current_turn,
                    scores: params.stateBeforeMove.scores,
                    changed_delta: null,
                    random: params.stateBeforeMove.random,
                    board: params.stateBeforeMove.board
                };
            }
            else {
                game.state = {
                    initialboard: params.move.stateAfterMove.initialboard ? params.move.stateAfterMove.initialboard : params.move.stateAfterMove.board,
                    delta: [],
                    current_turn: 0,
                    scores: [0, 0],
                    changed_delta: null,
                    random: params.move.stateAfterMove.random,
                    board: params.move.stateAfterMove.initialboard ? params.move.stateAfterMove.initialboard : params.move.stateAfterMove.board
                };
            }
            if (isMyTurn() && game.currentUpdateUI.playMode !== "passAndPlay" && game.currentUpdateUI.playMode !== "playAgainstTheComputer") {
                // set up the sliding lines of opponent
                var tmp = "";
                game.currentUpdateUI.move.stateAfterMove.delta.forEach(function (entry) {
                    var x = entry.col * width + width / 2;
                    var y = entry.row * height + height / 2;
                    tmp = tmp + x + "," + y + " ";
                });
                game.shouldshowscore = true;
                // clear the score animation
                $timeout(function () {
                    game.shouldshowscore = false;
                }, 1000);
                game.linesstyle = true;
                rline.setAttribute("points", tmp);
                $timeout(function () {
                    // remove the lines 
                    game.linesstyle = false;
                    rline.setAttribute("points", "");
                    // change the state
                    game.state = game.currentUpdateUI.move.stateAfterMove;
                    game.shouldshowscore = false;
                    game.animationEndedTimeout = $timeout(animationEndedCallback, Math.max(1000, getMostMoveDownNum() * 250));
                }, 1500);
            }
            else {
                // clear the score animation
                $timeout(function () {
                    game.shouldshowscore = false;
                }, 1000);
                game.state = game.currentUpdateUI.move.stateAfterMove;
                game.animationEndedTimeout = $timeout(animationEndedCallback, Math.max(1000, getMostMoveDownNum() * 250));
            }
        }
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    // lcoalstorage
    function getHighestScore() {
        if (localStorage.getItem("score")) {
            return localStorage.getItem("score");
        }
        else {
            localStorage.setItem("score", "0");
            return 0;
        }
    }
    game.getHighestScore = getHighestScore;
    // global leaderboard to maintain
    function getHighestScoreGlobally() {
        return game.record;
    }
    game.getHighestScoreGlobally = getHighestScoreGlobally;
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    game.isComputerTurn = isComputerTurn;
    function isFirstMove() {
        return !game.currentUpdateUI.move.stateAfterMove;
    }
    function isPassAndPlay() {
        return game.currentUpdateUI.playMode ? game.currentUpdateUI.playMode === 'passAndPlay' : false;
    }
    game.isPassAndPlay = isPassAndPlay;
    function isComputer() {
        return game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex] !== undefined && game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex].playerId === '';
    }
    game.isComputer = isComputer;
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.move.turnIndexAfterMove >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }
    game.isMyTurn = isMyTurn;
    function isCurrentPlayerIndex(playerIndex) {
        return game.currentUpdateUI.move.turnIndexAfterMove == playerIndex;
    }
    game.isCurrentPlayerIndex = isCurrentPlayerIndex;
    function animationEndedorNot() {
        return game.didMakeMove;
    }
    game.animationEndedorNot = animationEndedorNot;
    function cellPressedUp($http) {
        log.info("Slided on cell:", angular.toJson(game.moves));
        var remindlines = document.getElementById("remindlines");
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        try {
            var nextMove = gameLogic.createMove(game.state, game.moves, game.currentUpdateUI.move.turnIndexAfterMove);
            moveService.makeMove(nextMove);
            game.moves = new Array();
        }
        catch (e) {
            log.info(e);
            game.moves = new Array();
            return;
        }
    }
    game.cellPressedUp = cellPressedUp;
    function getScores() {
        var afterscoresum = 0;
        var beforePlayer0 = 0;
        var beforePlayer1 = 0;
        var afterPlayer0 = 0;
        var afterPlayer1 = 0;
        if (game.currentUpdateUI.move.stateAfterMove) {
            afterPlayer0 = game.currentUpdateUI.move.stateAfterMove.scores[0];
            afterPlayer1 = game.currentUpdateUI.move.stateAfterMove.scores[1];
            afterscoresum = afterPlayer0 + afterPlayer1;
        }
        var beforescoresum = 0;
        if (game.currentUpdateUI.stateBeforeMove) {
            beforePlayer0 = game.currentUpdateUI.stateBeforeMove.scores[0];
            beforePlayer1 = game.currentUpdateUI.stateBeforeMove.scores[1];
            beforescoresum = beforePlayer0 + beforePlayer1;
        }
        var b = false;
        if (afterPlayer0 - beforePlayer0 > 0) {
            b = game.currentUpdateUI.yourPlayerIndex === 0;
            log.info("scoreby0", game.currentUpdateUI.yourPlayerIndex);
        }
        else if (afterPlayer1 - beforePlayer1 > 0) {
            b = game.currentUpdateUI.yourPlayerIndex === 1;
            log.info("scoreby1", game.currentUpdateUI.yourPlayerIndex);
        }
        return { score: afterscoresum - beforescoresum, color: b ? 'blue' : 'red' };
    }
    game.getScores = getScores;
    function shouldShowScore() {
        return !game.animationEnded && getScores().score !== 0;
    }
    game.shouldShowScore = shouldShowScore;
    function shouldShowImage(row, col) {
        return true;
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceR(row, col) {
        return game.state.board[row][col] === 'R';
    }
    game.isPieceR = isPieceR;
    function isPieceG(row, col) {
        return game.state.board[row][col] === 'G';
    }
    game.isPieceG = isPieceG;
    function isPieceB(row, col) {
        return game.state.board[row][col] === 'B';
    }
    game.isPieceB = isPieceB;
    function isPieceX(row, col) {
        return game.state.board[row][col] === 'X';
    }
    game.isPieceX = isPieceX;
    function getName() {
        if (game.state.random) {
            return 'PLAYER' + game.state.random;
        }
        return 'PLAYER';
    }
    game.getName = getName;
    function getOppoName() {
        if (game.state.random) {
            var tmp = game.state.random + 1;
            return 'PLAYER' + tmp;
        }
        return 'PLAYER';
    }
    game.getOppoName = getOppoName;
    function getMostMoveDownNum() {
        var res = [0, 0, 0, 0, 0, 0];
        var max = 0;
        if (game.currentUpdateUI.move.stateAfterMove.changed_delta) {
            for (var i = 0; i < game.currentUpdateUI.move.stateAfterMove.changed_delta.length; i++) {
                res[game.currentUpdateUI.move.stateAfterMove.changed_delta[i].col]++;
                max = Math.max(max, res[game.currentUpdateUI.move.stateAfterMove.changed_delta[i].col]);
            }
        }
        return max;
    }
    game.getMostMoveDownNum = getMostMoveDownNum;
    function getMoveDownClass(row, col) {
        var res = 0;
        if (game.state.changed_delta) {
            for (var i = 0; i < game.state.changed_delta.length; i++) {
                if (game.state.changed_delta[i].row >= row && game.state.changed_delta[i].col === col) {
                    res++;
                }
            }
        }
        log.info("test it out", game.animationEnded, row, col, res, game.state.changed_delta);
        if (res !== 0 && !game.animationEnded && game.state.changed_delta)
            return 'movedown' + res;
        return '';
    }
    game.getMoveDownClass = getMoveDownClass;
    function clickedOnModal(evt) {
        if (evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            game.isHelpModalShown = false;
        }
        return true;
    }
    game.clickedOnModal = clickedOnModal;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(['$http', function ($http) {
        'use strict';
        var gameArea = document.getElementById("gameArea");
        var draggingLines = document.getElementById("draggingLines");
        var pline = document.getElementById("pline");
        var pline2 = document.getElementById("pline2");
        var nextZIndex = 61;
        game.$httpt = $http;
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        var rowsNum = gameLogic.ROWS;
        var colsNum = gameLogic.COLS;
        var draggingPiece = null;
        var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
        function handleDragEvent(type, clientX, clientY) {
            // Center point in gameArea
            var realTop = gameArea.offsetTop + 0.1 * gameArea.clientHeight;
            var realHeight = gameArea.clientHeight * 0.9;
            var x = clientX - gameArea.offsetLeft;
            var y = clientY - realTop;
            var row, col;
            // Is outside gameArea?
            if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= realHeight) {
                if (draggingPiece) {
                }
                else {
                    draggingLines.style.display = "none";
                    draggingLines.offsetHeight;
                    return;
                }
            }
            else {
                // Inside gameArea. Let's find the containing square's row and col
                col = Math.floor(colsNum * x / gameArea.clientWidth);
                row = Math.floor(rowsNum * y / realHeight);
                var cy = realHeight / 2 / rowsNum * (row * 2 + 1);
                var cx = gameArea.clientWidth / 2 / colsNum * (col * 2 + 1);
                var percent = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (realHeight / 2 / rowsNum);
                if (game.moves.length !== 0) {
                    var XY = getSquareCenterXY(game.moves[game.moves.length - 1].row, game.moves[game.moves.length - 1].col);
                    // pline2.setAttribute("stroke", getColor(row, col));
                    pline2.setAttribute("x1", XY.x + "");
                    pline2.setAttribute("y1", XY.y + "");
                    pline2.setAttribute("x2", x + "");
                    pline2.setAttribute("y2", y + "");
                }
                // set up of the threshold
                if (percent > 0.8) {
                    if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
                        game.moves = new Array();
                        pline.setAttribute("points", "");
                        draggingLines.style.display = "none";
                        draggingLines.style.webkitTransform = 'scale(1)';
                        draggingLines.offsetHeight;
                    }
                    return;
                }
                if (type === "touchstart" && !draggingStartedRowCol) {
                    // drag started
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("e2e_test_div_" + draggingStartedRowCol.row + "x" + draggingStartedRowCol.col);
                }
                if (!draggingPiece) {
                    return;
                }
                if (game.isMyTurn() && type === "touchend") {
                    if (!(game.moves[game.moves.length - 1].row === row && game.moves[game.moves.length - 1].col === col)) {
                        var tt = game.isPieceR(row, col) ?
                            document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ?
                            document.getElementById("e2e_test_pieceG_" + row + "x" + col) : game.isPieceB(row, col) ?
                            document.getElementById("e2e_test_pieceB_" + row + "x" + col) : document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                        // tt.setAttribute("r", "55%");
                        // setTimeout(function(){tt.setAttribute("r", "40%");},100);
                        draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                        game.moves.push({ row: row, col: col });
                    }
                    log.info(angular.toJson(game.moves));
                    // draggingLines.style.webkitTransform = 'scale(1)';
                    dragDone($http);
                }
                else {
                    // Drag continue
                    // the first point or points around the last one
                    if ((game.moves.length === 0) || (!(game.moves[game.moves.length - 1].row === row && game.moves[game.moves.length - 1].col === col) && ((Math.abs(game.moves[game.moves.length - 1].row - row) <= 1) && (Math.abs(game.moves[game.moves.length - 1].col - col) <= 1)))) {
                        // if only two points, it cannot go back and select the points in the moves. if more than two points, it cannot go back and select the points other than the first one.
                        if ((game.moves.length < 2 || (game.moves.length === 2 && !(game.moves[0].row === row && game.moves[0].col === col)) || (game.moves.length > 2 && !containsDupOthanThanFirst(game.moves, row, col))) && !(game.moves.length >= 3 && game.moves[game.moves.length - 1].row === game.moves[0].row && game.moves[game.moves.length - 1].col === game.moves[0].col)) {
                            var tt = game.isPieceR(row, col) ?
                                document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ?
                                document.getElementById("e2e_test_pieceG_" + row + "x" + col) : game.isPieceB(row, col) ?
                                document.getElementById("e2e_test_pieceB_" + row + "x" + col) : document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                            tt.setAttribute("r", "47%");
                            $timeout(function () { tt.setAttribute("r", "41%"); }, 150);
                            draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                            log.info("animationwhat", game.isComputerTurn());
                            if (game.isMyTurn()) {
                                game.moves.push({ row: row, col: col });
                                draggingLines.style.display = "block";
                                if (type === "touchstart") {
                                    pline2.setAttribute("x1", "0");
                                    pline2.setAttribute("y1", "0");
                                    pline2.setAttribute("x2", "0");
                                    pline2.setAttribute("y2", "0");
                                }
                                var centerXY = getSquareCenterXY(row, col);
                                if (game.moves.length == 1) {
                                    pline.setAttribute("points", centerXY.x + "," + centerXY.y + " ");
                                }
                                else {
                                    var tmp = pline.getAttribute("points");
                                    var color = getStyle(row, col);
                                    // pline.setAttribute("style", color);
                                    pline.setAttribute("points", tmp + centerXY.x + "," + centerXY.y + " ");
                                }
                            }
                            else {
                                pline.setAttribute("points", "");
                            }
                        }
                    }
                }
            }
            if (!game.didMakeMove && (type === "touchend" || type === "touchcancel" || type === "touchleave")) {
                // drag ended
                // return the piece to it's original style (then angular will take care to hide it).
                draggingStartedRowCol = null;
                draggingPiece = null;
                draggingLines.style.display = "none";
                draggingLines.offsetHeight;
                draggingLines.style.webkitTransform = 'scale(1)';
                game.moves = new Array();
            }
        }
        function getColor(row, col) {
            if (game.isPieceR(row, col)) {
                return "red";
            }
            else if (game.isPieceG(row, col)) {
                return "green";
            }
            else if (game.isPieceB(row, col)) {
                return "blue";
            }
            else if (game.isPieceX(row, col)) {
                return "yellow";
            }
        }
        function getStyle(row, col) {
            if (game.isPieceR(row, col)) {
                return "fill:none;stroke:red;stroke-width:2%; stroke-opacity: 0.7";
            }
            else if (game.isPieceG(row, col)) {
                return "fill:none;stroke:green;stroke-width:2%; stroke-opacity: 0.7";
            }
            else if (game.isPieceB(row, col)) {
                return "fill:none;stroke:blue;stroke-width:2%; stroke-opacity: 0.7";
            }
            else if (game.isPieceX(row, col)) {
                return "fill:none;stroke:yellow;stroke-width:2%; stroke-opacity: 0.7";
            }
        }
        function containsDupOthanThanFirst(moves, row, col) {
            for (var i = 1; i < moves.length; i++) {
                if (moves[i].row === row && moves[i].col === col) {
                    return true;
                }
            }
            return false;
        }
        function setDraggingPieceTopLeft(topLeft) {
            var originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
            draggingPiece.style.left = (topLeft.left - originalSize.left) + "px";
            draggingPiece.style.top = (topLeft.top - originalSize.top) + "px";
        }
        function getSquareWidthHeight() {
            return {
                width: gameArea.clientWidth / colsNum,
                height: gameArea.clientHeight * 0.9 / rowsNum
            };
        }
        function getSquareTopLeft(row, col) {
            var size = getSquareWidthHeight();
            return { top: row * size.height, left: col * size.width };
        }
        function getSquareCenterXY(row, col) {
            var size = getSquareWidthHeight();
            return {
                x: col * size.width + size.width / 2,
                y: row * size.height + size.height / 2
            };
        }
        function dragDone($http) {
            $rootScope.$apply(function () {
                // Update piece in board
                game.cellPressedUp($http);
            });
        }
        $rootScope['game'] = game;
        game.init($http);
        resizeGameAreaService.setWidthToHeight(0.6818);
    }]);
//# sourceMappingURL=game.js.map
;
var aiService;
(function (aiService) {
    /** Returns a simply random move that the computer player should do for the given state in move. */
    function findSimplyComputerMove(move) {
        var possibleMove = null;
        // find a better move
        for (var i = 1; i < gameLogic.ROWS - 1; i++) {
            for (var j = 1; j < gameLogic.COLS - 1; j++) {
                var moves = new Array();
                try {
                    moves.push({ row: i - 1, col: j });
                    moves.push({ row: i, col: j + 1 });
                    moves.push({ row: i + 1, col: j });
                    moves.push({ row: i, col: j - 1 });
                    moves.push({ row: i - 1, col: j });
                    possibleMove = gameLogic.createMove(move.stateAfterMove, moves, move.turnIndexAfterMove);
                    return possibleMove;
                }
                catch (e) {
                }
            }
        }
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