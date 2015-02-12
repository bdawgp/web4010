'use strict';

(function(){
  
  var Breakout = function(main, done){
    if(main) this.main = main;
    if(done) this.done = done;

    this.setupBoard();
  };

  Breakout.prototype.main = document.body;

  Breakout.prototype.done = function(){
    console.log('The game is over!');
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

  Breakout.prototype.toggleBrick = function(x, y, notBroken){
    var elem = document.getElementsByClassName('row'+x+' col'+y)[0];
    if(notBroken) elem.classList.remove('broken');
    else elem.classList.add('broken');
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

    console.log('before x', this.ballPath);

    this.ballPath[0] = speedSeconds * Math.floor( (Math.random() * 400) + 200 );
    if(Math.random() < 0.5) this.ballPath[0] *= -1;
    
    console.log('after x, before y', this.ballPath);

    this.ballPath[1] = speedSeconds * 500;

    console.log('after y', this.ballPath);
  };

  Breakout.prototype.moveBall = function(x, y){
    if(x < 0) x = 0;
    if(x > 770) x = 770;
    this.ball.style.left = x + 'px';

    if(y < 0) y = 0;
    if(y > 570) y = 570;
    this.ball.style.top = y + 'px';
  };

  Breakout.prototype.stepBall = function(){
    var ballX = parseInt(this.ball.style.left) + (this.ballPath[0]);
    var ballY = parseInt(this.ball.style.top) + (this.ballPath[1]);
    this.moveBall(ballX, ballY);
  };

  Breakout.prototype.playBall = function(){
    this.initializeBall();
    this.moveBall(385, 300);

    this.ballInterval = setInterval(this.stepBall.bind(this), this.ballSpeed);
  };

  // Start The Game
  window.addEventListener('load', function(){
    var main = document.getElementById('main');
    var game = new Breakout(main);
    window.game = game;
  });
}).call(this);
