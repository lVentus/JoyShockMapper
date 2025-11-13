# JoyShockMapper Console Injector

A small helper executable that attaches to the running JoyShockMapper console and
injects a command (e.g. `keymap_01.txt`) as if the user had typed it manually.

## Building

```
cd JSM_GUI/jsm-gui-app/native/console-injector
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

Copy the resulting `build/Release/jsm-console-injector.exe` into
`JSM_GUI/jsm-gui-app/bin/` so the Electron main process can spawn it.
