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


function maximize_window(nwm, current_window) {
  console.log('maximize window', current_window);
  var screen = nwm.screen;
  var windows = Object.keys(nwm.windows);
  nwm.show(current_window);
  nwm.move(current_window, 0, 0);
  nwm.resize(current_window, screen.width, screen.height);
  // remove from visible
  windows = windows.filter(function(id) { return (id != current_window); });
  windows.forEach(function(id, index) {
    console.log('hide window', id);
    nwm.hide(id);
  });  
}

function move_windows(percentage, nwm, first, second) {
  var screen = nwm.screen;
  nwm.move(first, -screen.width * percentage, 0);
  nwm.move(second, screen.width * (1 - percentage), 0);
}



function lion(nwm) {
  var windows = Object.keys(nwm.windows);
  if(windows.length < 1) {
    return;
  }
  // get the current workspace
  var workspace = nwm.getWorkspace(nwm.current_workspace);
  // get the settings (if any)

  // get the current window and show that
  workspace.lion || (workspace.lion = {});
  workspace.lion.current_window = (workspace.lion.current_window && nwm.windows[workspace.lion.current_window] ? workspace.lion.current_window : windows[0]);
  // maximize the window
  maximize_window(nwm, workspace.lion.current_window);

}

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('lion', lion);
};