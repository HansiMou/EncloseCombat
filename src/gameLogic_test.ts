describe("In EncloseCombat", function() {
  let OK = true;
  let ILLEGAL = false;
  let ONE_TURN = 0;
  let TWO_TURN = 1;
  let NO_ONE_TURN = -1;
  let NO_ONE_WINS: number[] = null;
  let X_WIN_SCORES = [1, 0];
  let O_WIN_SCORES = [0, 1];
  let TIE_SCORES = [0, 0];

  function expectMove(
      isOk: boolean,
      turnIndexBeforeMove: number,
      boardBeforeMove: Board,
      scoresBeforeMove: number[],
      current_turnBeforeMove: number,
      moves: BoardDelta[],
      boardAfterMove: Board,
      turnIndexAfterMove: number,
      scoresAfterMove: number[],
      current_turnAfterMove: number,
      endMatchScores: number[]): void {
    let stateTransition: 
      IStateTransition = {
        turnIndexBeforeMove: turnIndexBeforeMove,
        stateBeforeMove: boardBeforeMove ? {
          board: boardBeforeMove, 
          delta: null, 
          current_turn: current_turnBeforeMove, 
          scores: scoresBeforeMove,
          initialboard: boardBeforeMove,
          changed_delta: moves,
          random: null
        } : null,
      numberOfPlayers: null,
      move: {
        endMatchScores: endMatchScores,
        turnIndexAfterMove: turnIndexAfterMove,
        stateAfterMove: {
          board: boardAfterMove, 
          delta: moves,
          current_turn: turnIndexAfterMove,
          scores: scoresAfterMove,
          initialboard: boardBeforeMove,
          changed_delta: moves,
          random: null,
        }
      }
    };
    if (isOk) {
      gameLogic.checkMoveOk(stateTransition);
    } else {
      // We expect an exception to be thrown :)
      let didThrowException = false;
      try {
        gameLogic.checkMoveOk(stateTransition);
      } catch (e) {
        didThrowException = true;
      }
      if (!didThrowException) {
        throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!")
      }
    }
  }
  
  it("pressing one chip from initial state at is illegal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      if (numberOfTimesCalledRandom <= 48) return 0;
      throw new Error("Called Math.random more times than expected");
    };
    expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:0}],
      [['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
}); 

it("connecting two chips from initial state is illegal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      if (numberOfTimesCalledRandom <= 48) return 0;
      throw new Error("Called Math.random more times than expected");
    };
    expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:0}, {row:1, col:0}],
      [['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
});

it("connecting three chips to from initial state is illegal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      if (numberOfTimesCalledRandom <= 3) return 0.25;
      return 0;
    };
    expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:0}, {row:1, col:0}, {row:0, col:1}],
      [['G', 'G', 'G', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
});

it("connecting three chips to form a triangle is legal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      if (numberOfTimesCalledRandom <= 2 || numberOfTimesCalledRandom == 7) return 0.25;
      return 0;
    };
    expectMove(OK, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:0}, {row:1, col:0}, {row:0, col:1}, {row:0, col:0}],
      [['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [3, 0], 2, null);
});

it("connecting three chips of different colors to form a triangle is illegal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      if (numberOfTimesCalledRandom == 0) return 1;
      else if (numberOfTimesCalledRandom <= 48) return 0;
      throw new Error("Called Math.random more times than expected");
    };
    expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:0}, {row:1, col:0}, {row:0, col:1}, {row:0, col:0}],
      [['G', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
});

it("connecting chips to form a complex shape is legal", function() {
    let numberOfTimesCalledRandom = 0;
    Math.random = function () {
      numberOfTimesCalledRandom++;
      return 0;
    };
    expectMove(OK, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 
    1,
    [{row:0, col:1}, {row:1, col:0}, {row:2, col:1}, {row:1, col:2}, {row:0, col:1}],
      [['R', 'G', 'R', 'R', 'R', 'R'],
        ['G', 'G', 'G', 'R', 'R', 'R'],
        ['R', 'G', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R']], ONE_TURN, [38, 0], 2, null);
});
});
