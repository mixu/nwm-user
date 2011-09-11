/**
 * This is a hot loadable layout for nwm. See module.exports 
 * at end of the file for details.
 *
 * Dwm's tiling a.k.a "Vertical Stack Tiling"
 *
 *  +----------+----------+ +----------+----------+
 *  |          |          | |          |          |
 *  |          |          | |          |          |
 *  |          |          | |          |          |
 *  |          |          | |          +----------+
 *  |          |          | |          |          |
 *  |          |          | |          |          |
 *  |          |          | |          |          |
 *  +---------------------+ +---------------------+
 *        2 windows               3 windows
 *
 *  +----------+----------+ +----------+----------+
 *  |          |          | |          |          |
 *  |          |          | |          +----------+
 *  |          +----------+ |          |          |
 *  |          |          | |          +----------+
 *  |          +----------+ |          |          |
 *  |          |          | |          +----------+
 *  |          |          | |          |          |
 *  +---------------------+ +---------------------+
 *        4 windows               5 windows
 */
function tile(nwm) {
  // the way DWM does it is to reserve half the screen for the first screen,
  // then split the other half among the rest of the screens
  var windows = nwm.visible();
  var screen = nwm.screen;
  if(windows.length < 1) {
    return;
  }
  var mainId = nwm.getMainWindow();
  if(windows.length == 1) {
    nwm.move(mainId, 0, 0);
    nwm.resize(mainId, screen.width, screen.height);
  } else {
    // when main scale = 50, the divisor is 2
    var mainScaleFactor = (100 / nwm.getMainWindowScale() );
    var halfWidth = Math.floor(screen.width / mainScaleFactor);
    nwm.move(mainId, 0, 0);
    nwm.resize(mainId, halfWidth, screen.height);
    // remove from visible
    windows = windows.filter(function(id) { return (id != mainId); });
    console.log('tile', 'main window', mainId, 'others', windows );
    var remainWidth = screen.width - halfWidth;
    var sliceHeight = Math.floor(screen.height / (windows.length) );
    windows.forEach(function(id, index) {
      nwm.move(id, halfWidth, index*sliceHeight);
      nwm.resize(id, remainWidth, sliceHeight);
    });
  }
}

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('tile', tile);
};