module aiService {
  /** Returns a simply random move that the computer player should do for the given state in move. */
  export function findSimplyComputerMove(move: IMove): IMove{
    let possibleMove: IMove = null;
    for (let i = 0; i < gameLogic.ROWS; i++) {
      for (let j = 1; j < gameLogic.COLS; j++) {
          for (let k = 0; k <= 3; k++){
              try {
                let moves = new Array();
                moves.push({row: i, col: j-1});
                moves.push({row: i, col: j});
                switch(k){
                    case 0:
                    moves.push({row: i-1, col: j-1});
                    break;
                    case 1:
                    moves.push({row: i-1, col: j});
                    break;
                    case 2:
                    moves.push({row: i+1, col: j});
                    break;
                    case 3:
                    moves.push({row: i+1, col: j-1});
                    break;
                }
                moves.push({row: i, col: j-1}); 
                possibleMove = gameLogic.createMove(move.stateAfterMove, moves, move.turnIndexAfterMove);
                return possibleMove;
            } catch (e) {
            // Move is illegal
            }
          }
      }
    }
    return possibleMove;
  }
  /** Returns a more intelligent move that the computer player should do for the given state in move. */
  export function findCleverComputerMove(move: IMove): IMove{
    let res: IMove = null;
    let maxlen = 0;
    let maxmoves: BoardDelta[] = new Array();
    let used: boolean[][] = new Array();
    let moves: BoardDelta[] = new Array();
    for (let i = 0; i < gameLogic.ROWS; i++) {
      used[i] = new Array();
      for (let j = 0; j < gameLogic.COLS; j++) {
          used[i][j] = false;
      }
    }
    log.info("rrr");
    try{
    for (let i = 0; i < gameLogic.ROWS; i++) {
      for (let j = 0; j < gameLogic.COLS; j++) {
          let tmpres: LenAndMoves = search(move.stateAfterMove.board, i, j, '', moves, used);
          if (tmpres.len > maxlen){
              maxmoves = tmpres.moves;
          }
      }
    }
    res = gameLogic.createMove(move.stateAfterMove, maxmoves, move.turnIndexAfterMove);
    }
    catch(e){
        log.info(e);
    }
    return res;
  }
  
  function search(board: string[][], row: number, col: number, color: string, moves:BoardDelta[], used: boolean[][]): LenAndMoves{
      if (row < 0 || row > gameLogic.ROWS || col < 0 || col > gameLogic.COLS || (color !== '' && board[row][col] !== color)){
          return {len: 0, moves: null};
      }
      if (color !== '' && moves !== null && moves.length >= 3 && used[row][col] === true 
        && row === moves[0].row && col === moves[0].col){
            moves.push({row: row, col: col});
            return {len: moves.length-1, moves: moves};
        }
      if (color === ''){
          color = board[row][col];
      }
      used[row][col] = true;
      moves.push({row: row, col: col});
      let r: LenAndMoves[] = new Array();
      if (row+1 < gameLogic.ROWS && board[row+1][col] === color){
        r.push(search(board, row+1, col, color, moves, used));
      }
      if (row+1 < gameLogic.ROWS && col+1 < gameLogic.COLS && board[row+1][col+1] === color){
        r.push(search(board, row+1, col+1, color, moves, used));
      }
      if (row+1 < gameLogic.ROWS && col-1 > 0 && board[row+1][col-1] === color){
        r.push(search(board, row+1, col-1, color, moves, used));
      }
      if (col+1 < gameLogic.COLS && board[row][col+1] === color){
        r.push(search(board, row, col+1, color, moves, used));
      }
      if (col-1 > 0 && board[row][col-1] === color){
        r.push(search(board, row, col-1, color, moves, used));
      }
      if (row-1 > 0 && col-1 > 0 && board[row-1][col-1] === color){
        r.push(search(board, row-1, col-1, color, moves, used));
      }
      if (row-1 > 0 && board[row-1][col] === color){
        r.push(search(board, row-1, col, color, moves, used));
      }
      if (row-1 > 0 && col+1 < gameLogic.COLS && board[row-1][col+1] === color){
        r.push(search(board, row-1, col+1, color, moves, used));
      }
      moves.pop();
      used[row][col] = false;
      let maxlen = 0;
      let maxmoves: BoardDelta[] = new Array();
      
      for (let i = 0; i < r.length; i++){
          if (r[i].len > maxlen){
              maxlen = r[i].len;
              maxmoves = r[i].moves;
          }
      }
      
      return {len: maxlen, moves: maxmoves};
  }
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(move: IMove): IMove {
    return createComputerMove(move,
        // at most 1 second for the AI to choose a move (but might be much quicker)
        {millisecondsLimit: 1000});
  }

  /**
   * Returns all the possible moves for the given state and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(state: IState, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      for (let j = 0; j < gameLogic.COLS; j++) {
        try {
        //   possibleMoves.push(gameLogic.createMove(state, i, j, turnIndexBeforeMove));
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }

  /**
   * Returns the move that the computer player should do for the given state.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      move: IMove, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    return alphaBetaService.alphaBetaDecision(
        move, move.turnIndexAfterMove, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
  }

  function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    let endMatchScores = move.endMatchScores;
    if (endMatchScores) {
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    return getPossibleMoves(move.stateAfterMove, playerIndex);
  }
}
