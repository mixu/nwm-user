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

// enter key is used to launch xterm (OK)
nwm.addKey({ key: XK.XK_Return, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  // check for whether we are running in a different display
  var term = require('child_process').spawn('xterm', ['-lc'], { env: process.env });
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
  workspace.setMainWindow(monitor.focused_window);
  workspace.rearrange();  
});

// moving windows between monitors
nwm.addKey({ key: XK.XK_comma, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var window = nwm.windows.get(monitor.focused_window);
    window.monitor = nwm.monitors.next(window.monitor);
  }
});

// moving windows between monitors
nwm.addKey({ key: XK.XK_period, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  var monitor = nwm.monitors.get(nwm.monitors.current);
  if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
    var window = nwm.windows.get(monitor.focused_window);
    window.monitor = nwm.monitors.prev(window.monitor);
  }
});

// TODO: moving focus 
nwm.addKey({ key: XK.XK_j, modifier: baseModifier }, function() {});
// TODO: graceful shutdown
nwm.addKey({ key: XK.XK_q, modifier: baseModifier|Xh.ShiftMask }, function() {});

// HOT LOAD
// Load all files in ./layouts and watch it for changes
nwm.hotLoad(__dirname+'/layouts/tile.js');

/*
nwm.hotLoad(__dirname+'/layouts/grid.js');

nwm.hotLoad(__dirname+'/layouts/lion.js');

  // set keyboard shortcuts
  nwm.addKey({ key: XK.XK_o, modifier: Xh.Mod4Mask }, function() {
    // set the previous window as the full screen window
    var windows = Object.keys(nwm.windows);
    var workspace = nwm.getWorkspace(nwm.current_workspace);
    var mainPos = windows.indexOf(''+workspace.lion.current_window);
    if(windows[mainPos+1]) {
      workspace.lion.current_window = windows[mainPos+1];
    } else {
      workspace.lion.current_window = windows[0];
    }
    console.log('XK LEFT -- lion', workspace.lion.current_window);
    // rearrange
    nwm.rearrange();
  });
  nwm.addKey({ key: XK.XK_p, modifier: Xh.Mod4Mask }, function() {
    // set the next window as the full screen window
    var windows = Object.keys(nwm.windows);
    var workspace = nwm.getWorkspace(nwm.current_workspace);
    var mainPos = windows.indexOf(''+workspace.lion.current_window);    
    if(mainPos -1 >= 0) {
      workspace.lion.current_window = windows[mainPos-1];
    } else {
      workspace.lion.current_window = windows[windows.length-1];
    }
    console.log('XK RIGHT -- lion', workspace.lion.current_window);
    // rearrange
    nwm.rearrange();
  });
*/

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
