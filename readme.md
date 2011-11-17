# My nwm config

This is what I use for my nwm.

Customizations:

- My default layout is switched based on the number of windows on screen:
    1 window = fullscreen
    2 windows = DWM's tiling
    3 windows = DWM's tiling
    4 windows = Fair grid
    5 = tile, 6 = grid
    ... and so on
- I have 19 workspaces per screen (Meta + F1 .. F9 are mapped to another 9 workspaces).
- Meta + Left / Meta + Right and Meta + PgDown / Meta + PgUp switch between workspaces (up / down)

Todo / experiments todo:

- Full screen detection / flash support
- Write a more tmux-style grid layout (e.g. adaptive slicing)
- Add support for "execute or find by window class" keyboard shortcuts (e.g. for chrome and pcmanfm)
- Add support for permanent window decoration, like Conky or another panel
- Add support for desktop widgets
- Start window always on a particular screen
    - This would probably benefit from a HTTP interface to configure and examine nwm
- Write a light compositing desktop background updater
    -  Would make it possible to do cool composited things like taking a time and overlaying another mask like in http://www.flickr.com/photos/haiiro/5356014236/
- Media key bindings (JS, to nplay):
    - Win + Z X C V B



## Installing

    # NWM
    git clone git://github.com/mixu/nwm.git
    cd nwm
    node-waf clean || true && node-waf configure build
    sudo npm link # add a global npm symlink to this repository - so nwm-user can find it (man npm link)
    
    # NWM-user
    cd ..
    git clone git://github.com/mixu/nwm-user.git
    cd nwm-user
    npm link nwm # now make a symlink to the nwm installation

And then do whatever is needed to make your login manager start nwm-user.js

## Keyboard shortcuts

As a long time dwm user, I'm used to the following keyboard shortcuts:

    # Launching programs
    Meta + Shift + Enter -- Start xterm

    # Layouts
    Meta + space -- Alternates between layouts

    # Focus
    Meta + j -- Focus next window
    Meta + k -- Focus previous window

    # Main window
    Meta + h -- Decrease master area size
    Meta + F10
    Meta + l -- Increase master area size
    Meta + F11
    Meta + Tab -- Sets currently focused window as main window

    # Closing window
    Meta + Shift + c -- Close focused window

    # Workspaces
    Meta + [1..n] -- Switch to workspace n
    Meta + Shift + [1..n] -- Move window to workspace n


    # Multi-monitor keys
    Meta + Shift + , -- Send focused window to previous screen
    Meta + Shift + . -- Send focused window to next screen




