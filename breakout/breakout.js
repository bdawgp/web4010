'use strict';

(function(){
  
  var Breakout = function(main, done){
    if(main) this.main = main;
    if(done) this.done = done;

    this.setupBoard();
  };

  Breakout.prototype.main = document.body;

  Breakout.prototype.done = function(won){
    alert(won ? 'You win!' : 'You loose!');
  };

  Breakout.prototype.halt = function(won){
    this.main.removeChild(this.ball);
    if(this.ballInterval) clearInterval(this.ballInterval);
    this.done(!!won);
  };

  Breakout.prototype.listenStart = function(){
    var game = this;
    var listener = function(){
      game.setupBall();
      game.main.removeEventListener('click', listener);
    };
    this.main.addEventListener('click', listener);
  };

  Breakout.prototype.setupBoard = function(){
    // Add Paddle
    this.setupPaddle();
    this.listenPaddle();
    this.setupBricks();
    this.listenStart();
  };

  Breakout.prototype.setupPaddle = function(){
    var elem = document.createElement('div');
    elem.id = 'paddle';
    
    this.paddle = elem;
    this.main.appendChild(this.paddle);
    
    this.movePaddle((800 - 140) / 2);
  };

  Breakout.prototype.listenPaddle = function(){
    var game = this;
    document.body.addEventListener('mousemove', function(e){
      var offset = game.main.offsetLeft + 75;
      var newPos = e.clientX - offset;
      game.movePaddle(newPos);
    });
  };

  Breakout.prototype.movePaddle = function(pos){
    if(pos < 0) pos = 0;
    if(pos > 660) pos = 660;
    
    this.paddle.style.left = pos + 'px';
  };

  Breakout.prototype.setupBricks = function(){
    var x, y, elem;
    for(x = 0; x < 10; x++){
      for(y = 0; y < 10; y++){
        elem = document.createElement('div');
        elem.classList.add('brick', 'row'+x, 'col'+y);
        this.main.appendChild(elem);
      }
    }
  };

  Breakout.prototype.brokenBricks = [];

  Breakout.prototype.toggleBrick = function(x, y, notBroken){
    var brickId = [x,y].join(',');
    if(this.brokenBricks.indexOf(brickId) < 0){
      var elem = document.getElementsByClassName('row'+x+' col'+y)[0];
      if(notBroken) elem.classList.remove('broken');
      else elem.classList.add('broken');

      this.brokenBricks.push(brickId);

      if(this.brokenBricks.length % 10 === 0){
        this.ballPath[0] *= 1.08;
        this.ballPath[1] *= 1.08;
      }
      if(this.brokenBricks.length >= 100) this.halt(true);

      return true;
    }
  };

  Breakout.prototype.setupBall = function(){
    var elem = document.createElement('div');
    elem.id = 'ball';

    this.ball = elem;
    this.main.appendChild(this.ball);

    this.ballPath = [0, 0];
    this.playBall();
  };

  Breakout.prototype.ballSpeed = 20;

  Breakout.prototype.initializeBall = function(){
    var speedSeconds = this.ballSpeed / 1000;

    this.ballPath[0] = speedSeconds * Math.floor( (Math.random() * 400) + 200 );
    if(Math.random() < 0.5) this.ballPath[0] *= -1;
    
    this.ballPath[1] = speedSeconds * 500;
  };

  Breakout.prototype.ballPosition = function(){
    return [ parseInt(this.ball.style.left), parseInt(this.ball.style.top) ];
  };

  Breakout.prototype.moveBall = function(x, y){
    if(x < 0) x = 0;
    if(x > 770) x = 770;
    this.ball.style.left = x + 'px';

    if(y < 0) y = 0;
    if(y > 570) y = 570;
    this.ball.style.top = y + 'px';

    this.checkCollision();
  };

  Breakout.prototype.stepBall = function(){
    var ballC = this.ballPosition();
    var ballX = ballC[0] + (this.ballPath[0]);
    var ballY = ballC[1] + (this.ballPath[1]);
    this.moveBall(ballX, ballY);
  };

  Breakout.prototype.playBall = function(){
    this.initializeBall();
    this.moveBall(385, 300);

    this.ballInterval = setInterval(this.stepBall.bind(this), this.ballSpeed);
  };

  Breakout.prototype.checkCollision = function(){
    var ballC = this.ballPosition();
    this.checkWallCollision(ballC);
    this.checkBrickCollision(ballC);
    this.checkPaddleCollision(ballC);
  };

  Breakout.prototype.checkWallCollision = function(ballC){
    if(ballC[0] <= 0 || ballC[0] >= 770) this.ballPath[0] *= -1;
    if(ballC[1] <= 0 || ballC[1] >= 570) this.ballPath[1] *= -1;
    
    if(ballC[1] >= 570) this.halt();
  };

  Breakout.prototype.checkBrickCollision = function(ballC){
    // Check Left
    if(this.checkPointBrickCollision(ballC[0], ballC[1] + 15, 0));
    // Check Top
    else if(this.checkPointBrickCollision(ballC[0] + 15, ballC[1], 1));
    // Check Right
    else if(this.checkPointBrickCollision(ballC[0] + 30, ballC[1] + 15, 0));
    // Check Bottom
    else if(this.checkPointBrickCollision(ballC[0] + 15, ballC[1] + 30, 1));
  };

  Breakout.prototype.checkPointBrickCollision = function(x, y, path){
    var brickWidth = 80,
        brickHeight = 20;
    var row = Math.floor((y - 100) / brickHeight),
        col = Math.floor(x / brickWidth);
    if(row < 0 || col < 0 || row >= 10 || col >= 10) return;
    if((x + 2) % brickWidth < 4 || (y + 2) % brickHeight < 4) return;
    
    var brickId = [row, col].join(',');
    if(this.brokenBricks.indexOf(brickId) < 0){
      this.toggleBrick(row, col);
      this.ballPath[path] *= -1;
      return true;
    }
  };

  Breakout.prototype.checkPaddleCollision = function(ballC){
    var paddleRight = this.paddle.offsetLeft + this.paddle.clientWidth;
    var paddleBottom = this.paddle.offsetTop + this.paddle.clientHeight;

    if(ballC[1] + 30 < this.paddle.offsetTop) return;
    if(ballC[1] + 30 >= paddleBottom) return;
    if(ballC[0] > paddleRight) return;
    if(ballC[0] + 30 < this.paddle.offsetLeft) return;
    if(this.ballPath[1] < 0) return;

    this.ballPath[1] *= -1;
  };

  // Start The Game
  window.addEventListener('load', function(){
    var main = document.getElementById('main');
    var game = new Breakout(main);
    window.game = game;
  });
}).call(window);
