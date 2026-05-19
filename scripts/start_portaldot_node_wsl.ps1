$ErrorActionPreference = "Stop"

$nodeDir = "C:\PortalProof\vendor\portaldot-node"
$nodeBin = Join-Path $nodeDir "portaldot_dev"

if (!(Test-Path $nodeBin)) {
  $archive = "C:\PortalProof\vendor\portaldot-testnet-ubuntu.tar.gz"
  if (!(Test-Path $archive)) {
    throw "Portaldot node archive not found at $archive"
  }

  New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null
  tar -xzf $archive -C $nodeDir --strip-components=1
}

$wslPath = "/mnt/c/PortalProof/vendor/portaldot-node"
$command = "cd $wslPath && chmod 755 ./portaldot_dev && ./portaldot_dev --dev --alice"

Start-Process -FilePath "wsl.exe" -ArgumentList "--cd", "~", "--exec", "bash", "-lc", $command
