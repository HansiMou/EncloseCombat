describe("In EncloseCombat", function () {
    var OK = true;
    var ILLEGAL = false;
    var ONE_TURN = 0;
    var TWO_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var X_WIN_SCORES = [1, 0];
    var O_WIN_SCORES = [0, 1];
    var TIE_SCORES = [0, 0];
    function expectMove(isOk, turnIndexBeforeMove, boardBeforeMove, scoresBeforeMove, current_turnBeforeMove, moves, boardAfterMove, turnIndexAfterMove, scoresAfterMove, current_turnAfterMove, endMatchScores) {
        var stateTransition = {
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
        }
        else {
            // We expect an exception to be thrown :)
            var didThrowException = false;
            try {
                gameLogic.checkMoveOk(stateTransition);
            }
            catch (e) {
                didThrowException = true;
            }
            if (!didThrowException) {
                throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!");
            }
        }
    }
    it("pressing one chip from initial state at is illegal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom <= 48)
                return 0;
            throw new Error("Called Math.random more times than expected");
        };
        expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
    });
    it("connecting two chips from initial state is illegal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom <= 48)
                return 0;
            throw new Error("Called Math.random more times than expected");
        };
        expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }, { row: 1, col: 0 }], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
    });
    it("connecting three chips to to from initial state is illegal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom <= 48)
                return 0;
            throw new Error("Called Math.random more times than expected");
        };
        expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 1 }], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
    });
    fit("connecting three chips to form a triangle is legal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom <= 2 || numberOfTimesCalledRandom == 7)
                return 0.25;
            return 0;
        };
        expectMove(OK, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 0 }], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], 2, [3, 0], null, null);
    });
    it("connecting three chips to form a triangle is legal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom <= 48)
                return 0;
            return 1;
        };
        expectMove(OK, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 0 }], [['G', 'G', 'R', 'R', 'R', 'R'],
            ['G', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [3, 0], 2, null);
    });
    it("connecting three chips of different colors to form a triangle is illegal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            if (numberOfTimesCalledRandom == 0)
                return 1;
            else if (numberOfTimesCalledRandom <= 48)
                return 0;
            throw new Error("Called Math.random more times than expected");
        };
        expectMove(ILLEGAL, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 0 }], [['G', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], TWO_TURN, [0, 0], 2, null);
    });
    it("connecting chips to form a complex shape is legal", function () {
        var numberOfTimesCalledRandom = 0;
        Math.random = function () {
            numberOfTimesCalledRandom++;
            return 0;
        };
        expectMove(OK, ONE_TURN, gameLogic.getInitialBoard(), gameLogic.getIntialScores(), 1, [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 1 }, { row: 1, col: 2 }, { row: 0, col: 1 }], [['R', 'G', 'R', 'R', 'R', 'R'],
            ['G', 'G', 'G', 'R', 'R', 'R'],
            ['R', 'G', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R']], ONE_TURN, [38, 0], 2, null);
    });
    // it("drawing one small chip from initial state at upper left is illegal", function() {
    //     expectMove(ILLEGAL, ONE_TURN, null, null, 1,
    //     [{row:0, col:0}],
    //       [['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [0, 0], 2, null);
    // });
    // it("drawing a small rectangle (four chips) from initial state at upper left is legal", function() {
    //     expectMove(OK, ONE_TURN, null, null, 1,
    //     [{row:0,col:0}, {row:0,col:1}, {row:1,col:1}, {row:1,col:0},{row:0,col:0}],
    //       [['R', 'R', 'C', 'C', 'C', 'C'],
    //         ['R', 'R', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [4, 0], 2, null);
    // });
    // it("drawing a small rectangle (four chips) from initial state at right bottom is legal", function() {
    //     expectMove(OK, ONE_TURN, null, null, 1,
    //     [{row:6,col:4}, {row:6,col:5}, {row:7,col:5}, {row:7,col:4},{row:6,col:4}],
    //       [['C', 'C', 'C', 'C', 'R', 'R'],
    //         ['C', 'C', 'C', 'C', 'R', 'R'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [4, 0], 2, null);
    // });
    // it("drawing a complex shape (9 chips) from initial state at right bottom is legal", function() {
    //     expectMove(OK, ONE_TURN, null, null, 1,
    //     [{row:3,col:1},{row:3,col:2},{row:3,col:3},{row:3,col:4},{row:3,col:5},
    //     {row:4,col:5},{row:4,col:4},{row:4,col:3},{row:4,col:2},
    //     {row:5,col:2},{row:6,col:2},{row:6,col:3},{row:6,col:4},{row:6,col:5},
    //     {row:7,col:5},{row:7,col:4},{row:7,col:3},{row:7,col:2},{row:7,col:1},
    //     {row:6,col:1},{row:5,col:1},{row:4,col:1},{row:3,col:1}],
    //       [['C', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'R', 'R', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [22, 0], 2, null);
    // });
    // it("drawing a complex shape (25 chips) from initial state", function() {
    //     expectMove(OK, ONE_TURN, null, null, 1,
    //     [{row:7,col:0},{row:6,col:1},{row:5,col:2},{row:4,col:3},
    //     {row:4,col:2},{row:3,col:2},{row:2,col:2},
    //     {row:2,col:3},{row:2,col:4},{row:2,col:5},
    //     {row:3,col:5},{row:4,col:5},{row:5,col:5},
    //     {row:5,col:4},{row:6,col:4},{row:7,col:4},
    //     {row:7,col:3},{row:7,col:2},{row:7,col:1},{row:7,col:0}],
    //       [['R', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'R', 'R', 'R', 'R', 'R'],
    //         ['C', 'C', 'R', 'R', 'R', 'R'],
    //         ['C', 'C', 'R', 'R', 'R', 'R'],
    //         ['C', 'C', 'R', 'R', 'R', 'C'],
    //         ['C', 'C', 'R', 'R', 'R', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [25, 0], 2, null);
    // });
    // it("drawing a complex shape (19 chips) from initial state", function() {
    //     expectMove(OK, ONE_TURN, null, null, 1,
    //     [{row:3,col:5},{row:4,col:5},{row:5,col:5},
    //     {row:5,col:4},{row:6,col:3},{row:6,col:2},{row:6,col:1},
    //     {row:5,col:0},{row:4,col:0},{row:3,col:0},
    //     {row:2,col:1},{row:3,col:2},{row:4,col:1},
    //     {row:5,col:1},{row:5,col:2},{row:5,col:3},
    //     {row:4,col:4},{row:3,col:4},{row:3,col:5},],
    //       [['R', 'R', 'R', 'R', 'R', 'R'],
    //         ['R', 'R', 'R', 'R', 'R', 'R'],
    //         ['R', 'R', 'R', 'C', 'R', 'R'],
    //         ['C', 'R', 'C', 'C', 'C', 'C'],
    //         ['C', 'R', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C'],
    //         ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [19, 0], 2);
    // });
    //   it("placing X in 0x0 from initial state but setting the turn to yourself is illegal", function() {
    //     expectMove(ILLEGAL, X_TURN, null, 0, 0,
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], X_TURN, NO_ONE_WINS);
    //   });
    //   it("placing X in 0x0 from initial state and winning is illegal", function() {
    //     expectMove(ILLEGAL, X_TURN, null, 0, 0,
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], NO_ONE_TURN, X_WIN_SCORES);
    //   });
    //   it("placing X in 0x0 from initial state and setting the wrong board is illegal", function() {
    //     expectMove(ILLEGAL, X_TURN, null, 0, 0,
    //       [['X', 'X', ''],
    //        ['', '', ''],
    //        ['', '', '']], O_TURN, NO_ONE_WINS);
    //   });
    //   it("placing O in 0x1 after X placed X in 0x0 is legal", function() {
    //     expectMove(OK, O_TURN,
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], 0, 1,
    //       [['X', 'O', ''],
    //        ['', '', ''],
    //        ['', '', '']], X_TURN, NO_ONE_WINS);
    //   });
    //   it("placing an O in a non-empty position is illegal", function() {
    //     expectMove(ILLEGAL, O_TURN,
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], 0, 0,
    //       [['O', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], X_TURN, NO_ONE_WINS);
    //   });
    //   it("cannot move after the game is over", function() {
    //     expectMove(ILLEGAL, O_TURN,
    //       [['X', 'O', ''],
    //        ['X', 'O', ''],
    //        ['X', '', '']], 2, 1,
    //       [['X', 'O', ''],
    //        ['X', 'O', ''],
    //        ['X', 'O', '']], X_TURN, NO_ONE_WINS);
    //   });
    //   it("placing O in 2x1 is legal", function() {
    //     expectMove(OK, O_TURN,
    //       [['O', 'X', ''],
    //        ['X', 'O', ''],
    //        ['X', '', '']], 2, 1,
    //       [['O', 'X', ''],
    //        ['X', 'O', ''],
    //        ['X', 'O', '']], X_TURN, NO_ONE_WINS);
    //   });
    //   it("X wins by placing X in 2x0 is legal", function() {
    //     expectMove(OK, X_TURN,
    //       [['X', 'O', ''],
    //        ['X', 'O', ''],
    //        ['', '', '']], 2, 0,
    //       [['X', 'O', ''],
    //        ['X', 'O', ''],
    //        ['X', '', '']], NO_ONE_TURN, X_WIN_SCORES);
    //   });
    //   it("O wins by placing O in 1x1 is legal", function() {
    //     expectMove(OK, O_TURN,
    //       [['X', 'X', 'O'],
    //        ['X', '', ''],
    //        ['O', '', '']], 1, 1,
    //       [['X', 'X', 'O'],
    //        ['X', 'O', ''],
    //        ['O', '', '']], NO_ONE_TURN, O_WIN_SCORES);
    //   });
    //   it("the game ties when there are no more empty cells", function() {
    //     expectMove(OK, X_TURN,
    //       [['X', 'O', 'X'],
    //        ['X', 'O', 'O'],
    //        ['O', 'X', '']], 2, 2,
    //       [['X', 'O', 'X'],
    //        ['X', 'O', 'O'],
    //        ['O', 'X', 'X']], NO_ONE_TURN, TIE_SCORES);
    //   });
    //   it("move without board is illegal", function() {
    //     expectMove(ILLEGAL, X_TURN,
    //       [['X', 'O', 'X'],
    //        ['X', 'O', 'O'],
    //        ['O', 'X', '']], 2, 2,
    //       null, NO_ONE_TURN, TIE_SCORES);
    //   });
    //   it("placing X outside the board (in 0x3) is illegal", function() {
    //     expectMove(ILLEGAL, X_TURN,
    //       [['', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], 0, 3,
    //       [['', '', '', 'X'],
    //        ['', '', ''],
    //        ['', '', '']], O_TURN, NO_ONE_WINS);
    //   }); 
});
//# sourceMappingURL=gameLogic_test.js.map