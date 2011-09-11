var Tween = function () {
  // JS interval associated with this tween
  this.interval = null;
  this.onUpdate = null;
  this.onComplete = null;
  this.fps = 60;
  return this;
};


Tween.prototype.start = function(duration) {
  var self = this;
  this._startTime = new Date().getTime();
  interval = setInterval( function() {
    var time = new Date().getTime();
    var elapsed = ( time - self._startTime ) / duration;
    elapsed = elapsed > 1 ? 1 : elapsed;    
    self.onUpdate && self.onUpdate.call(self, elapsed);
    if (elapsed == 1) {
      self.stop();
      self.onComplete &&  self.onComplete.call(self);
    }
  }, 1000 / this.fps );  
};

Tween.prototype.stop = function() {
  clearInterval( interval );  
};


// test it

var t = new Tween();
t.onUpdate = function(value) { 
  console.log(value); 
};
t.onComplete = function() { 
  console.log('Done'); 
};
t.start(10000);

