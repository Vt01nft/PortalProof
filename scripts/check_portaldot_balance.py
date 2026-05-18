import sys

from substrateinterface import SubstrateInterface

PORTALDOT_RPC = "wss://mainnet.portaldot.io"
SS58_FORMAT = 42
TOKEN_DECIMALS = 14
TOKEN_SYMBOL = "POT"


def format_pot(plancks: int) -> str:
    amount = plancks / 10**TOKEN_DECIMALS
    return f"{amount:.6f} {TOKEN_SYMBOL}"


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/check_portaldot_balance.py <SS58_ADDRESS>")
        return 1

    address = sys.argv[1]
    portaldot = SubstrateInterface(
        url=PORTALDOT_RPC,
        ss58_format=SS58_FORMAT,
        type_registry_preset="default",
    )

    result = portaldot.query("System", "Account", [address])
    data = result.value["data"]
    total = data["free"] + data["reserved"]

    print(f"Address: {address}")
    print(f"Free: {format_pot(data['free'])}")
    print(f"Reserved: {format_pot(data['reserved'])}")
    print(f"Total: {format_pot(total)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
