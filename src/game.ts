interface SupportedLanguages { en: string, cn: string};
interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console:
  // game.state
  export let animationEnded = false;
  export let canMakeMove = false;
  export let isComputerTurn = false;
  export let move: IMove = null;
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;
  export let moves: BoardDelta[] = new Array();

  export function init() {
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
      CLOSE:  {
        en: "Close",
        cn: "关闭",
      },
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
    moveService.makeMove(aiService.findSimplyComputerMove(move));
  }

  function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    animationEnded = false;
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

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    let b: boolean = false;
    if (state.delta !== null){
        for (let i = 0; i < state.delta.length; i++) {
            if (state.delta[i].row === row && state.delta[i].col === col) {
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
    $rootScope['game'] = game;
    game.init();
  });
