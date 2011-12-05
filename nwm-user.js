// modules
var wm = require('nwm');
var NWM = wm.NWM,
    XK = wm.keysymdef,
    Xh = wm.Xh,
    child_process = require('child_process');

// instantiate nwm and configure it
var nwm = new NWM();

// load layouts
var layouts = wm.layouts;
nwm.addLayout('flexible', require(__dirname+'/layouts/flexible.js'));
nwm.addLayout('monocle', layouts.monocle);
nwm.addLayout('wide', layouts.wide);

// convinience functions for writing the keyboard shortcuts
function currentMonitor() {
  return nwm.monitors.get(nwm.monitors.current);
}

function moveToMonitor(window, currentMonitor, otherMonitorId) {
  if (window) {
    window.monitor = otherMonitorId;
    // set the workspace to the current workspace on that monitor
    var otherMonitor = nwm.monitors.get(otherMonitorId);
    window.workspace = otherMonitor.workspaces.current;
    // rearrange both monitors
    currentMonitor.workspaces.get(currentMonitor.workspaces.current).rearrange();
    otherMonitor.workspaces.get(otherMonitor.workspaces.current).rearrange();
  }
}

function resizeWorkspace(increment) {
  var workspace = currentMonitor().currentWorkspace();
  workspace.setMainWindowScale(workspace.getMainWindowScale() + increment);
  workspace.rearrange();
}

function changeWorkspace(increment) {
  var monitor = currentMonitor();
  var next = monitor.workspaces.current + increment;
  if (next < 0) { next = 19; }
  if (next > 19) { next = 0; }
  monitor.go( next );
}

// KEYBOARD SHORTCUTS
// Change the base modifier to your liking e.g. Xh.Mod4Mask if you just want to use the meta key without Ctrl
var baseModifier = Xh.Mod4Mask; // Win key

if ( process.env.DISPLAY && process.env.DISPLAY == ':1' ) {
  baseModifier = Xh.Mod4Mask|Xh.ControlMask; // Win + Ctrl
}

var keyboard_shortcuts = [
  {
    key: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], // number keys are used to move between screens
    callback: function(event) {
      currentMonitor().go(String.fromCharCode(event.keysym));
    }
  },
  {
    key: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], // with shift, move windows between workspaces
    modifier: [ 'shift' ],
    callback: function(event) {
      var monitor = currentMonitor();
      monitor.windowTo(monitor.focused_window, String.fromCharCode(event.keysym));
    }
  },
  {
    key: ['Left', 'Page_Up'], // meta+left and meta+right key for switching workspaces
    callback: function() {
      changeWorkspace(-1);
    }
  },
  {
    key: ['Right', 'Page_Down'], // meta Page up and meta Page down should go through the workspaces
    callback: function() {
      changeWorkspace(1);
    }
  },
  {
    key: 'Return', // enter key launches sakura
    modifier: [ 'shift' ],
    callback: function(event) {
      child_process.spawn('sakura', [], { env: process.env });
    }
  },
  {
    key: 'c', // c key closes the current window
    modifier: [ 'shift' ],
    callback: function(event) {
      var monitor = currentMonitor();
      monitor.focused_window && nwm.wm.killWindow(monitor.focused_window);
    }
  },
  {
    key: 'space', // space switches between layout modes
    callback: function(event) {
      var monitor = currentMonitor();
      var workspace = monitor.currentWorkspace();
      workspace.layout = nwm.nextLayout(workspace.layout);
      // monocle hides windows in the current workspace, so unhide them
      monitor.go(monitor.workspaces.current);
      workspace.rearrange();
    }
  },
  {
    key: ['h', 'F10'], // shrink master area
    callback: function(event) {
      resizeWorkspace(-5);
    }
  },
  {
    key: ['l', 'F11'], // grow master area
    callback: function(event) {
      resizeWorkspace(+5);
    }
  },
  {
    key: 'Tab', // tab makes the current window the main window
    callback: function(event) {
      var monitor = currentMonitor();
      var workspace = monitor.currentWorkspace();
      workspace.mainWindow = monitor.focused_window;
      workspace.rearrange();
    }
  },
  {
    key: 'comma', // moving windows between monitors
    modifier: [ 'shift' ],
    callback: function(event) {
      var monitor = currentMonitor();
      var window = nwm.windows.get(monitor.focused_window);
      if(window) { // empty if no windows
        moveToMonitor(window, monitor, nwm.monitors.next(window.monitor));
      }
    }
  },
  {
    key: 'period', // moving windows between monitors
    modifier: [ 'shift' ],
    callback: function(event) {
      var monitor = currentMonitor();
      var window = nwm.windows.get(monitor.focused_window);
      if(window) { // empty if no windows
        moveToMonitor(window, monitor, nwm.monitors.prev(window.monitor));
      }
    }
  },
  {
    key: 'j', // moving focus
    callback: function() {
      var monitor = currentMonitor();
      if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
        var previous = nwm.windows.prev(monitor.focused_window);
        var window = nwm.windows.get(previous);
        console.log('Current', monitor.focused_window, 'previous', window.id);
        monitor.focused_window = window.id;
        nwm.wm.focusWindow(window.id);
      }
    }
  },
  {
    key: 'k', // moving focus
    callback: function() {
      var monitor = currentMonitor();
      if(monitor.focused_window && nwm.windows.exists(monitor.focused_window)) {
        var next = nwm.windows.next(monitor.focused_window);
        var window = nwm.windows.get(next);
        console.log('Current', monitor.focused_window, 'next', window.id);
        monitor.focused_window = window.id;
        nwm.wm.focusWindow(monitor.focused_window);
      }
    }
  },
  {
    key: 'q', // quit
    modifier: [ 'shift' ],
    callback: function() {
      process.exit();
    }
  }
];

// take each of the keyboard shortcuts above and make add a key using nwm.addKey
keyboard_shortcuts.forEach(function(shortcut) {
  var callback = shortcut.callback;
  var modifier = baseModifier;
  // translate the modifier array to a X11 modifier
  if(shortcut.modifier) {
    (shortcut.modifier.indexOf('shift') > -1) && (modifier = modifier|Xh.ShiftMask);
    (shortcut.modifier.indexOf('ctrl') > -1) && (modifier = modifier|Xh.ControlMask);
  }
  // add shortcuts
  if(Array.isArray(shortcut.key)) {
    shortcut.key.forEach(function(key) {
      nwm.addKey({ key: XK[key], modifier: modifier }, callback);
    });
  } else {
    nwm.addKey({ key: XK[shortcut.key], modifier: modifier }, callback);
  }
});


// /usr/include/X11/XF86keysym.h

var XF86keysym = {
  AudioLowerVolume: 0x1008FF11,   /* Volume control down        */
  AudioMute:  0x1008FF12,   /* Mute sound from the system */
  AudioRaiseVolume: 0x1008FF13   /* Volume control up          */
};

// Experimental volume key support for my thinkpad

nwm.addKey( { key: XF86keysym.AudioLowerVolume, modifier: 0 }, function() {
  child_process.spawn('amixer', ['set', 'Master', '2dB-', 'unmute'], { env: process.env });
});

nwm.addKey( { key: XF86keysym.AudioMute, modifier: 0 }, function() {
  child_process.spawn('amixer', ['set', 'Master', 'toggle'], { env: process.env });
});

nwm.addKey( { key: XF86keysym.AudioRaiseVolume, modifier: 0 }, function() {
  child_process.spawn('amixer', ['set', 'Master', '2dB+', 'unmute'], { env: process.env });
});

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
