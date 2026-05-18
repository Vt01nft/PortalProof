import argparse
import os
from pathlib import Path

from substrateinterface import Keypair, SubstrateInterface
from substrateinterface.contracts import ContractCode, ContractInstance

PORTALDOT_RPC = "wss://mainnet.portaldot.io"
SS58_FORMAT = 42


def get_keypair() -> Keypair:
    uri = os.environ.get("PORTALPROOF_DEPLOYER_URI")
    if not uri:
        raise SystemExit(
            "Set PORTALPROOF_DEPLOYER_URI to a local secret URI before deploying. "
            "Never commit or share this value."
        )

    return Keypair.create_from_uri(uri, ss58_format=SS58_FORMAT)


def get_portaldot() -> SubstrateInterface:
    return SubstrateInterface(
        url=PORTALDOT_RPC,
        ss58_format=SS58_FORMAT,
        type_registry_preset="default",
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Deploy or attach to the PortalProof ink! contract on Portaldot."
    )
    parser.add_argument("--metadata", required=True, help="Path to portal_proof.json")
    parser.add_argument("--wasm", required=True, help="Path to portal_proof.wasm")
    parser.add_argument(
        "--address",
        help="Existing contract address. If omitted, the script uploads and deploys.",
    )
    parser.add_argument(
        "--gas-ref-time",
        type=int,
        default=25_990_000_000,
        help="Deployment gas ref_time.",
    )
    parser.add_argument(
        "--gas-proof-size",
        type=int,
        default=11_990_383_647_911_208_550,
        help="Deployment gas proof_size.",
    )
    args = parser.parse_args()

    metadata_file = Path(args.metadata).resolve()
    wasm_file = Path(args.wasm).resolve()

    if not metadata_file.exists():
        raise SystemExit(f"Metadata file not found: {metadata_file}")
    if not wasm_file.exists():
        raise SystemExit(f"WASM file not found: {wasm_file}")

    portaldot = get_portaldot()
    keypair = get_keypair()

    if args.address:
        contract_info = portaldot.query("Contracts", "ContractInfoOf", [args.address])
        if not contract_info.value:
            raise SystemExit(f"No contract found on-chain at {args.address}")

        contract = ContractInstance.create_from_address(
            contract_address=args.address,
            metadata_file=str(metadata_file),
            portaldot=portaldot,
        )
        print(f"Attached to PortalProof @ {contract.contract_address}")
        return 0

    code = ContractCode.create_from_contract_files(
        metadata_file=str(metadata_file),
        wasm_file=str(wasm_file),
        portaldot=portaldot,
    )

    print(f"Deploying from {keypair.ss58_address}...")
    contract = code.deploy(
        keypair=keypair,
        constructor="new",
        args={},
        value=0,
        gas_limit={
            "ref_time": args.gas_ref_time,
            "proof_size": args.gas_proof_size,
        },
        upload_code=True,
    )

    print(f"Deployed PortalProof @ {contract.contract_address}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
