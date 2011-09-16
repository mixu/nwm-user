# My nwm config

Would you like to install nwm with your own customized configuration files (and npm etc. dependencies)? 

Fork this repo. It's got a decent starting point, including a package.json for fetching nwm.

## Installing

    git clone ...
    npm install

And then do whatever is needed to make your login manager execute nwm.sh.

You might also need to adjust nwm.sh, as GDM seems to dislike relative paths...

## Keyboard shortcuts

As a long time dwm user, I'm used to the following keyboard shortcuts:

    # Launching programs
    Meta + Shift + Enter -- Start xterm

    # Layouts
    Meta + t -- Sets tiled layout
    Meta + w -- Sets wide layout
    Meta + m -- Sets monocle layout
    Meta + space -- Alternates between layouts

    # Focus
    TODO Meta + j -- Focus next window
    TODO Meta + k -- Focus previous window

    # Main window
    Meta + h -- Decrease master area size
    Meta + l -- Increase master area size
    Meta + Enter -- Sets currently focused window as main window

    # Closing window
    Meta + Shift + c -- Close focused window

    # Workspaces
    Meta + [1..n] -- Switch to workspace n
    Meta + Shift + [1..n] -- Move window to workspace n


    # Multi-monitor keys
    Meta + Shift + , -- Send focused window to previous screen
    Meta + Shift + . -- Send focused window to next screen

# Todo

- Meta + F1 ... F10 to second set of workspaces
- Media key bindings (JS)
- Dropdown Chrome (JS)
- Key bindings:

    Meta + , -- Focus previous screen
    Meta + . -- Focus next screen

## Other custom stuff

I launch a couple of programs on startup:

- guake -- the dropdown console (needs xfce4-notifyd)
- google-chrome

