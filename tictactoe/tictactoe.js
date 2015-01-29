/**
 * Tic Tac Toe
 * @license MIT
 * Copyright (c) 2015-2018 Bradyn Poulsen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(){
  var wins = [
    // rows
    ['square00', 'square10', 'square20'],
    ['square01', 'square11', 'square21'],
    ['square02', 'square12', 'square22'],
    // columns
    ['square00', 'square01', 'square02'],
    ['square10', 'square11', 'square12'],
    ['square20', 'square21', 'square22'],
    // diagonals
    ['square00', 'square11', 'square22'],
    ['square02', 'square11', 'square20']
  ];

  /**
   * TicTacToe
   * @class
   *
   * @param {TicTacToe~gameOver`} done - Game over callback
   */
  var TicTacToe = function(done){
    /** @member {boolean} */
    this.active = true;
    /** @member {number} */
    this.turn = 0;

    /**
     * @method takeTurn
     * @description handle the next turn using element
     *
     * @param {HTMLElement} element
     * @return {undefined}
     */
    this.takeTurn = function(element){
      if(!this.active || element.innerHTML !== '&nbsp;') return;
      this.turn++;
      
      /** @type {string} */
      element.innerHTML = (this.turn % 2) ? 'X' : 'O';
      this.checkWin(element);

      if(this.turn >= 9 && this.active){
        this.active = false;
        this.notifyWinner();
      }
    };

    /**
     * @method checkWin
     * @description check if there is a winning combo. If there is, highlight combos
     *  and notify the winner.
     *
     * @param {HTMLElement} element
     * @return {undefined}
     */
    this.checkWin = function(element){
      var won = false;
      this.eachCombo(element.id, function(group){
        if(this.groupSingleOwner(group)){
          won = true;
          this.highlightGroup(group);
        }  
      }.bind(this));
      
      if(won){
        this.active = false;
        this.notifyWinner(element.innerHTML);
      }
    };

    /**
     * @method eachCombo
     * @description filter possible win combos that contain `id` and execute `next`
     *
     * @param {string} id - element id to filter by
     * @param {TicTacToe~comboGroup} next - function to call on each result
     * @return {undefined}
     */
    this.eachCombo = function(id, next){
      var i;
      for(i = 0; i < wins.length; i++){
        if(wins[i].indexOf(id) >= 0) next(wins[i]);
      }
    };

    /**
     * @method groupSingleOwner
     * @description verify that all elements in combo group have same owner
     *
     * @param {string[]} group
     * @return {boolean}
     */
    this.groupSingleOwner = function(group){
      var i, owner, squareOwner;
      for(i = 0; i < group.length; i++){
        /** @type {string} */
        squareOwner = this.getSquare(group[i]).innerHTML;
        if(!owner){
          owner = squareOwner;
        }else if(owner !== squareOwner){
          return false;
        }
      }
      return true;
    };

    /**
     * @method highlightGroup
     * @description apply 'winner' class to each element in combo group
     *
     * @param {string[]} group
     * @return {undefined}
     */
    this.highlightGroup = function(group){
      var i;
      for(i = 0; i < group.length; i++){
        this.getSquare(group[i]).className = 'winner';
      }
    };

    /**
     * @method notifyWinner
     * @description alert the game winner and fire the {@link TicTacToe~gameOver}
     *
     * @param {string=} team
     * @return {undefined}
     */
    this.notifyWinner = function(team){
      if(team) alert('Player '+team+' won!');
      else alert('It was a tie game!');
      if(done) done.call(this, team || 'tie');
    };

    /**
     * @method getSquare
     * @description perform a getElementById lookup
     *
     * @param {string} id
     * @return {HTMLElement}
     */
    this.getSquare = function(id){
      return document.getElementById(id);
    };

    /**
     * @callback TicTacToe~gameOver
     * @this TicTacToe
     * @param {string} [team='tie']
     */

    /**
     * @callback TicTacToe~comboGroup
     * @param {string[]} group
     */
  };

  /** @type {TicTacToe} */
  var game = new TicTacToe(function(){
    setTimeout(function(){
       location.reload();
    }, 1000);
  });
  
  /**
   * @function handleClick
   * @description click event handler used to avoid binding conflicts
   *
   * @this HTMLElement
   * @return {undefined}
   */
  var handleClick = function(){
    game.takeTurn(this);
  }, e, x, y;
  for(e = 0; e < 9; e++){
    x = e % 3;
    y = parseInt(e / 3);
    game.getSquare('square' + String(x) + String(y)).onclick = handleClick;
  }
}).call(this);
