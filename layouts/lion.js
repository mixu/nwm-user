/**
 * This is a hot loadable layout for nwm. See module.exports 
 * at end of the file for details.
 *
 * Lion
 */


// super simple tweening

var Tween = function () {
  // JS interval associated with this tween
  this.interval = null;
  this.onUpdate = null;
  this.onComplete = null;
  this.fps = 10;
  return this;
};

Tween.prototype.start = function(duration) {
  var self = this;
  this._startTime = new Date().getTime();
  this.interval = setInterval( function() {
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
  clearInterval( this.interval );  
};


function enterFromLeft(window, screen) {
  // move to starting position
  window.move( screen.x - screen.width, screen.y);
  // tween current window
  // start off screen (0 - screen.width) and move to (0)
  var tween_current = new Tween();
  tween_current.onUpdate = function(percentage) {
    window.move( Math.floor(screen.x - (screen.width * (1-percentage) )) , screen.y);
  };
  tween_current.onComplete = function(percentage) {
    window.move(screen.x, screen.y);
  };
  tween_current.start(3000);
}

function enterFromRight(window, screen) {
  // move to starting position
  window.move( screen.x + screen.width, screen.y);
  // tween current window
  // start off screen (0 - screen.width) and move to (0)
  var tween_current = new Tween();
  tween_current.onUpdate = function(percentage) {
    window.move( Math.floor(screen.x + screen.width - (screen.width * percentage)) , screen.y);
  };
  tween_current.onComplete = function(percentage) {
    window.move(screen.x, screen.y);
  };
  tween_current.start(3000);
}

function leaveFromLeft(window, screen) {
  window.move(screen.x, screen.y);
  var tween_previous = new Tween();    
  tween_previous.onUpdate = function(percentage) {
    window.move( Math.floor(screen.x + (screen.width * percentage) ), screen.y);
  };
  tween_previous.onComplete = function(percentage) {
    window.move(0,0);
    window.hide();
  };
  tween_previous.start(3000);  
}

function leaveFromRight(window, screen) {
  window.move(screen.x, screen.y);
  var tween_previous = new Tween();    
  tween_previous.onUpdate = function(percentage) {
    window.move( Math.floor(screen.x - (screen.width * percentage) ), screen.y);
  };
  tween_previous.onComplete = function(percentage) {
    window.move(0,0);
    window.hide();
  };
  tween_previous.start(3000);  
}


function maximize_window(nwm, current_window, previous, direction) {
  console.log('[LION] current', current_window, 'previous', previous);
  var screen = nwm.monitors.get(nwm.monitors.current);
  var c_window = nwm.windows.get(current_window);
  c_window.show();
  c_window.resize(screen.width, screen.height);

  if(direction == 'fromLeft') {
    enterFromLeft(c_window, screen);
  } else {
    enterFromRight(c_window, screen);    
  }

  if(previous && nwm.windows.exists(previous)) {
    var p_window = nwm.windows.get(previous);
    p_window.show();
    p_window.resize(screen.width, screen.height);
    if(direction == 'fromLeft') {
      leaveFromLeft(p_window, screen);
    } else {      
      leaveFromRight(p_window, screen);
    }
  }

  // remove from visible
  var windows = Object.keys(nwm.windows.items);
  windows = windows.filter(function(id) { return (id != current_window && id != previous); });
  windows.forEach(function(id, index) {
    console.log('hide window', id);
    nwm.windows.get(id).hide();
  });  
}

function move_windows(percentage, nwm, first, second) {
  var screen = nwm.screen;
  nwm.move(first, -screen.width * percentage, 0);
  nwm.move(second, screen.width * (1 - percentage), 0);
}



function lion(workspace) {
  var windows = Object.keys(workspace.nwm.windows.items);
  if(windows.length < 1) {
    return;
  }
  // get the settings (if any)

  // get the current window and show that
  workspace.lion || (workspace.lion = {});
  var direction = workspace.lion.direction || 'fromLeft';
  var previous = workspace.lion.previous_window || null;
  workspace.lion.current_window = (workspace.lion.current_window && 
    workspace.nwm.windows.exists(workspace.lion.current_window) ? workspace.lion.current_window : workspace.nwm.windows.next(-1));
  // maximize the window
  maximize_window(workspace.nwm, workspace.lion.current_window, previous, direction);
}

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('lion', lion);
};
