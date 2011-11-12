// modules
var NWM = require('nwm').NWM;
var XK = require('nwm').keysymdef;
var Xh = require('nwm').Xh;

// instantiate nwm and configure it
var nwm = new NWM();

// KEYBOARD SHORTCUTS
// Change the base modifier to your liking e.g. Xh.Mod4Mask if you just want to use the meta key without Ctrl
var baseModifier = ( process.env.DISPLAY && process.env.DISPLAY == ':1' ? Xh.Mod4Mask|Xh.ControlMask : Xh.Mod4Mask); // to make it easier to reassign the "base" modifier combination

// Workspace management keys (OK)
[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(function(num) {
  var key = XK[num]; // Can't use XK.1 because it is not a valid JS expression, must use XK['1'].
  // number keys are used to move between screens
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.currentMonitor();
    monitor.go(String.fromCharCode(event.keysym));
  });
  // moving windows between workspaces
  nwm.addKey({ key: key, modifier: baseModifier|Xh.ShiftMask }, function(event) {
    var monitor = nwm.currentMonitor();
    monitor.focused_window && monitor.windowTo(monitor.focused_window, String.fromCharCode(event.keysym));
  });
});

// nine more workspaces
[XK.F1, XK.F2, XK.F3, XK.F4, XK.F5, XK.F6, XK.F7, XK.F8, XK.F9].forEach(function(key, index){
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.go(11 + index);
  });
  nwm.addKey({ key: key, modifier: baseModifier|Xh.ShiftMask }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.focused_window && monitor.windowTo(monitor.focused_window, 11 + index);
  });
});

function workspaceUp() {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.current;
  var next = workspace + 1;
  if(next < 0) {
    next = 19;
  }
  if(next > 19) {
    next = 0;
  }
  monitor.go(next);
}

function workspaceDown() {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.current;
  var prev = workspace - 1;
  if(prev < 0) {
    prev = 19;
  }
  if(prev > 19) {
    prev = 0;
  }
  monitor.go(prev);
}

// meta+left and meta+right key for switching workspaces
nwm.addKey({ key: XK.Left, modifier: baseModifier }, workspaceDown);
nwm.addKey({ key: XK.Right, modifier: baseModifier }, workspaceUp);

// meta Page up and meta Page down should go through the workspaces
nwm.addKey({ key: XK.Page_Up, modifier: baseModifier }, workspaceUp);
nwm.addKey({ key: XK.Page_Down, modifier: baseModifier }, workspaceDown);

var rainbow_index = -1;
var rainbow_bg = [ 'DarkRed', 'salmon', 'yellow1', 'green3', 'LightSkyBlue', 'MidnightBlue', 'purple4'];
var rainbow_fg = [ 'snow1', 'grey0', 'grey0', 'grey0', 'grey0', 'snow1', 'snow1'];

// enter key is used to launch xterm (OK)
nwm.addKey({ key: XK.Return, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  // check for whether we are running in a different display
  if(process.env.DISPLAY && process.env.DISPLAY == ':1') {
    // rainbow tarminals
    rainbow_index++;
    if(!rainbow_bg[rainbow_index]) {
      rainbow_index = 0;
    }
    var term = require('child_process').spawn('xterm', ['-lc',
      '-fg', rainbow_fg[rainbow_index],
      '-bg', rainbow_bg[rainbow_index]], { env: process.env });
  } else {
    // normal terminals
    var term = require('child_process').spawn('sakura', [ ], { env: process.env });
  }
  term.on('exit', function (code) {
    console.log('child process exited with code ', code);
  });
});

// c key is used to close a window (OK)
nwm.addKey({ key: XK.c, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  var monitor = nwm.currentMonitor();
  monitor.focused_window && nwm.wm.killWindow(monitor.focused_window);
});

// space switches between layout modes (OK)
nwm.addKey({ key: XK.space, modifier: baseModifier }, function(event) {
  var monitor = nwm.currentMonitor();
  var workspace = monitor.currentWorkspace();
  workspace.layout = nwm.nextLayout(workspace.layout);
  console.log('[LAYOUT] Set layout to ', workspace.layout);
  // monocle hides windows in the current workspace, so unhide them
  monitor.go(monitor.workspaces.current);
});

// h increases the main window size (OK)
[XK.h, XK.F10].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var workspace = nwm.currentMonitor().currentWorkspace();
    workspace.setMainWindowScale(workspace.getMainWindowScale() - 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
  });
});

// l decreases the main window size (OK)
[XK.l, XK.F11].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var workspace = nwm.currentMonitor().currentWorkspace();
    workspace.setMainWindowScale(workspace.getMainWindowScale() + 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
  });
});

// tab makes the current window the main window
nwm.addKey({ key: XK.Tab, modifier: baseModifier }, function(event) {
  var monitor = nwm.currentMonitor();
  console.log('Set main window', monitor.focused_window);
  monitor.currentWorkspace().mainWindow = monitor.focused_window;
});

// moving windows between monitors
nwm.addKey({ key: XK.comma, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  console.log('Current monitor is', nwm.monitors.current);
  var monitor = nwm.currentMonitor();
  var window = monitor.currentWindow();
  if(window) {
    console.log('Set window monitor from', window.monitor, 'to', nwm.monitors.next(window.monitor));
    window.monitor = nwm.monitors.next(window.monitor);
    // set the workspace to the current workspace on that monitor
    var other_monitor = nwm.monitors.get(window.monitor);
    window.workspace = other_monitor.workspaces.current;
    // rearrange both monitors
    monitor.currentWorkspace().rearrange();
    other_monitor.currentWorkspace().rearrange();
  }
});

// moving windows between monitors
nwm.addKey({ key: XK.period, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  console.log('Current monitor is', nwm.monitors.current);
  var monitor = nwm.currentMonitor();
  var window = monitor.currentWindow();
  if(window) {
    console.log('Set window monitor from', window.monitor, 'to', nwm.monitors.next(window.monitor));
    window.monitor = nwm.monitors.prev(window.monitor);
    // set the workspace to the current workspace on that monitor
    var other_monitor = nwm.monitors.get(window.monitor);
    window.workspace = other_monitor.workspaces.current;
    // rearrange both monitors
    monitor.currentWorkspace().rearrange();
    other_monitor.currentWorkspace().rearrange();
  }
});

// moving focus
nwm.addKey({ key: XK.j, modifier: baseModifier }, function() {
  var monitor = nwm.currentMonitor();
  var current = monitor.currentWindow();
  if(current) {
    var previous = nwm.windows.prev(current.id);
    var window = nwm.windows.get(previous);
    console.log('Current', current.id, 'previous', window.id);
    monitor.focused_window = window.id;
    nwm.wm.focusWindow(window.id);
  }
});
nwm.addKey({ key: XK.k, modifier: baseModifier }, function() {
  var monitor = nwm.currentMonitor();
  var current = monitor.currentWindow();
  if(current) {
    var next = nwm.windows.next(current.id);
    var window = nwm.windows.get(next);
    console.log('Current', current.id, 'next', window.id);
    monitor.focused_window = window.id;
    nwm.wm.focusWindow(monitor.focused_window);
  }
});

// TODO: graceful shutdown
nwm.addKey({ key: XK.q, modifier: baseModifier|Xh.ShiftMask }, function() {
  process.exit();
});

// HOT LOAD
// Load all files in ./layouts and watch it for changes
nwm.hotLoad(__dirname+'/layouts/flexible.js');
nwm.hotLoad(__dirname+'/layouts/monocle.js');
nwm.hotLoad(__dirname+'/layouts/wide.js');

//var vmware = require('child_process').spawn('vmware-user', [], { env: process.env });
//vmware.on('exit', function (code) {
//  console.log('child process exited with code ', code);
//});

//var guake = require('child_process').spawn('guake', [], { env: process.env });
//guake.on('exit', function (code) {
//  console.log('child process exited with code ', code);
//});


// REPL

// list windows
var Repl = function() {};
Repl.windows = function() {
  console.log(['id', 'monitor', 'workspace', 'title', 'x', 'y', 'h', 'w'].join(' | '));
  var items = [];
  Object.keys(nwm.windows.items).forEach(function(id) {
    var window = nwm.windows.get(id);
    items.push([window.id, window.monitor, window.workspace, window.title, window.x, window.y, window.height, window.width ]);
  });

  items.forEach(function(item) {
    console.log(item.join(' | '));
  });
};


// START
nwm.start(function() {
  // expose repl over unix socket
  var repl = require('repl');
  var net = require('net');
  net.createServer(function(socket) {
    console.log('Started REPL via unix socket on ./repl-sock. Use socat to connect: "socat STDIN UNIX-CONNECT:./repl-sock"');
    var r = repl.start('>', socket);
    r.context.nwm = nwm;
    r.context.windows = Repl.windows;
  }).listen('./repl-sock');
});
