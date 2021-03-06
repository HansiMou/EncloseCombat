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