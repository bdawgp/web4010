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

  var TicTacToe = function(done){
    this.active = true;
    this.turn = 0;

    this.takeTurn = function(element){
      if(!this.active || element.innerHTML !== '&nbsp;') return;
      this.turn++;
      
      element.innerHTML = (this.turn % 2) ? 'X' : 'O';
      this.checkWin(element);

      if(this.turn >= 9 && this.active){
        this.active = false;
        this.notifyWinner();
      }
    };

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

    this.eachCombo = function(id, next){
      var i;
      for(i = 0; i < wins.length; i++){
        if(wins[i].indexOf(id) >= 0) next(wins[i]);
      }
    };

    this.groupSingleOwner = function(group){
      var i, owner, squareOwner;
      for(i = 0; i < group.length; i++){
        squareOwner = this.getSquare(group[i]).innerHTML;
        if(!owner){
          owner = squareOwner;
        }else if(owner !== squareOwner){
          return false;
        }
      }
      return true;
    };

    this.highlightGroup = function(group){
      var i;
      for(i = 0; i < group.length; i++){
        this.getSquare(group[i]).className = 'winner';
      }
    };

    this.notifyWinner = function(team){
      if(team) alert('Player '+team+' won!');
      else alert('It was a tie game!');
      if(done) done.call(this, team || 'tie');
    };

    this.getSquare = function(id){
      return document.getElementById(id);
    };
  };

  var game = new TicTacToe(function(){
    // callback for when the game is over
    setTimeout(function(){
       location.reload();
    }, 1000);
  });
  
  var handleClick = function(){
    // use a separate function because of bindings
    game.takeTurn(this);
  }, e, x, y;
  for(e = 0; e < 9; e++){
    x = e % 3;
    y = parseInt(e / 3);
    game.getSquare('square' + String(x) + String(y)).onclick = handleClick;
  }
}).call(this);
