describe("In EncloseCombat", function () {
    var OK = true;
    var ILLEGAL = false;
    var ONE_TURN = 0;
    var TWO_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    //   let X_WIN_SCORES = [1, 0];
    //   let O_WIN_SCORES = [0, 1];
    //   let TIE_SCORES = [0, 0];
    function expectMove(isOk, turnIndexBeforeMove, boardBeforeMove, scoresBeforeMove, current_turnBeforeMove, moves, boardAfterMove, turnIndexAfterMove, scoresAfterMove, current_turnAfterMove) {
        var stateTransition = {
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: boardBeforeMove ? { board: boardBeforeMove, delta: null,
                current_turn: current_turnBeforeMove, scores: scoresBeforeMove } : null,
            move: {
                turnIndexAfterMove: turnIndexAfterMove,
                stateAfterMove: { board: boardAfterMove, delta: moves,
                    current_turn: current_turnAfterMove, scores: scoresAfterMove }
            },
            numberOfPlayers: null
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
    it("drawing one small chip from initial state at upper left is illegal", function () {
        expectMove(ILLEGAL, ONE_TURN, null, null, 1, [{ row: 0, col: 0 }], [['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [0, 0], 2);
    });
    it("drawing a small rectangle (four chips) from initial state at upper left is legal", function () {
        expectMove(OK, ONE_TURN, null, null, 1, [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 0 }, { row: 0, col: 0 }], [['R', 'R', 'C', 'C', 'C', 'C'],
            ['R', 'R', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [4, 0], 2);
    });
    it("drawing a small rectangle (four chips) from initial state at right bottom is legal", function () {
        expectMove(OK, ONE_TURN, null, null, 1, [{ row: 6, col: 4 }, { row: 6, col: 5 }, { row: 7, col: 5 }, { row: 7, col: 4 }, { row: 6, col: 4 }], [['C', 'C', 'C', 'C', 'R', 'R'],
            ['C', 'C', 'C', 'C', 'R', 'R'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [4, 0], 2);
    });
    it("drawing a complex shape (9 chips) from initial state at right bottom is legal", function () {
        expectMove(OK, ONE_TURN, null, null, 1, [{ row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
            { row: 4, col: 5 }, { row: 4, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 2 },
            { row: 5, col: 2 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
            { row: 7, col: 5 }, { row: 7, col: 4 }, { row: 7, col: 3 }, { row: 7, col: 2 }, { row: 7, col: 1 },
            { row: 6, col: 1 }, { row: 5, col: 1 }, { row: 4, col: 1 }, { row: 3, col: 1 }], [['C', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'R', 'R', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [22, 0], 2);
    });
    it("drawing a complex shape (25 chips) from initial state", function () {
        expectMove(OK, ONE_TURN, null, null, 1, [{ row: 7, col: 0 }, { row: 6, col: 1 }, { row: 5, col: 2 }, { row: 4, col: 3 },
            { row: 4, col: 2 }, { row: 3, col: 2 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
            { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 },
            { row: 5, col: 4 }, { row: 6, col: 4 }, { row: 7, col: 4 },
            { row: 7, col: 3 }, { row: 7, col: 2 }, { row: 7, col: 1 }, { row: 7, col: 0 }], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'R', 'R', 'R', 'R', 'R'],
            ['C', 'C', 'R', 'R', 'R', 'R'],
            ['C', 'C', 'R', 'R', 'R', 'R'],
            ['C', 'C', 'R', 'R', 'R', 'C'],
            ['C', 'C', 'R', 'R', 'R', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [25, 0], 2);
    });
    it("drawing a complex shape (19 chips) from initial state", function () {
        expectMove(OK, ONE_TURN, null, null, 1, [{ row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 },
            { row: 5, col: 4 }, { row: 6, col: 3 }, { row: 6, col: 2 }, { row: 6, col: 1 },
            { row: 5, col: 0 }, { row: 4, col: 0 }, { row: 3, col: 0 },
            { row: 2, col: 1 }, { row: 3, col: 2 }, { row: 4, col: 1 },
            { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 },
            { row: 4, col: 4 }, { row: 3, col: 4 }, { row: 3, col: 5 },], [['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'R', 'R', 'R'],
            ['R', 'R', 'R', 'C', 'R', 'R'],
            ['C', 'R', 'C', 'C', 'C', 'C'],
            ['C', 'R', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C'],
            ['C', 'C', 'C', 'C', 'C', 'C']], TWO_TURN, [19, 0], 2);
    });
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