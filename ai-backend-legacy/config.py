import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
BASE_RPC_URL = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")
VAULT_FACTORY_ADDRESS = os.getenv("VAULT_FACTORY_ADDRESS", "0x8374257da04F00ABAf74E13EFE5A17B0f08EC226")
VULT_HOOK_ADDRESS = os.getenv("VULT_HOOK_ADDRESS", "0xe988b6816d94C10377779F08f2ab08925cE96D09")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Chainlink Price Feed addresses on Base Mainnet
PRICE_FEEDS = {
    "ETH/USD": "0x71041dddad3595F745215C98a901844ED99Db595",
    "USDC/USD": "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
}

# Known protocol addresses
PROTOCOLS = {
    "aave": {"name": "Aave V3", "type": "lending"},
    "compound": {"name": "Compound V2", "type": "lending"},
    "uniswap": {"name": "Uniswap V4", "type": "dex"},
}
