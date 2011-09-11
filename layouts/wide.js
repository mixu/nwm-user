/**
 * This is a hot loadable layout for nwm. See module.exports 
 * at end of the file for details.
 *
 * Bottom Stack Tiling (a.k.a. wide)
 *
 *  +----------+----------+ +----------+----------+
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  +---------------------+ +---------------------+
 *  |                     | |          |          |
 *  |                     | |          |          |
 *  |                     | |          |          |
 *  +---------------------+ +---------------------+
 *        2 windows               3 windows
 *
 *  +---------------------+ +---------------------+
 *  |                     | |                     |
 *  |                     | |                     |
 *  |                     | |                     |
 *  +------+-------+------+ +----+-----+-----+----+
 *  |      |       |      | |    |     |     |    |
 *  |      |       |      | |    |     |     |    |
 *  |      |       |      | |    |     |     |    |
 *  +------+-------+------+ +----+-----+-----+----+
 *        4 windows               5 windows
 */
function wide(nwm) {
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
    var halfHeight = Math.floor(screen.height / mainScaleFactor);
    nwm.move(mainId, 0, 0);
    nwm.resize(mainId, screen.width, halfHeight);
    // remove from visible
    windows = windows.filter(function(id) { return (id != mainId); });
    var remainHeight = screen.height - halfHeight;
    var sliceWidth = Math.floor(screen.width / (windows.length) );
    windows.forEach(function(id, index) {
      nwm.move(id, index*sliceWidth, halfHeight);
      nwm.resize(id, sliceWidth, remainHeight);
    });
  }
};

// Hot loading works like this:
// You export a callback function, which gets called every time 
// a hot load needs to occur. 
// The function gets the running instance of nwm, and does it's thing
// e.g. adds a new layout etc.
module.exports = function(nwm) {
  nwm.addLayout('wide', wide);
};