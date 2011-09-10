// CUSTOM FUNCTIONS

nwm.random = function() {
  var self = this;
  var screen = this.screen;
  var keys = Object.keys(this.windows);
  keys.forEach(function(id, index) {
    self.move(id, Math.floor(Math.random()*(screen.width-300)), Math.floor(Math.random()*(screen.height-300)));    
  });
};

nwm.globalSmall = function() {
  var self = this;
  var keys = Object.keys(this.windows);
  keys.forEach(function(id, index) {
    self.resize(id, 200, 200);    
  });  
};

var tweens = [];

nwm.tween = function(id) {
  var self = this;
  var radius = 200;
  var circle_x = Math.floor(self.screen.width / 2);
  var circle_y = Math.floor(self.screen.height / 2);
  if(circle_x+radius*2 > self.screen.width) {
    circle_x -= radius*2;
  }
  if(circle_y+radius*2 > self.screen.height) {
    circle_y -= radius*2;
  }
  if(circle_x-radius*2 < 0) {
    circle_x += radius*2;
  }
  if(circle_y-radius*2 < 0) {
    circle_y += radius*2;
  }

  function circularPath(index) {

    var cx = circle_x;
    var cy = circle_y;
    var aStep = 3;   // 3 degrees per step
    var theta = index * aStep;  // +ve angles are cw

    var newX = cx + radius * Math.cos(theta * Math.PI / 180);
    var newY = cy + radius * Math.sin(theta * Math.PI / 180);

    // return an object defining state that can be understood by drawFn
    return  {x: newX, y: newY};
  }
  var step = 0;
  var result = setInterval(function() {
    step++;
    var pos = circularPath(step);
    self.move(id, Math.floor(pos.x), Math.floor(pos.y));
  }, 1000 / 60);
  tweens.push({ id: id, interval: result} );
};

nwm.stop = function() {
  for(var i = 0; i < tweens.length; i++) {
    clearInterval(tweens[i].interval); 
  }
  tweens = [];
};

