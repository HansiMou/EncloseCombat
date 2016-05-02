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
    function init() {
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
                en: "Yours",
                zh: "你的分数",
            },
            HIGHEST_SCORE: {
                en: "Highest",
                zh: "最高分",
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
        maybeSendComputerMove();
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn()) {
            return;
        }
        log.info("computer");
        game.didMakeMove = true;
        var rline = document.getElementById("rline");
        var gameArea = document.getElementById("gameArea");
        var scorenotice = document.getElementById("scorenotice");
        var width = gameArea.clientWidth / gameLogic.COLS;
        var height = gameArea.clientHeight * 0.9 / gameLogic.ROWS;
        rline.setAttribute("style", "fill:none;;stroke:red;stroke-dasharray: 5;stroke-width:2.0%; stroke-opacity: 0.7");
        var tmp = "";
        var nextAIMove = aiService.findSimplyComputerMove(game.currentUpdateUI.move);
        nextAIMove.stateAfterMove.delta.forEach(function (entry) {
            var x = entry.col * width + width / 2;
            var y = entry.row * height + height / 2;
            tmp = tmp + x + "," + y + " ";
        });
        // rline.setAttribute("style", "fill:none;stroke-dasharray: 20;animation: dash 5s linear;stroke:#ffb2b2;stroke-width:1.5%; stroke-opacity: 0.7");
        rline.setAttribute("points", tmp);
        scorenotice.setAttribute("z-index", "50");
        setTimeout(function () {
            rline.setAttribute("points", "");
            // rline.setAttribute("style", "fill:none;stroke:black;stroke-width:1.5%; stroke-opacity: 0");
            moveService.makeMove(nextAIMove);
        }, 2000);
    }
    function updateUI(params) {
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
            if (isMyTurn() && game.currentUpdateUI.playMode !== "passAndPlay" && game.currentUpdateUI.playMode !== "playAgainstTheComputer") {
                if (params.stateBeforeMove !== undefined) {
                    game.state = params.stateBeforeMove;
                    game.state.changed_delta = null;
                }
                else {
                    game.state.board = params.move.stateAfterMove.intialboard ? params.move.stateAfterMove.intialboard : params.move.stateAfterMove.board;
                    game.state.delta = [];
                    game.state.current_turn = 0;
                    game.state.scores = [0, 0];
                    game.state.changed_delta = null;
                    game.state.Random = params.move.stateAfterMove.Random;
                }
                var rline_1 = document.getElementById("rline");
                var gameArea_1 = document.getElementById("gameArea");
                var width_1 = gameArea_1.clientWidth / gameLogic.COLS;
                var height_1 = gameArea_1.clientHeight * 0.9 / gameLogic.ROWS;
                var tmp = "";
                game.currentUpdateUI.move.stateAfterMove.delta.forEach(function (entry) {
                    var x = entry.col * width_1 + width_1 / 2;
                    var y = entry.row * height_1 + height_1 / 2;
                    tmp = tmp + x + "," + y + " ";
                });
                rline_1.setAttribute("points", tmp);
                rline_1.setAttribute("style", "fill:none;stroke:blue;stroke-dasharray: 5;animation: dash 2s linear;stroke-width:1.5%; stroke-opacity: 0.7");
                // rline.setAttribute("style", "fill:none;stroke-dasharray: 20;animation: dash 5s linear;stroke:#ffb2b2;stroke-width:1.5%; stroke-opacity: 0.7");
                setTimeout(function () {
                    rline_1.setAttribute("points", "");
                    // rline.setAttribute("style", "fill:none;stroke:black;stroke-width:1.5%; stroke-opacity: 0");
                    game.state = game.currentUpdateUI.move.stateAfterMove;
                    game.animationEndedTimeout = $timeout(animationEndedCallback, 0);
                }, 2000);
            }
            else {
                game.state = game.currentUpdateUI.move.stateAfterMove;
                game.animationEndedTimeout = $timeout(animationEndedCallback, 2000);
            }
        }
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
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
        if (game.currentUpdateUI.move.stateAfterMove) {
            afterscoresum += game.currentUpdateUI.move.stateAfterMove.scores[0] + game.currentUpdateUI.move.stateAfterMove.scores[1];
        }
        var beforescoresum = 0;
        if (game.currentUpdateUI.stateBeforeMove) {
            beforescoresum += game.currentUpdateUI.stateBeforeMove.scores[0] + game.currentUpdateUI.stateBeforeMove.scores[1];
        }
        return afterscoresum - beforescoresum;
    }
    game.getScores = getScores;
    function shouldShowScore() {
        return !game.animationEnded && getScores() !== 0;
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
        if (game.state.Random) {
            return 'PLAYER' + game.state.Random;
        }
        return 'PLAYER';
    }
    game.getName = getName;
    function getOppoName() {
        if (game.state.Random) {
            var tmp = game.state.Random + 1;
            return 'PLAYER' + tmp;
        }
        return 'PLAYER';
    }
    game.getOppoName = getOppoName;
    function shouldSlowlyAppear(row, col) {
        var b = false;
        if (game.state.changed_delta) {
            for (var i = 0; i < game.state.changed_delta.length; i++) {
                if (game.state.changed_delta[i].row >= row && game.state.changed_delta[i].col === col) {
                    b = true;
                }
            }
        }
        return !game.animationEnded &&
            game.state.changed_delta && b;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getMoveDownClass(row, col) {
        var res = 0;
        if (game.state.changed_delta) {
            for (var i = 0; i < game.state.changed_delta.length; i++) {
                if (game.state.changed_delta[i].row >= row && game.state.changed_delta[i].col === col) {
                    res++;
                }
            }
        }
        if (shouldSlowlyAppear(row, col))
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
                    var tt = game.isPieceR(row, col) ?
                        document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ?
                        document.getElementById("e2e_test_pieceG_" + row + "x" + col) : game.isPieceB(row, col) ?
                        document.getElementById("e2e_test_pieceB_" + row + "x" + col) : document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                    tt.setAttribute("r", "55%");
                    setTimeout(function () { tt.setAttribute("r", "40%"); }, 100);
                    draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                    game.moves.push({ row: row, col: col });
                }
                log.info(angular.toJson(game.moves));
                // draggingLines.style.webkitTransform = 'scale(1)';
                dragDone();
            }
            else {
                // Drag continue
                // the first point or points around the last one
                if ((game.moves.length === 0) || (!(game.moves[game.moves.length - 1].row === row && game.moves[game.moves.length - 1].col === col) && ((Math.abs(game.moves[game.moves.length - 1].row - row) <= 1) && (Math.abs(game.moves[game.moves.length - 1].col - col) <= 1)))) {
                    // if only two points, it cannot go back and select the points in the moves. if more than two points, it cannot go back and select the points other than the first one.
                    if (game.moves.length < 2 || (game.moves.length === 2 && !(game.moves[0].row === row && game.moves[0].col === col)) || (game.moves.length > 2 && !containsDupOthanThanFirst(game.moves, row, col))) {
                        var tt = game.isPieceR(row, col) ?
                            document.getElementById("e2e_test_pieceR_" + row + "x" + col) : game.isPieceG(row, col) ?
                            document.getElementById("e2e_test_pieceG_" + row + "x" + col) : game.isPieceB(row, col) ?
                            document.getElementById("e2e_test_pieceB_" + row + "x" + col) : document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                        tt.setAttribute("r", "55%");
                        tt.setAttribute("r", "45%");
                        setTimeout(function () { tt.setAttribute("r", "40%"); }, 100);
                        draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
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
            // draggingLines.style.webkitTransform = 'scale(1)';
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
    // function forceRedraw(element:any){
    //     if (!element) { return; }
    //     let n = document.createTextNode(' ');
    //     element.appendChild(n);
    //     element.style.display = 'none';
    //     setTimeout(function(){
    //         element.style.display = 'none';
    //         n.parentNode.removeChild(n);
    //     },200); // you can play with this timeout to make it as short as possible
    // }
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