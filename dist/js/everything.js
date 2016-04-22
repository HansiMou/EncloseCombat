//TODO: have not written refresh method if there is no move can make.
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 8;
    gameLogic.COLS = 6;
    gameLogic.num_of_players = 2;
    gameLogic.total_turns = 20;
    gameLogic.num_of_colors = 3;
    /** Returns the initial EncloseCombat board, which is a ROWSxCOLS matrix containing the initial of a certain color. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = getRandomColor();
            }
        }
        return board;
    }
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
        return { board: getInitialBoard(), delta: null, current_turn: 0, scores: getIntialScores() };
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
        var cleanR = false;
        var cleanG = false;
        var cleanB = false;
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
                if (helper[i][j] === true) {
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
        return { score: score, board: boardAfterMove };
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
        var tmp = getBoardAndScore(boardAfterMove, moves);
        boardAfterMove = tmp.board;
        // log.info(["after", angular.toJson(boardAfterMove)]);
        /**Get the updated scores */
        var scores = angular.copy(stateBeforeMove.scores);
        scores[turnIndexBeforeMove] += tmp.score;
        var stateAfterMove = {
            board: boardAfterMove,
            delta: moves,
            current_turn: stateBeforeMove.current_turn + 1,
            scores: scores
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
    game.animationEnded = false;
    game.canMakeMove = false;
    game.isComputerTurn = false;
    game.move = null;
    game.state = null;
    game.isHelpModalShown = false;
    game.moves = new Array();
    game.msg = "";
    // export let shouldshowline = false;
    function init() {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_ENCLOSECOMBAT' is " + translate('RULES_OF_ENCLOSECOMBAT'));
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOkNoOp,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        setTimeout(animationEndedCallback, 1000); // Just in case animationEnded is not fired by some browser.
        var w = window;
        if (w["HTMLInspector"]) {
            setInterval(function () {
                w["HTMLInspector"].inspect({
                    excludeRules: ["unused-classes", "script-placement"],
                });
            }, 3000);
        }
    }
    game.init = init;
    function getTranslations() {
        return {
            RULES_OF_ENCLOSECOMBAT: {
                en: "Rules of EncloseCombat",
                cn: "画圈大战的规则",
            },
            RULES_SLIDE1: {
                en: "You and your opponent take turns to draw an enclosed circle over the chips of same color.",
                cn: "你和你的对手轮流操作，在相同颜色的卡片上围成一个闭合的形状。然后这个形状上和其内的卡片会消失，上面的会掉下来，新的卡片也会补充进来。",
            },
            RULES_SLIDE2: {
                en: "The more chips you include in that circle, the higher score you get.",
                cn: "形状越大分数越高，十个回合之后分数高的人获胜。",
            },
            CLOSE: {
                en: "Close",
                cn: "关闭",
            },
        };
    }
    function animationEndedCallback() {
        log.info("Hi");
        $rootScope.$apply(function () {
            log.info("Animation ended");
            game.animationEnded = true;
            sendComputerMove();
        });
    }
    function sendComputerMove() {
        if (!game.isComputerTurn) {
            return;
        }
        game.isComputerTurn = false; // to make sure the computer can only move once.
        log.info("computer");
        moveService.makeMove(aiService.findSimplyComputerMove(game.move));
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.animationEnded = false;
        game.move = params.move;
        game.state = game.move.stateAfterMove;
        if (!game.state) {
            game.state = gameLogic.getInitialState();
        }
        game.canMakeMove = game.move.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === game.move.turnIndexAfterMove; // it's my turn
        // Is it the computer's turn?
        game.isComputerTurn = game.canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (game.isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            game.canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!game.state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    function cellPressedDown(row, col) {
        game.moves.push({ row: row, col: col });
    }
    game.cellPressedDown = cellPressedDown;
    function cellEnter(row, col) {
        if (game.moves.length !== 0 && !(game.moves.length === 1 && game.moves[0] === { row: row, col: col })) {
            game.moves.push({ row: row, col: col });
        }
    }
    game.cellEnter = cellEnter;
    function cellPressedUp() {
        log.info("Slided on cell:", angular.toJson(game.moves));
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!game.canMakeMove) {
            return;
        }
        try {
            var nextMove = gameLogic.createMove(game.state, game.moves, game.move.turnIndexAfterMove);
            game.canMakeMove = false; // to prevent making another move
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
    function shouldSlowlyAppear(row, col) {
        var b = false;
        if (game.state.delta !== null) {
            for (var i = 0; i < game.state.delta.length; i++) {
                if (game.state.delta[i].row >= row && game.state.delta[i].col === col) {
                    b = true;
                }
            }
        }
        return !game.animationEnded &&
            game.state.delta && b;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
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
    .run(function () {
    'use strict';
    var gameArea = document.getElementById("gameArea");
    var draggingLines = document.getElementById("draggingLines");
    var pline = document.getElementById("pline");
    var pline2 = document.getElementById("pline2");
    var nextZIndex = 61;
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
                // $rootScope.$apply(function () {
                //   game.shouldshowline = false;
                // });            
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
                pline2.setAttribute("x1", XY.x + "");
                pline2.setAttribute("y1", XY.y + "");
                pline2.setAttribute("x2", x + "");
                pline2.setAttribute("y2", y + "");
            }
            // set up of the threshold
            if (percent > 0.7) {
                if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
                    game.moves = new Array();
                    pline.setAttribute("points", "");
                    draggingLines.style.display = "none";
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
            if (type === "touchend") {
                if (!(game.moves[game.moves.length - 1].row === row && game.moves[game.moves.length - 1].col === col)) {
                    var tt = game.isPieceR(row, col) ? document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ? document.getElementById("e2e_test_pieceG_" + row + "x" + col) : document.getElementById("e2e_test_pieceB_" + row + "x" + col);
                    tt.setAttribute("r", "55%");
                    setTimeout(function () { tt.setAttribute("r", "40%"); }, 100);
                    draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                    game.moves.push({ row: row, col: col });
                }
                log.info(angular.toJson(game.moves));
                draggingLines.style.webkitTransform = 'scale(1)';
                dragDone();
                draggingLines.style.webkitTransform = 'scale(1)';
            }
            else {
                // Drag continue
                // the first point or points around the last one
                if ((game.moves.length === 0) || (!(game.moves[game.moves.length - 1].row === row && game.moves[game.moves.length - 1].col === col) && ((Math.abs(game.moves[game.moves.length - 1].row - row) <= 1) && (Math.abs(game.moves[game.moves.length - 1].col - col) <= 1)))) {
                    // if only two points, it cannot go back and select the points in the moves. if more than two points, it cannot go back and select the points other than the first one.
                    if (game.moves.length < 2 || (game.moves.length === 2 && !(game.moves[0].row === row && game.moves[0].col === col)) || (game.moves.length > 2 && !containsDupOthanThanFirst(game.moves, row, col))) {
                        var tt = game.isPieceR(row, col) ? document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ? document.getElementById("e2e_test_pieceG_" + row + "x" + col) : document.getElementById("e2e_test_pieceB_" + row + "x" + col);
                        tt.setAttribute("r", "45%");
                        setTimeout(function () { tt.setAttribute("r", "40%"); }, 100);
                        draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                        game.moves.push({ row: row, col: col });
                        draggingLines.style.display = "block";
                        // $rootScope.$apply(function () {
                        //   game.shouldshowline = true;
                        // });                    
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
                            pline.setAttribute("points", tmp + centerXY.x + "," + centerXY.y + " ");
                        }
                    }
                }
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            draggingStartedRowCol = null;
            draggingPiece = null;
            draggingLines.style.display = "none";
            draggingLines.offsetHeight;
            // $rootScope.$apply(function () {
            //   game.shouldshowline = false;
            // });    
            game.moves = new Array();
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
    function forceRedraw(element) {
        if (!element) {
            return;
        }
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.style.display = 'none';
        setTimeout(function () {
            element.style.display = 'none';
            n.parentNode.removeChild(n);
        }, 200); // you can play with this timeout to make it as short as possible
    }
    function dragDone() {
        $rootScope.$apply(function () {
            // Update piece in board
            game.cellPressedUp();
        });
    }
    $rootScope['game'] = game;
    game.init();
    resizeGameAreaService.setWidthToHeight(0.6818);
});
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