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
/**
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
function tile(workspace) {
  // the way DWM does it is to reserve half the screen for the first screen,
  // then split the other half among the rest of the screens
  var windows = workspace.visible();
  console.log('TILE', workspace, windows);
  var screen = workspace.monitor;
  console.log('TILE screen', screen);
  if(Object.keys(windows).length < 1) {
    return;
  }
  var mainId = workspace.getMainWindow();
  console.log('mainID', mainId, windows);
  if(Object.keys(windows).length == 1) {
    windows[mainId].move(0, 0);
    windows[mainId].resize(screen.width, screen.height);
  } else {
    // when main scale = 50, the divisor is 2
    var mainScaleFactor = (100 / workspace.getMainWindowScale() );
    var halfWidth = Math.floor(screen.width / mainScaleFactor);
    windows[mainId].move(0, 0);
    windows[mainId].resize(halfWidth, screen.height);
    // remove from visible
    var ids = Object.keys(windows);
    ids = ids.filter(function(id) { return (id != mainId); });
    console.log(ids);
    ids = ids.map(function(id) { return parseInt(id, 10); });
    console.log(ids);
    console.log('tile', 'main window', mainId, 'others', windows );
    var remainWidth = screen.width - halfWidth;
    var sliceHeight = Math.floor(screen.height / (ids.length) );
    ids.forEach(function(id, index) {
      console.log(halfWidth, index, sliceHeight, index*sliceHeight);
      windows[id].move(halfWidth, index*sliceHeight);
      windows[id].resize(remainWidth, sliceHeight);
    });
  }
};

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('tile', tile);
};
