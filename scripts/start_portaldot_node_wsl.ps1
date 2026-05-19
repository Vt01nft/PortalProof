param(
  [string]$Distro = "UbuntuPortalProof",
  [string]$Name = "Vt01nft"
)

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
$logDir = "C:\PortalProof\.local"
$logFile = Join-Path $logDir "portaldot-node.err.log"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$wslLogFile = "/mnt/c/PortalProof/.local/portaldot-node.err.log"
$command = "cd $wslPath && chmod 755 ./portaldot_dev && ./portaldot_dev --dev --alice --name '${Name}-alice' --base-path /tmp/portalproof-alice > '$wslLogFile' 2>&1"

Start-Process -WindowStyle Hidden -FilePath "wsl.exe" -ArgumentList "-d $Distro --cd ~ --exec bash -lc `"$command`""
Write-Host "Portaldot Alice node starting with name '${Name}-alice'."
Write-Host "Log: $logFile"
