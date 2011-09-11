/**
 * This is a hot loadable layout for nwm. See module.exports 
 * at end of the file for details.
 *
 * Monocle (a.k.a. fullscreen)
 *
 *  +---------------------+ +---------------------+
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  +---------------------+ +---------------------+
 *        2 windows               3 windows
 *
 *  +---------------------+ +---------------------+
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  +---------------------+ +---------------------+
 *        4 windows               5 windows
 */

function monocle(nwm){
  var windows = nwm.visible();
  var screen = nwm.screen;
  if(windows.length < 1) {
    return;
  }
  var mainId = nwm.getMainWindow();
  nwm.move(mainId, 0, 0);
  nwm.resize(mainId, screen.width, screen.height);
  // remove from visible
  windows = windows.filter(function(id) { return (id != mainId); });
  windows.forEach(function(id, index) {
    nwm.hide(id);
  });
}

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('monocle', monocle);
};