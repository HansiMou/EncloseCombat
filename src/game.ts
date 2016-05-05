interface SupportedLanguages { en: string, zh: string};
interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // I export all letiables to make it easy to debug in the browser by
  // simply typing in the console:
  // game.state
  export let currentUpdateUI: IUpdateUI = null;
  export let animationEnded = false;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;
  export let moves: BoardDelta[] = new Array();
  export let msg = "";
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let ismyscore = 0;
  export let shouldshowscore = true;
  export let linesstyle = false;
  export let record: number;
  export let $httpt: angular.IHttpService; 
  
  export function init($http: any) {
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
    let w: any = window;
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
    }).then(function successCallback(response:any) {
      record = parseInt(response.data);
      log.info("finallll", angular.toJson(response.data));
    }, function errorCallback(response:any) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      log.info("finalll", response);
      record = 0;
    });
  }

  function getTranslations(): Translations {
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
      CLOSE:  {
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
    animationEnded = true;
    shouldshowscore = true;
    clearAnimationTimeout();
    maybeSendComputerMove();
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) {
      return;
    }
    didMakeMove = true;
    
    let rline = document.getElementById("rline");
    let gameArea = document.getElementById("gameArea");
    let scorenotice = document.getElementById("scorenotice");
    let width = gameArea.clientWidth / gameLogic.COLS;
    let height = gameArea.clientHeight*0.9 / gameLogic.ROWS;
    
    let tmp = "";
    let nextAIMove = aiService.findSimplyComputerMove(currentUpdateUI.move);
    nextAIMove.stateAfterMove.delta.forEach(function(entry) {
        let  x = entry.col * width + width / 2;
        let  y = entry.row * height + height / 2;
        tmp = tmp+x+","+y+" ";
    });
    linesstyle = true; 
    rline.setAttribute("points", tmp);   
    scorenotice.setAttribute("z-index", "50");
    $timeout(function(){
      linesstyle = false; 
      rline.setAttribute("points", "");
      moveService.makeMove(nextAIMove);
    },1500);
  }

  function updateUI(params: IUpdateUI): void {
    // global and my local scoreboard update
    if (params.playMode === "passAndPlay" && params.move.stateAfterMove !== undefined){
      let current_game_score = params.move.stateAfterMove.scores[0]+params.move.stateAfterMove.scores[1];
      if (current_game_score > parseInt(game.getHighestScore())){
        localStorage.setItem("score", current_game_score+"");
      }
      
        if (current_game_score > game.getHighestScoreGlobally()){
          $httpt({
            method: 'GET',
            url: 'http://cs.nyu.edu/~hm1305/smg/index.php?NameAndScore='+current_game_score
          }).then(function successCallback(response:any) {
            log.info("finallll", angular.toJson(response));
            record = current_game_score;
          }, function errorCallback(response:any) {
            log.info("finalll", response);
          });
        }
      }
    
    log.info("Game got updateUI???:", params);
    animationEnded = false;
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    let rline = document.getElementById("rline");
    let gameArea = document.getElementById("gameArea");
    let width = gameArea.clientWidth / gameLogic.COLS;
    let height = gameArea.clientHeight*0.9 / gameLogic.ROWS;
    clearAnimationTimeout();
    log.info(params.stateBeforeMove);
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      
      // This is the first move in the match, so
      // there is not going to be an animation, so
      // call maybeSendComputerMove() now (can happen in ?onlyAIs mode)
      maybeSendComputerMove();
    } else {
      // set up the state before move 
      if (params.stateBeforeMove !== undefined){
        state = params.stateBeforeMove;
        state.changed_delta = null;
        state ={
          initialboard: params.stateBeforeMove.initialboard,
          delta : params.stateBeforeMove.delta,
          current_turn : params.stateBeforeMove.current_turn,
          scores : params.stateBeforeMove.scores,
          changed_delta : null,
          random : params.stateBeforeMove.random,
          board: params.stateBeforeMove.board
        }
      }
      else{
        state ={
          initialboard: params.move.stateAfterMove.initialboard? params.move.stateAfterMove.initialboard : params.move.stateAfterMove.board,
          delta : [],
          current_turn : 0,
          scores : [0, 0],
          changed_delta : null,
          random : params.move.stateAfterMove.random,
          board: params.move.stateAfterMove.initialboard? params.move.stateAfterMove.initialboard : params.move.stateAfterMove.board
        }
      }
      if (isMyTurn() && currentUpdateUI.playMode !== "passAndPlay" && currentUpdateUI.playMode !== "playAgainstTheComputer"){
      // set up the sliding lines of opponent
        let tmp = "";
        currentUpdateUI.move.stateAfterMove.delta.forEach(function(entry) {
            let  x = entry.col * width + width / 2;
            let  y = entry.row * height + height / 2;
            tmp = tmp+x+","+y+" ";
        });
        shouldshowscore = true;
        // clear the score animation
        $timeout(function(){
          shouldshowscore = false;
        }, 1000)
        linesstyle = true;
        rline.setAttribute("points", tmp);
        $timeout(function(){
          // remove the lines 
          linesstyle = false;
          rline.setAttribute("points", "");
          
          // change the state
          state = currentUpdateUI.move.stateAfterMove;
          
          shouldshowscore = false;
          animationEndedTimeout = $timeout(animationEndedCallback, Math.max(1000, getMostMoveDownNum() * 250));
        },1500);
      }
      else{
        // clear the score animation
        $timeout(function(){
          shouldshowscore = false;
        }, 1000)
        state = currentUpdateUI.move.stateAfterMove;
        animationEndedTimeout = $timeout(animationEndedCallback, Math.max(1000, getMostMoveDownNum() * 250));
      }
    }
  }
  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }
  // lcoalstorage
  export function getHighestScore(){
    if (localStorage.getItem("score")) {
        return localStorage.getItem("score");
    } else {
        localStorage.setItem("score", "0");
        return 0;
    }
  }
  
  // global leaderboard to maintain
  export function getHighestScoreGlobally(){
    return record;
  }
  
  export function isComputerTurn() {
    return isMyTurn() && isComputer();
  }
  function isFirstMove() {
    return !currentUpdateUI.move.stateAfterMove;
  }    
  export function isPassAndPlay():boolean {
    return currentUpdateUI.playMode? currentUpdateUI.playMode === 'passAndPlay' : false;
  }
  export function isComputer() {
    return currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex] !== undefined && currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex].playerId === '';
  }
  export function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
  }
  
  export function isCurrentPlayerIndex(playerIndex: number): boolean {
    return currentUpdateUI.move.turnIndexAfterMove == playerIndex;
  }
  export function animationEndedorNot() : boolean{
    return game.didMakeMove; 
  }
  export function cellPressedUp($http: angular.IHttpService): void {
    log.info("Slided on cell:", angular.toJson(moves));
    
    let remindlines = document.getElementById("remindlines");

    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    try {
      let nextMove = gameLogic.createMove(
          state, moves, currentUpdateUI.move.turnIndexAfterMove);

      moveService.makeMove(nextMove);
      moves = new Array();

    } catch (e) {
      log.info(e);
      moves = new Array();
      return;
    }
  }
  export function getScores(){
    let afterscoresum = 0;
    let beforePlayer0 = 0;
    let beforePlayer1 = 0;
    let afterPlayer0 = 0;
    let afterPlayer1 = 0;
    
    if (currentUpdateUI.move.stateAfterMove){
      afterPlayer0 = currentUpdateUI.move.stateAfterMove.scores[0];
      afterPlayer1 = currentUpdateUI.move.stateAfterMove.scores[1];
      afterscoresum = afterPlayer0 + afterPlayer1;
    }
    let beforescoresum = 0;
    if (currentUpdateUI.stateBeforeMove){
      beforePlayer0 = currentUpdateUI.stateBeforeMove.scores[0];
      beforePlayer1 = currentUpdateUI.stateBeforeMove.scores[1];
      beforescoresum = beforePlayer0 + beforePlayer1;
    }
    
    let b = false;
    if (afterPlayer0 - beforePlayer0 > 0){
      b = currentUpdateUI.yourPlayerIndex === 0;
      log.info("scoreby0", currentUpdateUI.yourPlayerIndex);
    }
    else if (afterPlayer1 - beforePlayer1 > 0){
      b = currentUpdateUI.yourPlayerIndex === 1;
      log.info("scoreby1", currentUpdateUI.yourPlayerIndex);
    }
    
    return {score: afterscoresum-beforescoresum, color: b?'blue':'red'};
  }
  
  export function shouldShowScore() {
    return !animationEnded && getScores().score !== 0;
  }
  export function shouldShowImage(row: number, col: number): boolean {
    return true;
  }
  
  export function isPieceR(row: number, col: number): boolean {
    return state.board[row][col] === 'R';
  }

  export function isPieceG(row: number, col: number): boolean {
    return state.board[row][col] === 'G';
  }

  export function isPieceB(row: number, col: number): boolean {
    return state.board[row][col] === 'B';
  }
  
  export function isPieceX(row: number, col: number): boolean {
    return state.board[row][col] === 'X';
  }
  
  export function getName(): string {
    if (state.random){
      return 'PLAYER'+state.random;
    }
    return 'PLAYER';
  }
  export function getOppoName(): string {
    if (state.random){
      let tmp = state.random+1;
      return 'PLAYER'+tmp;
    }
    return 'PLAYER';
  }
  export function getMostMoveDownNum(){
    let res :number[] = [0, 0, 0, 0, 0, 0];
    let max = 0;
    if (currentUpdateUI.move.stateAfterMove.changed_delta){
      for (let i = 0; i < currentUpdateUI.move.stateAfterMove.changed_delta.length; i++) {
        res[currentUpdateUI.move.stateAfterMove.changed_delta[i].col]++;
        max = Math.max(max, res[currentUpdateUI.move.stateAfterMove.changed_delta[i].col]);
      }
    }
    return max;
  }
  export function getMoveDownClass(row: number, col: number): string {
    let res = 0;
    if (state.changed_delta){
      for (let i = 0; i < state.changed_delta.length; i++) {
          if (state.changed_delta[i].row >= row && state.changed_delta[i].col === col) {
              res++;
          }
      }
    }
    log.info("test it out", animationEnded, row, col, res, state.changed_delta);
    if (res !== 0 && !animationEnded && state.changed_delta)
      return 'movedown'+res;
    return '';
  }

  export function clickedOnModal(evt: Event) {
    if (evt.target === evt.currentTarget) {
      evt.preventDefault();
      evt.stopPropagation();
      isHelpModalShown = false;
    }
    return true;
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(['$http', function ($http:angular.IHttpService) {
    'use strict';
    let gameArea = document.getElementById("gameArea");
    let draggingLines = document.getElementById("draggingLines");
    let pline = document.getElementById("pline");
    let pline2 = document.getElementById("pline2");
    let nextZIndex = 61;
    game.$httpt = $http;

    dragAndDropService.addDragListener("gameArea", handleDragEvent);
    let rowsNum = gameLogic.ROWS;
    let colsNum = gameLogic.COLS;
    let draggingPiece:any = null;
    let draggingStartedRowCol: any = null; // The {row: YY, col: XX} where dragging started.

    function handleDragEvent(type:string, clientX:number, clientY:number) {
        // Center point in gameArea
        let realTop = gameArea.offsetTop + 0.1*gameArea.clientHeight;
        let realHeight = gameArea.clientHeight * 0.9;
        let x = clientX - gameArea.offsetLeft;
        let y = clientY - realTop;
        let row: number, col:number;
        // Is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= realHeight) {
          if (draggingPiece) {
            // Drag the piece where the touch is (without snapping to a square).
            // let size = getSquareWidthHeight();
            // setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2});
          } else {
            draggingLines.style.display = "none";
            draggingLines.offsetHeight;
            return;
          }
        } else {
          // Inside gameArea. Let's find the containing square's row and col

          col = Math.floor(colsNum * x / gameArea.clientWidth);
          row = Math.floor(rowsNum * y / realHeight);

          let cy = realHeight/2/rowsNum*(row*2+1);
          let cx = gameArea.clientWidth/2/colsNum*(col*2+1);
          let percent = Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy))/(realHeight/2/rowsNum);
          if (game.moves.length !== 0){
              let XY = getSquareCenterXY(game.moves[game.moves.length-1].row, game.moves[game.moves.length-1].col);
              pline2.setAttribute("x1",XY.x+"");
              pline2.setAttribute("y1",XY.y+"");
              pline2.setAttribute("x2",x+"");
              pline2.setAttribute("y2",y+"");
          }
          // set up of the threshold
          if (percent > 0.8){
            if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
                game.moves = new Array();
                pline.setAttribute("points", "");
                draggingLines.style.display = "none";
                draggingLines.style.webkitTransform = 'scale(1)';
                draggingLines.offsetHeight;
            }
            return ;
          }
          if (type === "touchstart" && !draggingStartedRowCol) {
            // drag started
            draggingStartedRowCol = {row: row, col: col};
            draggingPiece = document.getElementById("e2e_test_div_" + draggingStartedRowCol.row + "x" + draggingStartedRowCol.col);
          }
          if (!draggingPiece) {
            return;
          }
          if (game.isMyTurn() && type === "touchend") {
            if (!(game.moves[game.moves.length-1].row === row && game.moves[game.moves.length-1].col === col)){
                let tt = game.isPieceR(row, col)?
                document.getElementById("e2e_test_pieceR_" + row + "x" + col):game.isPieceG(row, col)?
                document.getElementById("e2e_test_pieceG_" + row + "x" + col):game.isPieceB(row, col)?
                document.getElementById("e2e_test_pieceB_" + row + "x" + col):document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                // tt.setAttribute("r", "55%");
                // setTimeout(function(){tt.setAttribute("r", "40%");},100);
                draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                game.moves.push({row: row, col: col});
            }
            log.info(angular.toJson(game.moves));
            // draggingLines.style.webkitTransform = 'scale(1)';
            dragDone($http);
            // draggingLines.style.webkitTransform = 'scale(1)';
          } else {
            // Drag continue
            // the first point or points around the last one
            if ((game.moves.length === 0)||(!(game.moves[game.moves.length-1].row === row && game.moves[game.moves.length-1].col === col)&&((Math.abs(game.moves[game.moves.length-1].row-row)<=1) && (Math.abs(game.moves[game.moves.length-1].col-col)<=1)))){
                // if only two points, it cannot go back and select the points in the moves. if more than two points, it cannot go back and select the points other than the first one.
                if ((game.moves.length < 2 || (game.moves.length === 2 && !(game.moves[0].row === row && game.moves[0].col === col))||(game.moves.length > 2 && !containsDupOthanThanFirst(game.moves, row, col))) && !(game.moves.length >= 3 && game.moves[game.moves.length-1].row === game.moves[0].row && game.moves[game.moves.length-1].col === game.moves[0].col)){
                  let tt = game.isPieceR(row, col)?
                  document.getElementById("e2e_test_pieceR_" + row + "x" + col):game.isPieceG(row, col)?
                  document.getElementById("e2e_test_pieceG_" + row + "x" + col):game.isPieceB(row, col)?
                  document.getElementById("e2e_test_pieceB_" + row + "x" + col):document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                  tt.setAttribute("r", "42%");
                  $timeout(function(){tt.setAttribute("r", "37%");},150);
                  draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                  log.info("animationwhat", game.isComputerTurn());
                  if (game.isMyTurn()){
                    game.moves.push({row: row, col: col});
                    draggingLines.style.display = "block";
                    if (type === "touchstart"){
                        pline2.setAttribute("x1","0");
                        pline2.setAttribute("y1","0");
                        pline2.setAttribute("x2","0");
                        pline2.setAttribute("y2","0");
                    }
                    let centerXY = getSquareCenterXY(row, col);
                    if (game.moves.length == 1){
                        pline.setAttribute("points", centerXY.x+","+centerXY.y+" ");
                    }
                    // if it is not enclosed
                    else {
                        let tmp = pline.getAttribute("points");
                        pline.setAttribute("points", tmp+centerXY.x+","+centerXY.y+" ");
                    }
                  }
                  else{
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
      function containsDupOthanThanFirst(moves: BoardDelta[], row: number, col: number){
          for (let i = 1; i < moves.length; i++){
              if (moves[i].row === row && moves[i].col === col){
                  return true;
              }
          }
          return false;
      }
      function setDraggingPieceTopLeft(topLeft:any) {
        let originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
        draggingPiece.style.left = (topLeft.left - originalSize.left) + "px";
        draggingPiece.style.top = (topLeft.top - originalSize.top) + "px";
      }
      function getSquareWidthHeight() {
        return {
          width: gameArea.clientWidth / colsNum,
          height: gameArea.clientHeight*0.9 / rowsNum
        };
      }
      function getSquareTopLeft(row:number, col:number) {
        let size = getSquareWidthHeight();
        return {top: row * size.height, left: col * size.width}
      }
      function getSquareCenterXY(row:number, col:number) {
        let size = getSquareWidthHeight();
        return {
          x: col * size.width + size.width / 2,
          y: row * size.height + size.height / 2
        };
      }

      function dragDone($http: angular.IHttpService) {
        $rootScope.$apply(function () {
          // Update piece in board
          game.cellPressedUp($http);
        });
      }
    $rootScope['game'] = game;
    game.init($http);
    resizeGameAreaService.setWidthToHeight(0.6818);
  }]);
