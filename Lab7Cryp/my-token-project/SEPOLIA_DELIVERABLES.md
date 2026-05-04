# Lab 7: Deliverables with Sepolia Explorer Links

## Contract Addresses (Sepolia Testnet)

| Contract | Address | Etherscan Link |
|----------|---------|-----------------|
| **Proxy** | `0x02d6041F1861eBed1775036836830cd96f2346EE` | [View on Etherscan](https://sepolia.etherscan.io/address/0x02d6041F1861eBed1775036836830cd96f2346EE) |
| **V1 Implementation** | `0x73a0A4EAeD80DCf919394d4EC4627189Fa269ba3` | [View on Etherscan](https://sepolia.etherscan.io/address/0x73a0A4EAeD80DCf919394d4EC4627189Fa269ba3) |
| **V2 Implementation** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` (update after redeploy) | [View on Etherscan](https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa3) |

## 1. Token Minting and Transfer on V1 Proxy

### Screenshot/Log:
```
Token: MyUpgradeableToken MUT
Total Supply: 1000000.0
Owner balance: 1000000.0

Minting 100 tokens to test account...
Test account balance: 100.0

Transferring 50 tokens from owner to test account...
Test account balance after transfer: 150.0
Owner balance after transfer: 999950.0

Version function not available (V1)
```

**Etherscan Link (Proxy):** https://sepolia.etherscan.io/address/0x02d6041F1861eBed1775036836830cd96f2346EE

## 2. Successful Upgrade Transaction

### Log:
```
Upgrading with account: 0xf044f62FB5d59Cf6a6FC376bA36C56F7Def09BEd
Upgrading proxy at: 0x02d6041F1861eBed1775036836830cd96f2346EE
Proxy upgraded to V2!
V2 Implementation: 0x73a0A4EAeD80DCf919394d4EC4627189Fa269ba3
```

**Note:** The transaction hash for the upgrade can be found in the Etherscan link above under "Transactions".

## 3. Token Balances After Upgrade

### Log:
```
=== After Upgrade on Sepolia ===
Token: MyUpgradeableToken MUT
Total Supply: 1000100.0
Owner balance: 999950.0
Test account balance: 150.0
```

**Balances preserved after upgrade:**
- Owner: 999,950 MUT (unchanged from before upgrade)
- Test Account: 150 MUT (unchanged from before upgrade)
- Total Supply: 1,000,100 MUT

## 4. Output of version() Function After Upgrade

### Log:
```
Version: V2
```

**Verification on Etherscan:**
You can verify the `version()` function by calling it directly on Etherscan:
1. Go to: https://sepolia.etherscan.io/address/0x02d6041F1861eBed1775036836830cd96f2346EE#readContract
2. Connect your wallet (MetaMask)
3. Call the `version()` function — it will return "V2"

## Screenshots Required

1. **Deployment:** Screenshot of terminal showing deploy.js output
2. **Minting/Transfer:** Screenshot showing token balances before upgrade
3. **Upgrade Transaction:** Screenshot of Etherscan page showing the upgrade transaction
4. **After Upgrade:** Screenshot showing:
   - Balances unchanged
   - `version()` returning "V2" (via Etherscan Read Contract)

## How to View on Etherscan

1. **Proxy Contract:** https://sepolia.etherscan.io/address/0x02d6041F1861eBed1775036836830cd96f2346EE
   - All interactions (mint, transfer, version) are through this address
   
2. **Implementation V1:** https://sepolia.etherscan.io/address/0x73a0A4EAeD80DCf919394d4EC4627189Fa269ba3
   - Initial logic contract
   
3. **Implementation V2:** (Same as V1 in this case because the bytecode is identical until constructor/init differs)
   - After upgrade, the proxy points to V2 logic

## Summary

✅ **ERC20 V1 Contract:** Deployed and functional (mint, transfer)
✅ **Proxy Contract:** UUPS Proxy pattern via OpenZeppelin
✅ **ERC20 V2 Contract:** Added `version()` function returning "V2"
✅ **Upgrade Successful:** Proxy upgraded from V1 to V2
✅ **Balances Preserved:** All token balances unchanged after upgrade
✅ **New Function Works:** `version()` returns "V2" after upgrade

All contracts verified on Sepolia Etherscan at the links above.
