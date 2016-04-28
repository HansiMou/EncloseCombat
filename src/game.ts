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
  export let canMakeMove = false;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let isComputerTurn = false;
  export let move: IMove = null;
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;
  export let moves: BoardDelta[] = new Array();
  export let msg = "";
  // export let shouldshowline = false;
  
  export function init() {
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

    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    setTimeout(animationEndedCallback, 1000); // Just in case animationEnded is not fired by some browser.

    let w: any = window;
    if (w["HTMLInspector"]) {
      setInterval(function () {
        w["HTMLInspector"].inspect({
          excludeRules: ["unused-classes", "script-placement"],
        });
      }, 3000);
    }
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
        en: "Left turns",
        zh: "剩余回合",
      },
      PLAYER: {
        en: "Player",
        zh: "玩家",
      }
    };
  }

  function animationEndedCallback() {
      log.info("Hi");
    $rootScope.$apply(function () {
      log.info("Animation ended");
      animationEnded = true;
      sendComputerMove();
    });
  }

  function sendComputerMove() {
    if (!isComputerTurn) {
      return;
    }
    isComputerTurn = false; // to make sure the computer can only move once.
    log.info("computer");
    didMakeMove = true;
    moveService.makeMove(aiService.findSimplyComputerMove(move));
  }

  function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    animationEnded = false;
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    move = params.move;
    state = move.stateAfterMove;
    if (!state) {
      state = gameLogic.getInitialState();
    }
    canMakeMove = move.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === move.turnIndexAfterMove; // it's my turn

    // Is it the computer's turn?
    isComputerTurn = canMakeMove &&
        params.playersInfo[params.yourPlayerIndex].playerId === '';
    if (isComputerTurn) {
      // To make sure the player won't click something and send a move instead of the computer sending a move.
      canMakeMove = false;
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      if (!state.delta) {
        // This is the first move in the match, so
        // there is not going to be an animation, so
        // call sendComputerMove() now (can happen in ?onlyAIs mode)
        sendComputerMove();
      }
    }
  }
  export function isComputer() {
    return currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex].playerId === '';
  }
  export function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
  }
  
  export function isCurrentPlayerIndex(playerIndex: number): boolean {
    return move.turnIndexAfterMove == playerIndex;
  }
  export function cellPressedDown(row: number, col: number): void{
      moves.push({row: row, col: col});
  }
  export function cellEnter(row: number, col: number): void{
      if (moves.length !== 0 && !(moves.length === 1 && moves[0]==={row: row, col:col})){
          moves.push({row: row, col: col});
      }
  }
  export function cellPressedUp(): void {
    log.info("Slided on cell:", angular.toJson(moves));
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!canMakeMove) {
      return;
    }
    try {
      let nextMove = gameLogic.createMove(
          state, moves, move.turnIndexAfterMove);
      canMakeMove = false; // to prevent making another move
      moveService.makeMove(nextMove);
      moves = new Array();
    } catch (e) {
      log.info(e);
      moves = new Array();
      return;
    }
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

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    let b: boolean = false;
    if (state.delta !== null){
        for (let i = 0; i < state.delta.length; i++) {
            if (state.delta[i].row >= row && state.delta[i].col === col) {
                b = true;
            }
        }
    }
    return !animationEnded &&
        state.delta && b;
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
  .run(function () {
    'use strict';
    let gameArea = document.getElementById("gameArea");
    let draggingLines = document.getElementById("draggingLines");
    let pline = document.getElementById("pline");
    let pline2 = document.getElementById("pline2");
    let nextZIndex = 61;

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
                // $rootScope.$apply(function () {
                //   game.shouldshowline = false;
                // });            
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
          if (percent > 0.7){
            if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
                game.moves = new Array();
                pline.setAttribute("points", "");
                draggingLines.style.display = "none";
                draggingLines.offsetHeight;
                // $rootScope.$apply(function () {
                //   game.shouldshowline = false;
                // });
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
          if (type === "touchend") {
            if (!(game.moves[game.moves.length-1].row === row && game.moves[game.moves.length-1].col === col)){
                let tt = game.isPieceR(row, col)?
                document.getElementById("e2e_test_pieceR_" + row + "x" + col):game.isPieceG(row, col)?
                document.getElementById("e2e_test_pieceG_" + row + "x" + col):game.isPieceB(row, col)?
                document.getElementById("e2e_test_pieceB_" + row + "x" + col):document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                tt.setAttribute("r", "55%");
                setTimeout(function(){tt.setAttribute("r", "40%");},100);
                draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                game.moves.push({row: row, col: col});
            }
            log.info(angular.toJson(game.moves));
            draggingLines.style.webkitTransform = 'scale(1)';
            dragDone();
            draggingLines.style.webkitTransform = 'scale(1)';
          } else {
            // Drag continue
            // the first point or points around the last one
            if ((game.moves.length === 0)||(!(game.moves[game.moves.length-1].row === row && game.moves[game.moves.length-1].col === col)&&((Math.abs(game.moves[game.moves.length-1].row-row)<=1) && (Math.abs(game.moves[game.moves.length-1].col-col)<=1)))){
                // if only two points, it cannot go back and select the points in the moves. if more than two points, it cannot go back and select the points other than the first one.
                if (game.moves.length < 2 || (game.moves.length === 2 && !(game.moves[0].row === row && game.moves[0].col === col))||(game.moves.length > 2 && !containsDupOthanThanFirst(game.moves, row, col))){
                    let tt = game.isPieceR(row, col)?
                document.getElementById("e2e_test_pieceR_" + row + "x" + col):game.isPieceG(row, col)?
                document.getElementById("e2e_test_pieceG_" + row + "x" + col):game.isPieceB(row, col)?
                document.getElementById("e2e_test_pieceB_" + row + "x" + col):document.getElementById("e2e_test_pieceX_" + row + "x" + col);
                tt.setAttribute("r", "55%");
                    tt.setAttribute("r", "45%");
                    setTimeout(function(){tt.setAttribute("r", "40%");},100);
                    draggingPiece = document.getElementById("e2e_test_div_" + row + "x" + col);
                    game.moves.push({row: row, col: col});
                    draggingLines.style.display = "block";
                    // $rootScope.$apply(function () {
                    //   game.shouldshowline = true;
                    // });                    
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
                    else{
                        let tmp = pline.getAttribute("points");
                        pline.setAttribute("points", tmp+centerXY.x+","+centerXY.y+" ");
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

      function forceRedraw(element:any){

          if (!element) { return; }

          let n = document.createTextNode(' ');

          element.appendChild(n);
          element.style.display = 'none';

          setTimeout(function(){
              element.style.display = 'none';
              n.parentNode.removeChild(n);
          },200); // you can play with this timeout to make it as short as possible
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