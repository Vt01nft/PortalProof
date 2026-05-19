$ErrorActionPreference = "Stop"

$env:VITE_PORTALDOT_CHAIN_NAME = "Portaldot Local Node"
$env:VITE_PORTALDOT_RPC = "ws://127.0.0.1:9944"

Set-Location "$PSScriptRoot\..\frontend"
npm run dev -- --host 127.0.0.1
