

function grid(workspace) {
  var windows = workspace.visible();
  var screen = workspace.monitor;
  var window_ids = Object.keys(windows);
  if(window_ids.length < 1) {
    return;
  }
  var rows, cols;
  for(cols = 0; cols <= window_ids.length/2; cols++) {
    if(cols * cols >= window_ids.length) {
      break;
    }
  }
  rows = ((cols && (cols -1) * cols >= window_ids.length) ? cols - 1 : cols);
  console.log('rows, cols', rows, cols);
  // cells
  var cellHeight = screen.height / (rows ? rows : 1);
  var cellWidth = screen.width / (cols ? cols : 1);
  console.log('Cell dimensions', cellWidth, cellHeight);
  // order the windows so that the main window is the first window in the grid
  // and the others are in numeric order (with wraparound)
  var mainId = workspace.mainWindow;
  var mainPos = window_ids.indexOf(''+mainId);
  mainPos = (mainPos == -1 ? window_ids.indexOf(mainId) : mainPos);
  var ordered = window_ids.slice(mainPos).concat(window_ids.slice(0, mainPos));
  ordered.forEach(function(id, index) {
    if(rows > 1 && index == (rows*cols) - cols
       && (window_ids.length - index) <= ( window_ids.length)
      ) {
      cellWidth = screen.width / (window_ids.length - index);
    }

    var newX = screen.x + Math.floor(index % cols) * cellWidth;
    var newY = screen.y + Math.floor(index / cols) * cellHeight;
    windows[id].move(Math.floor(newX), Math.floor(newY));

    // adjust height/width of last row/col's windows
    var adjustHeight = ( (index >= cols * (rows -1) ) ?  screen.height - cellHeight * rows : 0 );
    var adjustWidth = 0;
    if(rows > 1 && index == window_ids.length-1 && (window_ids.length - index) < (window_ids.length % cols) ) {
      adjustWidth = screen.width - cellWidth * (window_ids.length % cols );
    } else {
      adjustWidth = ( ((index + 1) % cols == 0 ) ? screen.width - cellWidth * cols : 0 );
    }

    windows[id].resize(Math.floor(cellWidth+adjustWidth), Math.floor(cellHeight+adjustHeight) );
  });
}

function tile(workspace) {
  // the way DWM does it is to reserve half the screen for the first screen,
  // then split the other half among the rest of the screens
  var windows = workspace.visible();
  var screen = workspace.monitor;
  if(Object.keys(windows).length < 1) {
    return;
  }
  var mainId = workspace.mainWindow;
  if(Object.keys(windows).length == 1) {
    windows[mainId].move(screen.x, screen.y);
    windows[mainId].resize(screen.width, screen.height);
  } else {
    // when main scale = 50, the divisor is 2
    var mainScaleFactor = (100 / workspace.getMainWindowScale() );
    var halfWidth = Math.floor(screen.width / mainScaleFactor);
    windows[mainId].move(screen.x, screen.y);
    windows[mainId].resize(halfWidth, screen.height);
    // remove from visible
    var ids = Object.keys(windows);
    ids = ids.filter(function(id) { return (id != mainId); });
    ids = ids.map(function(id) { return parseInt(id, 10); });
    var remainWidth = screen.width - halfWidth;
    var sliceHeight = Math.floor(screen.height / (ids.length) );
    ids.forEach(function(id, index) {
      console.log(halfWidth, index, sliceHeight, index*sliceHeight);
      windows[id].move(screen.x + halfWidth, screen.y + index*sliceHeight);
      windows[id].resize(remainWidth, sliceHeight);
    });
  }
};

/*
 * When the number of windows is odd, use the tiling layout
 * When the number of windows is even, use the grid layout
 */
function flexible(workspace) {
  var windows = workspace.visible();
  if(Object.keys(windows).length % 2 == 0 && Object.keys(windows).length != 2) {
    grid(workspace);
  } else {
    tile(workspace);
  }
}

module.exports = flexible;

