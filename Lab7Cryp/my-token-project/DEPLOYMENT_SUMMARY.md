# Lab 7: Upgradeable ERC20 Token with Proxy Pattern

## Contract Addresses (Localhost)

- **Proxy Contract**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **V1 Implementation**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **V2 Implementation**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## Deployment Steps

1. Install dependencies:
   ```bash
   cd Lab7Cryp/my-token-project
   npm install --legacy-peer-deps
   ```

2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

3. Start local Hardhat node (in separate terminal):
   ```bash
   npx hardhat node
   ```

4. Deploy proxy with V1:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. Interact with V1 (mint and transfer):
   ```bash
   npx hardhat run scripts/interact.js --network localhost
   ```

6. Upgrade to V2:
   ```bash
   npx hardhat run scripts/upgrade.js --network localhost
   ```

7. Verify upgrade:
   ```bash
   npx hardhat run scripts/check-after-upgrade.js --network localhost
   ```

## Verification Results

### V1 Functionality (Before Upgrade)
- Token minting: 100 tokens minted to test account
- Token transfer: 50 tokens transferred from test to owner
- Owner balance after: 1,000,050 MUT
- Test account balance: 50 MUT

### After Upgrade to V2
- Total Supply: 1,000,100 MUT
- Owner balance: 1,000,050 MUT (unchanged)
- Test account balance: 50 MUT (unchanged)
- Version function returns: "V2"

## Key Features Demonstrated
1. UUPS Proxy Pattern implementation
2. Contract upgradeability while preserving state
3. Storage layout compatibility between V1 and V2
4. Adding new functions (version()) in V2
