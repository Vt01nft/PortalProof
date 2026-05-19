param(
  [string]$Distro = "UbuntuPortalProof",
  [string]$Name = "Vt01nft"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $repoRoot "vendor\portaldot-node"
$nodeBin = Join-Path $nodeDir "portaldot_dev"
$logDir = Join-Path $repoRoot ".local"
$aliceLog = Join-Path $logDir "portaldot-alice.log"
$bobLog = Join-Path $logDir "portaldot-bob.log"

if (!(Test-Path $nodeBin)) {
  $archive = Join-Path $repoRoot "vendor\portaldot-testnet-ubuntu.tar.gz"
  if (!(Test-Path $archive)) {
    throw "Portaldot node archive not found at $archive"
  }

  New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null
  tar -xzf $archive -C $nodeDir --strip-components=1
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Remove-Item -LiteralPath $aliceLog, $bobLog -Force -ErrorAction SilentlyContinue

$wslPath = "/mnt/c/$($nodeDir.Substring(3).Replace('\', '/'))"
$wslAliceLog = "/mnt/c/$($aliceLog.Substring(3).Replace('\', '/'))"
$wslBobLog = "/mnt/c/$($bobLog.Substring(3).Replace('\', '/'))"

wsl.exe -d $Distro --exec bash -lc "pkill portaldot_dev || true; rm -rf /tmp/portalproof-alice /tmp/portalproof-bob"

$aliceCommand = "cd '$wslPath' && chmod 755 ./portaldot_dev && ./portaldot_dev --dev --alice --name '${Name}-alice' --base-path /tmp/portalproof-alice > '$wslAliceLog' 2>&1"
Start-Process -WindowStyle Hidden -FilePath "wsl.exe" -ArgumentList "-d $Distro --exec bash -lc `"$aliceCommand`""

$peerId = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  if (Test-Path $aliceLog) {
    $match = Select-String -Path $aliceLog -Pattern "12D3Koo[0-9A-Za-z]+" | Select-Object -First 1
    if ($match) {
      $peerId = $match.Matches[0].Value
      break
    }
  }
}

if (!$peerId) {
  throw "Alice started, but no peer ID was found in $aliceLog"
}

$alicePeer = "/ip4/127.0.0.1/tcp/30333/p2p/$peerId"
$bobCommand = "cd '$wslPath' && ./portaldot_dev --dev --bob --name '${Name}-bob' --base-path /tmp/portalproof-bob --port 30334 --rpc-port 9945 --ws-port 9945 --prometheus-port 9616 --bootnodes $alicePeer --reserved-nodes $alicePeer > '$wslBobLog' 2>&1"
Start-Process -WindowStyle Hidden -FilePath "wsl.exe" -ArgumentList "-d $Distro --exec bash -lc `"$bobCommand`""

Write-Host "Alice started: $aliceLog"
Write-Host "Bob started:   $bobLog"
Write-Host "Alice peer ID: $peerId"
Write-Host "Wait ~30 seconds, then check Bob for 'Idle (1 peers)':"
Write-Host "Get-Content -Tail 80 $bobLog"
