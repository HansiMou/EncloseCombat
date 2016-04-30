//TODO: have not written refresh method if there is no move can make.

type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}

/** Because we can draw circuits on chips of same color, delta is an array
 *  num_turns represents the current turn, which has a maximum of 10
 *  scores is an array that stores the scores of players (currently two)*/
interface IState {
  board: Board;
  delta: BoardDelta[];
  current_turn: number;
  scores: number[];
}
interface Colrange {
    left: number;
    right: number;
}
interface ScoreAndBoard {
    board: Board;
    score: number;
}

interface ColorsAndFlag {
    color: string;
    flag: number;
}
interface LenAndMoves {
    len: number;
    moves: BoardDelta[];
}
module gameLogic {
  export const ROWS = 8;
  export const COLS = 6;
  export const num_of_players = 2;
  export const total_turns = 20;
  export const num_of_colors = 4;
  export let initialboard: Board;

  /** Returns the initial EncloseCombat board, which is a ROWSxCOLS matrix containing the initial of a certain color. */
  function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = getRandomColor();
        // board[i][j] = 'R';
      }
    }
    initialboard = board;
    return board;
  }
  /** Between 1 to num_of_colors, a random number is chosen and return a corresponding color */
  function getRandomColor(): string{
      let res = Math.floor((Math.random() * num_of_colors) + 1);
      switch (res) {
          case 1:
              return 'R'; // short for red
          case 2:
              return 'G'; // short for green
          case 3:
              return 'B'; // short for blue
          case 4:
              return 'X'; // short for blue
          default:
              break;
      }
  }
  
  function getIntialScores(): number[]{
      let scores: number[] = [];
      for (let i = 0; i < num_of_players; i++){
          scores[i] = 0;
      }
      return scores;
  }
  /** Set the first turn to be 1, and the intial score for all players to be 0 */
  export function getInitialState(): IState {
    return {board: getInitialBoard(), delta: null, current_turn: 0, scores: getIntialScores()};
  }

  /**
   * Returns true if the game ended in a tie because game reaches the maximum of turns, 
   * and at least two players have the identical scores.
   */
  function isTie(FState: IState): boolean {
    if (FState.current_turn >= total_turns && twoOrMoreHaveSameScores(FState.scores)){
        return true;
    }
    return false;
  }
  /** Check if at least two players have the same scores 
   * reference: http://superivan.iteye.com/blog/1131328
   * UNTESTED
  */
  function twoOrMoreHaveSameScores(scores: number[]) :boolean{
      let s = scores.join(",")+",";
      for(let i = 0; i < scores.length; i++) {  
          if(s.replace(scores[i]+",","").indexOf(scores[i]+",")>-1) {  
            return true;
          }
      }  
      return false;
  }

  /**
   * Return the winner (either '1' or '2' or '3' ...) or '' if there is no winner.
   * getWinner will return the player with highest score at the final turn.
   */
  function getWinner(S: IState): string {
      if (isTie(S)){
          return '';
      }
      
      if (S.current_turn == total_turns){
          // Find the one with maximum score
          let max = Math.max.apply(null, S.scores);
          for (let i = 0; i < S.scores.length; i++){
              if (max == S.scores[i]){
                  return i+1+'';
              }
          }
      }
      return '';
  }
  /** return wether one number is in the array */
  function contains(a: BoardDelta[], row: number, col: number) {
        for (let i = 0; i < a.length; i++) {
            if (a[i].row === row && a[i].col === col) {
                return true;
            }
        }
        return false;
    }
  function getBoardAndScore(board: Board, moves: BoardDelta[]): ScoreAndBoard{
      let score = 0;
      let boardAfterMove = board;
      
      let helper: boolean[][] = [];
      
      let cleanR = false;
      let cleanG = false;
      let cleanB = false;
      let cleanX = false;
      
      // initialize the auxiliary boolean[][] array. 
      for (let i = 0; i < ROWS; i++){
          helper[i] = [];
          for (let j = 0; j < COLS; j++){
              helper[i][j] = false;
          }
      }
      // Value inside of the circle will be set to 'true', otherwise false  
      for (let i = 0; i < ROWS; i++){
          let range = foundRangeOfCertainRow(moves, i);
          for (let j = 0; j < COLS; j++){
              if (j >= range.left && j <= range.right){
                helper[i][j] = true;
              }
              else{
                  helper[i][j] = false;
              }
          }
      }
      for (let i = 0; i < COLS; i++){
          let range = foundRangeOfCertainCol(moves, i);
          for (let j = 0; j < ROWS; j++){
              if (j >= range.left && j <= range.right && helper[j][i] == true){
                if (!contains(moves, j, i)){
                    switch(board[j][i])
                    {
                    case 'R':
                    cleanR = true;
                    break;
                    case 'G':
                    cleanG = true;
                    break;
                    case 'B':
                    cleanB = true;
                    break;
                    case 'X':
                    cleanX = true;
                    break;
                    }
                }
              }
              else{
                  helper[j][i] = false;
              }
          }
      }
      
      for (let i = 0; i < ROWS; i++){
          for (let j = 0; j < COLS; j++){
              if (cleanR === true && board[i][j] === 'R'){
                  helper[i][j] = true;
              }
              else if (cleanG === true && board[i][j] === 'G'){
                  helper[i][j] = true;
              }
              else if (cleanB === true && board[i][j] === 'B'){
                  helper[i][j] = true;
              }
              else if (cleanX === true && board[i][j] === 'X'){
                  helper[i][j] = true;
              }
              if (helper[i][j] === true){
                  score++;
              }
          }
      }
    //   throw new Error(angular.toJson(helper, true));
    //   refill the circle with the chips above and refill the above empty ones with random color
      
      for (let j = COLS-1; j >= 0; j--){
          let flag = ROWS-1;
          for (let i = ROWS-1; i >= 0; i--){
              let tmp = getColor(boardAfterMove, helper, flag, i, j);
              flag = tmp.flag;
              boardAfterMove[i][j] = tmp.color;
              flag--;
          }
      }
      return {score: score, board: boardAfterMove};
  }
  function foundRangeOfCertainRow(moves: BoardDelta[], row: number): Colrange{
      let left = 100;
      let right = -2;
      
      for (let i = 0; i < moves.length; i++){
          if (moves[i].row === row){
              left = Math.min(moves[i].col, left);
              right = Math.max(moves[i].col, right);
          }
      }
      return {left: left, right: right};
  }
  function foundRangeOfCertainCol(moves: BoardDelta[], col: number): Colrange{
      let left = 100;
      let right = -2;
      
      for (let i = 0; i < moves.length; i++){
          if (moves[i].col === col){
              left = Math.min(moves[i].row, left);
              right = Math.max(moves[i].row, right);
          }
      }
      return {left: left, right: right};
  }
  function getColor(board: Board, helper: boolean[][], flag: number, row: number, col: number): ColorsAndFlag{
      while(flag >= 0){
          if (helper[flag][col] === false){
              break;
          }
          else{
              flag--;
          }
      }
      if (flag < 0){
          return {color: getRandomColor(), flag: flag};
        // return {color: 'G', flag: flag};
      }
      return {color: board[flag][col], flag: flag};
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, moves: BoardDelta[], turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) { // stateBeforeMove is null in a new match.
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;
    // log.info(["before", angular.toJson(board)]);
    checkMove(board, moves);
      
    if (isTie(stateBeforeMove) || getWinner(stateBeforeMove) !== '') {
      throw new Error("Can only make a move if the game is not over!");
    }
    
    // TODO: to refill the board
    let boardAfterMove = angular.copy(board);
    let tmp = getBoardAndScore(boardAfterMove, moves);
    boardAfterMove = tmp.board;
    
    while (!CheckMovesAvaiable(boardAfterMove)){
        boardAfterMove = getInitialBoard();
    }
    
    // log.info(["after", angular.toJson(boardAfterMove)]);
    /**Get the updated scores */
    let scores: number[] = angular.copy(stateBeforeMove.scores);
    scores[turnIndexBeforeMove] += tmp.score;
    
    let stateAfterMove: IState = {
        board: boardAfterMove,
        delta: moves,
        current_turn: stateBeforeMove.current_turn+1,
        scores: scores
    };
    
    let winner = getWinner(stateAfterMove);
    let endMatchScores: number[];
    let currentScore: number[] = scores;
    let turnIndexAfterMove: number;
    if (winner !== '' || isTie(stateAfterMove)) {
      // Game over.
      turnIndexAfterMove = -1;
      endMatchScores = winner === '1' ? [1, 0] : winner === '2' ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndexAfterMove = num_of_players - 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    return {endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
  }
  /** check if there is more available moves */
  function CheckMovesAvaiable(board: Board): boolean{
      for (let i = 0; i < ROWS; i++){
          for (let j = 0; j < COLS; j++){
              if (j-1 >= 0 && i+1 <= ROWS-1){
                  if (board[i][j] === board[i][j-1] && board[i][j] === board[i+1][j])
                    return true;
              }
              else if (j+1 <= COLS-1 && i+1 <= ROWS-1){
                  if (board[i][j] === board[i][j+1] && board[i][j] === board[i+1][j])
                    return true;
              }
              else if (i+1 <= ROWS-1 && j-1 >= 0){
                  if (board[i][j] === board[i+1][j] && board[i][j] === board[i+1][j-1])
                    return true;
              }
              else if (i+1 <= ROWS-1 && j+1 <= COLS-1){
                  if (board[i][j] === board[i+1][j] && board[i][j] === board[i+1][j+1])
                    return true;
              }
              else if (i >= 1 && i < ROWS-1 && j >= 1 && j < COLS-1){
                  if (board[i-1][j] === board[i][j-1] && board[i][j-1] === board[i+1][j] && board[i+1][j] === board[i][j+1])
                    return true;
              }
          }
      }
      return false;
  }
  /** check if this move sticks to the rule and throws responding error */
  function checkMove(board: Board, moves: BoardDelta[]): boolean{
      // all moves should be positive
      for (let i = 0; i < moves.length; i++){
          if (moves[i].row < 0 || moves[i].col <0 || moves[i].row >= 8 || moves[i].col >= 6){
              throw new Error("All moves should be positive");
          }
      }
      // it should have at least three points
      if (moves.length <= 3){
          throw new Error("You should draw a circle with at least three points");
      }
      
      // last point should be the first point 
      if (!(moves[0].row === moves[moves.length-1].row && moves[0].col === moves[moves.length-1].col)){
          throw new Error("You should draw a enclosed circle");
      }
      // there should not be duplicate points except for the last point
      if (checkDuplicate(moves)){
          throw new Error("You should a draw enclosed circle without duplicates");
      }
      for (let i = 1; i < moves.length; i++){
          // points should be next the previous one
          if (!(Math.abs(moves[i].row-moves[i-1].row) <= 1 && Math.abs(moves[i].col-moves[i-1].col) <= 1)){
              throw new Error("Point selected should be closed to the previous one");
          }
          
          // Points should all be the same color
          if (board[moves[i].row][moves[i].col] !== board[moves[i-1].row][moves[i-1].col]){
              log.info("after", angular.toJson(board));
              throw new Error("Points should all be the same color");
          }
      }
      return true;
  }
  /** Check if there are any duplicate points in the moves except for the last one */
  function checkDuplicate(moves: BoardDelta[]): boolean{
      let tmp: number[] = [];
      for (let i = 0; i < moves.length-1; i++){
          tmp[i] = moves[i].row * COLS + moves[i].col;
      }
      let ntmp = tmp.sort();
      log.info(ntmp);
      for(let i = 0; i < ntmp.length-1; i++) {
          if (ntmp[i] === ntmp[i+1]){  
            return true;
          }
      }  
      return false;
  }

  export function checkMoveOk(stateTransition: IStateTransition): void {
    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that the move is OK.
    let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
    let stateBeforeMove: IState = stateTransition.stateBeforeMove;
    let move: IMove = stateTransition.move;
    let deltaValue: BoardDelta[] = stateTransition.move.stateAfterMove.delta;
    let expectedMove = createMove(stateBeforeMove, deltaValue, turnIndexBeforeMove);
    if (!angular.equals(move, expectedMove)) {
      throw new Error("Expected move=" + angular.toJson(expectedMove, true) +
          ", but got stateTransition=" + angular.toJson(stateTransition, true))
    }
  }
  
  export function checkMoveOkNoOp(stateTransition: IStateTransition): void {
  }
  
  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, [{row:0, col:0}], 0);
    log.log("move=", move);
    var params: IStateTransition = {
      turnIndexBeforeMove: 0,
      stateBeforeMove: null,
      move: move,
      numberOfPlayers: 2};
    gameLogic.checkMoveOk(params);
  }
}