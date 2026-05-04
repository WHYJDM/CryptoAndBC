# Lab 7: Upgradeable ERC20 Token - Deliverables

## Project Structure
```
Lab7Cryp/my-token-project/
├── contracts/
│   ├── ERC20V1.sol      # V1 Implementation
│   └── ERC20V2.sol      # V2 Implementation (adds version())
├── scripts/
│   ├── deploy.js         # Deploy proxy with V1
│   ├── interact.js       # Mint and transfer tokens
│   ├── upgrade.js        # Upgrade proxy to V2
│   └── check-after-upgrade.js  # Verify upgrade
├── test/
│   └── upgrade.test.js  # Automated tests
├── hardhat.config.js
├── package.json
└── proxy-address.txt
```

## Contract Addresses (Localhost)

| Contract | Address |
|----------|---------|
| Proxy | `0x0165878A594ca255338adfa4d48449f69242Eb8F` |
| V1 Implementation | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| V2 Implementation | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |

## Screenshots/Logs

### 1. Token Minting and Transfer on V1 Proxy
See `interact-v1-log.txt`:
```
Token: MyUpgradeableToken MUT
Total Supply: 1000000.0
Owner balance: 1000000.0

Minting 100 tokens to test account...
Test account balance: 100.0

Transferring 50 tokens from test account to owner...
Test account balance after transfer: 50.0
Owner balance after transfer: 1000050.0
```

### 2. Successful Upgrade Transaction
See `upgrade-log.txt`:
```
Upgrading with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Upgrading proxy at: 0x0165878A594ca255338adfa4d48449f69242Eb8F
Proxy upgraded to V2!
V2 Implementation: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### 3. Token Balances After Upgrade
See `after-upgrade-log.txt`:
```
=== After Upgrade ===
Token: MyUpgradeableToken MUT
Total Supply: 1000100.0
Owner balance: 1000050.0
Test account balance: 50.0
```

### 4. Output of version() Function After Upgrade
```
Version: V2
```

## Key Features Demonstrated
1. **ERC20 V1 Contract**: Basic ERC20 with mint functionality
2. **Proxy Contract**: UUPS proxy pattern using OpenZeppelin upgrades
3. **ERC20 V2 Contract**: Adds `version()` function returning "V2"
4. **Storage Preservation**: Balances unchanged after upgrade
5. **Upgradeability**: Successfully upgraded from V1 to V2

## Running the Demo
```bash
# Terminal 1: Start node
npx hardhat node

# Terminal 2: Deploy and test
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/interact.js --network localhost
npx hardhat run scripts/upgrade.js --network localhost
npx hardhat run scripts/check-after-upgrade.js --network localhost
```
