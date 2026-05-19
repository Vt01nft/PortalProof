import argparse
import os
from pathlib import Path

from substrateinterface import Keypair, SubstrateInterface
from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface.exceptions import ExtrinsicFailedException

PORTALDOT_RPC = os.environ.get("PORTALDOT_RPC", "ws://127.0.0.1:9944")
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
        type_registry_preset="substrate-node-template",
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
            substrate=portaldot,
        )
        print(f"Attached to PortalProof @ {contract.contract_address}")
        return 0

    code = ContractCode.create_from_contract_files(
        metadata_file=str(metadata_file),
        wasm_file=str(wasm_file),
        substrate=portaldot,
    )

    print(f"Deploying from {keypair.ss58_address}...")

    constructor_data = code.metadata.generate_constructor_data(name="new", args={})
    call_args = portaldot.get_metadata_call_function(
        "Contracts", "instantiate_with_code"
    )["args"]
    call_arg_names = {str(arg["name"]) for arg in call_args}

    if "endowment" in call_arg_names:
        call_params = {
            "endowment": 0,
            "gas_limit": args.gas_ref_time,
            "code": f"0x{code.wasm_bytes.hex()}",
            "data": constructor_data.to_hex(),
            "salt": "",
        }
    else:
        call_params = {
            "value": 0,
            "gas_limit": {
                "ref_time": args.gas_ref_time,
                "proof_size": args.gas_proof_size,
            },
            "storage_deposit_limit": None,
            "code": f"0x{code.wasm_bytes.hex()}",
            "data": constructor_data.to_hex(),
            "salt": "",
        }

    call = portaldot.compose_call(
        call_module="Contracts",
        call_function="instantiate_with_code",
        call_params=call_params,
    )
    extrinsic = portaldot.create_signed_extrinsic(
        call=call,
        keypair=keypair,
        era={"period": 64},
    )
    receipt = portaldot.submit_extrinsic(extrinsic, wait_for_inclusion=True)

    if not receipt.is_success:
        raise ExtrinsicFailedException(receipt.error_message)

    contract_address = None
    for event in receipt.triggered_events:
        if getattr(event, "event", None) and event.event.name == "Instantiated":
            contract_address = event.params[1]["value"]
            break
        value = getattr(event, "value", {})
        event_data = value.get("event", {}) if isinstance(value, dict) else {}
        if event_data.get("event_id") == "Instantiated":
            contract_address = event_data["attributes"]["contract"]
            break

    if not contract_address:
        raise SystemExit("Deployment succeeded but no Instantiated event was found.")

    print(f"Deployed PortalProof @ {contract_address}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
