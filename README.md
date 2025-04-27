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
