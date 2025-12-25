from fastapi import FastAPI, HTTPException
from web3 import Web3
import json

app = FastAPI(title="Organic Traceability API")

# 1. Setup Connection
W3_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(W3_URL))

# 2. Load Contract
raw_address = "0x5fbdb2315678afecb367f032d93f642f64180aa3" # Example address
CONTRACT_ADDRESS = w3.to_checksum_address(raw_address)# Change this!
with open("OrganicTraceability.json", "r") as f:
    abi = json.load(f)["abi"]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

# 3. Read Endpoint (For QR Scanning)
@app.get("/product/{product_id}")
async def get_product(product_id: int):
    try:
        details = contract.functions.getProductDetails(product_id).call()
        return {
            "id": details[0],
            "name": details[1],
            "owner": details[2],
            "status": details[3], # Returns 0, 1, 2... based on Enum
            "isOrganic": details[4],
            "timestamp": details[5]
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Product not found on chain")

# 4. Write Endpoint (For Producers)
@app.post("/register")
async def register_product(name: str, metadata_uri: str, private_key: str):
    try:
        account = w3.eth.account.from_key(private_key)
        
        # Build transaction
        tx = contract.functions.registerProduct(name, metadata_uri).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 2000000,
            'gasPrice': w3.to_wei('50', 'gwei')
        })
        
        # Sign and send
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        return {"transaction_hash": tx_hash.hex()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))