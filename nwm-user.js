// modules
var NWM = require('nwm').NWM;
var XK = require('nwm').keysymdef;
var Xh = require('nwm').Xh;
var webrepl = require('webrepl');

// instantiate nwm and configure it
var nwm = new NWM();

// KEYBOARD SHORTCUTS
var baseModifier = ( process.env.DISPLAY && process.env.DISPLAY == ':1' ? Xh.Mod4Mask|Xh.ControlMask : Xh.Mod4Mask); // to make it easier to reassign the "base" modifier combination
// Workspace management - since we do the same thing for keys 0..9, use an array
[XK.XK_1, XK.XK_2, XK.XK_3, XK.XK_4, XK.XK_5, XK.XK_6, XK.XK_7, XK.XK_8, XK.XK_9].forEach(function(key) {
  // workspace switching
  // number keys are used to move between screens
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) { 
    nwm.go(String.fromCharCode(event.keysym)); 
  });  
  // moving windows between workspaces
  nwm.addKey({ key: key, modifier: baseModifier|Xh.ShiftMask }, function(event) { 
    nwm.focused_window && nwm.windowTo(nwm.focused_window, String.fromCharCode(event.keysym));
  });
});

// starting xterm
// enter key is used to launch xterm
nwm.addKey({ key: XK.XK_Return, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  var term = require('child_process').spawn('xterm', ['-lc'], { env: process.env });
  term.on('exit', function (code) {
    console.log('child process exited with code ', code);
  });  
});

// closing a window
// c key is used to terminate the process
nwm.addKey({ key: XK.XK_c, modifier: baseModifier|Xh.ShiftMask }, function(event) {
  nwm.focused_window && nwm.wm.killWindow(nwm.focused_window);
});

// alternating between layout modes
// space switches between layouts
nwm.addKey({ key: XK.XK_space, modifier: baseModifier }, function(event) {
  var workspace = nwm.getWorkspace(nwm.current_workspace);
  workspace.layout = nwm.nextLayout(workspace.layout);
  // monocle hides windows in the current workspace, so unhide them
  nwm.go(nwm.current_workspace);
  nwm.rearrange();
});

// increase and decrease master area size
// h increases the main window size
[XK.XK_h, XK.XK_F10].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var workspace = nwm.getWorkspace(nwm.current_workspace);
    workspace.setMainWindowScale(workspace.getMainWindowScale() - 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
    nwm.rearrange();
  });
});

// l decreases the main window size
[XK.XK_l, XK.XK_F11].forEach(function(key) {
  nwm.addKey({ key: key, modifier: baseModifier }, function(event) {
    var workspace = nwm.getWorkspace(nwm.current_workspace);
    workspace.setMainWindowScale(workspace.getMainWindowScale() + 5);
    console.log('Set main window scale', workspace.getMainWindowScale());
    nwm.rearrange();
  });  
});

// make the currently focused window the main window
// tab makes the current window the main window
nwm.addKey({ key: XK.XK_Return, modifier: baseModifier }, function(event) {
  console.log('Set main window', nwm.focused_window);
  nwm.setMainWindow(nwm.focused_window);
  nwm.rearrange();  
});

// layout switching
nwm.addKey({ key: XK.XK_t, modifier: baseModifier }, function() {
  var workspace = nwm.getWorkspace(nwm.current_workspace);
  workspace.layout = 'tile';
  // monocle hides windows in the current workspace, so unhide them
  nwm.go(nwm.current_workspace);
  nwm.rearrange();
});
nwm.addKey({ key: XK.XK_w, modifier: baseModifier }, function() {
  var workspace = nwm.getWorkspace(nwm.current_workspace);
  workspace.layout = 'wide';
  // monocle hides windows in the current workspace, so unhide them
  nwm.go(nwm.current_workspace);
  nwm.rearrange();  
});
nwm.addKey({ key: XK.XK_m, modifier: baseModifier }, function() {
  var workspace = nwm.getWorkspace(nwm.current_workspace);
  workspace.layout = 'monocle';
  // monocle hides windows in the current workspace, so unhide them
  nwm.go(nwm.current_workspace);
  nwm.rearrange();  
});


// TODO: moving focus 
nwm.addKey({ key: XK.XK_j, modifier: baseModifier }, function() {});
// TODO: graceful shutdown
nwm.addKey({ key: XK.XK_q, modifier: baseModifier|Xh.ShiftMask }, function() {});

// HOT LOAD
// Load all files in ./layouts and watch it for changes
nwm.hotLoad(__dirname+'/layouts/tile.js');
nwm.hotLoad(__dirname+'/layouts/grid.js');

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
