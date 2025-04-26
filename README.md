# Alpha-Kappa

## Dependencies

TODO: Add a list of dependencies and/or a nix shell file to create a reproducible environment.

## Installation:
Clone the repository:
```bash
git clone https://github.com/your-username/alpha-kappa.git
cd alpha-kappa
```
Install dependencies:
TODO

## Usage
Start the server in a background process (using Bash or another POSIX shell):
```bash
python3 "$(git rev-parse) --show-toplevel"/server/main.py
```
Then, in another shell, open the frontend in your browser:
```bash
chromium "$(git rev-parse) --show-toplevel"/frontend/index.html & disown
```
