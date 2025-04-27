{
  description = "Development environment for Alpha-Kappa";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; # You can pin a specific revision if needed
  };

  outputs =
    {
      self,
      nixpkgs,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

    in
    {
      devShell."${system}" = pkgs.mkShell {
        packages = with pkgs; [
          (python3.withPackages (
            ps: with ps; [
              numpy
              scipy
              matplotlib

              flask
              flask-cors

              # python-lsp-server
            ]
          ))
          # jetbrains.pycharm-professional
          # pyright
          black
        ];
      };
    };
}
