# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
        # Tambahkan paket postgresql untuk menyediakan library client-nya (libpq)
    pkgs.postgresql
    pkgs.docker
    pkgs.docker-compose
  ];

  # Aktifkan layanan Docker
  services.docker.enable = true;

  # (Opsional) Secara otomatis menjalankan docker-compose saat workspace dimulai
  #processes.docker-up.exec = "docker-compose up -d";
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
      };
      # Runs when a workspace is (re)started
      onStart= {
        run-server = "pnpm start";
      };
    };
  };
}