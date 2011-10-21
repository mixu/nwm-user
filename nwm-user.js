// modules
var NWM = require('nwm').NWM;
var XK = require('nwm').keysymdef;
var Xh = require('nwm').Xh;
var webrepl = require('webrepl');

// instantiate nwm and configure it
var nwm = new NWM();

// KEYBOARD SHORTCUTS
// Change the base modifier to your liking e.g. Xh.Mod4Mask if you just want to use the meta key without Ctrl
var baseModifier = ( process.env.DISPLAY && process.env.DISPLAY == ':1' ? Xh.Mod4Mask|Xh.ControlMask : Xh.Mod4Mask); // to make it easier to reassign the "base" modifier combination

// Workspace management keys (OK)
[XK.XK_1, XK.XK_2, XK.XK_3, XK.XK_4, XK.XK_5, XK.XK_6, XK.XK_7, XK.XK_8, XK.XK_9].forEach(function(key) {
  // number keys are used to move between screens
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.go(String.fromCharCode(event.keysym));
  });
  // moving windows between workspaces
  nwm.addKey({ key: key, modifier: baseModifier|Xh.ShiftMask }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.focused_window && monitor.windowTo(monitor.focused_window, String.fromCharCode(event.keysym));
  });
});

// ten more workspaces
[XK.XK_F1, XK.XK_F2, XK.XK_F3, XK.XK_F4, XK.XK_F5, XK.XK_F6, XK.XK_F7, XK.XK_F8, XK.XK_F9, XK.F10].forEach(function(key, index){
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.go(9 + index);
  });
  nwm.addKey({ key: key, modifier: baseModifier|Xh.ShiftMask }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    monitor.focused_window && monitor.windowTo(monitor.focused_window, 9 + index);
  });
});

// meta Page up and meta Page down should go through the workspaces
nwm.addKey({ key: XK.XK_KP_Page_Up, modifier: baseModifier }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.get(monitor.workspaces.current);
  var next = workspace + 1;
  if(next < 0 || next > 19) {
    next = 0;
  }
  monitor.go(next);
});
nwm.addKey({ key: XK.XK_KP_Page_Down, modifier: baseModifier }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.get(monitor.workspaces.current);
  var prev = workspace - 1;
  if(prev < 0 || prev > 19) {
    prev = 0;
  }
  monitor.go(prev);
});



var rainbow_index = -1;
var rainbow_bg = [ 'DarkRed', 'salmon', 'yellow1', 'green3', 'LightSkyBlue', 'MidnightBlue', 'purple4'];
var rainbow_fg = [ 'snow1', 'grey0', 'grey0', 'grey0', 'grey0', 'snow1', 'snow1'];

// enter key is used to launch xterm (OK)
nwm.addKey({ key: XK.XK_Return, modifier: baseModifier|Xh.ShiftMask }, function(event) {
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
    var term = require('child_process').spawn('gnome-terminal', [ ], { env: process.env });
  }
  term.on('exit', function (code) {
    console.log('child process exited with code ', code);
  });
});

// c key is used to close a window (OK)
nwm.addKey({ key: XK.XK_c, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  monitor.focused_window && nwm.wm.killWindow(monitor.focused_window);
});

// space switches between layout modes (OK)
nwm.addKey({ key: XK.XK_space, modifier: baseModifier }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.get(monitor.workspaces.current);
  workspace.layout = nwm.nextLayout(workspace.layout);
  console.log('[LAYOUT] Set layout to ', workspace.layout);
  // monocle hides windows in the current workspace, so unhide them
  monitor.go(monitor.workspaces.current);
  workspace.rearrange();
});

// h increases the main window size (OK)
[XK.XK_h, XK.XK_F10].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    var workspace = monitor.workspaces.get(monitor.workspaces.current);
    workspace.setMainWindowScale(workspace.getMainWindowScale() - 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
    workspace.rearrange();
  });
});

// l decreases the main window size (OK)
[XK.XK_l, XK.XK_F11].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var monitor = nwm.monitors.get(nwm.monitors.current);
    var workspace = monitor.workspaces.get(monitor.workspaces.current);
    workspace.setMainWindowScale(workspace.getMainWindowScale() + 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
    workspace.rearrange();
  });
});

// tab makes the current window the main window
nwm.addKey({ key: XK.XK_Tab, modifier: baseModifier }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  var workspace = monitor.workspaces.get(monitor.workspaces.current);
  console.log('Set main window', monitor.focused_window);
  workspace.mainWindow = monitor.focused_window;
  workspace.rearrange();
});

// moving windows between monitors
nwm.addKey({ key: XK.XK_comma, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  console.log('Current monitor is', nwm.monitors.current);
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var window = nwm.windows.get(monitor.focused_window);
    console.log('Set window monitor from', window.monitor, 'to', nwm.monitors.next(window.monitor));
    window.monitor = nwm.monitors.next(window.monitor);
    // set the workspace to the current workspace on that monitor
    var other_monitor = nwm.monitors.get(window.monitor);
    window.workspace = other_monitor.workspaces.current;
    // rearrange both monitors
    monitor.workspaces.get(monitor.workspaces.current).rearrange();
    other_monitor.workspaces.get(other_monitor.workspaces.current).rearrange();
  }
});

// moving windows between monitors
nwm.addKey({ key: XK.XK_period, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  console.log('Current monitor is', nwm.monitors.current);
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var window = nwm.windows.get(monitor.focused_window);
    console.log('Set window monitor from', window.monitor, 'to', nwm.monitors.next(window.monitor));
    window.monitor = nwm.monitors.prev(window.monitor);
    // set the workspace to the current workspace on that monitor
    var other_monitor = nwm.monitors.get(window.monitor);
    window.workspace = other_monitor.workspaces.current;
    // rearrange both monitors
    monitor.workspaces.get(monitor.workspaces.current).rearrange();
    other_monitor.workspaces.get(other_monitor.workspaces.current).rearrange();
  }
});

// moving focus
nwm.addKey({ key: XK.XK_j, modifier: baseModifier }, function() {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var previous = nwm.windows.prev(monitor.focused_window);
    var window = nwm.windows.get(previous);
    console.log('Current', monitor.focused_window, 'previous', window.id);
    monitor.focused_window = window.id;
    nwm.wm.focusWindow(window.id);
  }
});
nwm.addKey({ key: XK.XK_k, modifier: baseModifier }, function() {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var next = nwm.windows.next(monitor.focused_window);
    var window = nwm.windows.get(next);
    console.log('Current', monitor.focused_window, 'next', window.id);
    monitor.focused_window = window.id;
    nwm.wm.focusWindow(monitor.focused_window);
  }
});

// TODO: graceful shutdown
nwm.addKey({ key: XK.XK_q, modifier: baseModifier|Xh.ShiftMask }, function() {
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

// START
nwm.start(function() {
  // Expose via stdout
  var repl_stdout = require('repl').start();
  repl_stdout.context.nwm = nwm;
  repl_stdout.context.Xh = Xh;
  // Expose via webrepl
  console.log('Starting webrepl');
  var repl_web = webrepl.start(6000);
  repl_web.context.nwm = nwm;
});
