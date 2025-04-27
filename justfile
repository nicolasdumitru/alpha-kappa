# The default recipe is always the first recipe in the justfile

# The recipe to run when just is invoked without a recipe
default: list

# List available recipes
list:
    @just --list

# Enter a development shell
develop shell='bash':
    nix develop --command '{{shell}}'
alias dev := develop

# Update the lockfile and commit it
update:
    nix flake update --commit-lock-file
