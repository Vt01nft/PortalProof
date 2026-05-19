import argparse
import os

from substrateinterface import Keypair, SubstrateInterface
from substrateinterface.exceptions import SubstrateRequestException

PORTALDOT_RPC = os.environ.get("PORTALDOT_RPC", "ws://127.0.0.1:9944")
SS58_FORMAT = 42
TOKEN_DECIMALS = 14
DEFAULT_AMOUNT = 100 * 10**TOKEN_DECIMALS


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fund an account from //Alice on a local Portaldot dev node."
    )
    parser.add_argument("address", help="Recipient SS58 address")
    parser.add_argument(
        "--amount",
        type=float,
        default=100.0,
        help="Amount of local POT to transfer from //Alice.",
    )
    args = parser.parse_args()

    portaldot = SubstrateInterface(
        url=PORTALDOT_RPC,
        ss58_format=SS58_FORMAT,
        type_registry_preset="substrate-node-template",
    )
    alice = Keypair.create_from_uri("//Alice", ss58_format=SS58_FORMAT)
    value = int(args.amount * 10**TOKEN_DECIMALS)

    call = portaldot.compose_call(
        call_module="Balances",
        call_function="transfer_keep_alive",
        call_params={
            "dest": args.address,
            "value": value,
        },
    )
    extrinsic = portaldot.create_signed_extrinsic(
        call=call,
        keypair=alice,
        era={"period": 64},
    )

    print(f"Funding {args.address} with {args.amount:g} local POT from //Alice...")

    try:
        receipt = portaldot.submit_extrinsic(extrinsic, wait_for_inclusion=True)
    except SubstrateRequestException as error:
        raise SystemExit(f"Failed to submit transfer: {error}") from error

    if not receipt.is_success:
        raise SystemExit(f"Transfer failed: {receipt.error_message}")

    print(f"Included in block: {receipt.block_hash}")
    print(f"Extrinsic hash: {receipt.extrinsic_hash}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
