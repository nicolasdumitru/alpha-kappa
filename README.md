# Alpha-Kappa

## Dependencies
 - All project dependencies and their versions are managed via Nix flake files.
 - Install [Nix](https://nixos.org/) with flakes enabled (see their docs).
 - Install [just](https://github.com/casey/just) (see their docs).

## Usage
All commands assume your shell’s working directory is the root of the project.

Enter the development environment:
```bash
just develop
```

Start the server in the development environment shell:
```bash
python3 server/main.py
```
Then, in another shell, open the frontend in your browser:
```bash
chromium frontend/index.html & disown
```

## Create the executable
(If you don't have pyinstaller, run pip install pyinstaller)
In a terminal, go to the alpha-kappa and run the following commands, choose the one for your OS.
This will create build, dist directories and main.spec inside the root directory. The executable
is inside dist. You can take it from there and move it anywhere you want, share it, anything.
If you build the executable on Windows, then the app will only run in Windows. Same goes for Linux.

### Windows
```
pyinstaller --onefile --clean ^
--name Electroliti ^
--icon=frontend/images/icon_logo.ico ^
--add-data "frontend;frontend" ^
--add-data "server/electrolyte.py;server" ^
--hidden-import scipy.stats ^
--hidden-import scipy.sparse ^
--hidden-import scipy._lib ^
--hidden-import scipy._lib.array_api_compat ^
--hidden-import scipy._lib.array_api_compat.numpy.fft ^
server/main.py
```

### On Linux
```
pyinstaller --onefile --clean \
--name Electroliti \
--icon=frontend/images/icon_logo.png /
--add-data "frontend:frontend" \
--add-data "server/electrolyte.py:server" \
--hidden-import scipy.stats \
--hidden-import scipy.sparse \
--hidden-import scipy._lib \
--hidden-import scipy._lib.array_api_compat \
--hidden-import scipy._lib.array_api_compat.numpy.fft \
server/main.py
```
