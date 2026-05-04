# Lab 8: Multi-Signature Wallet!

## Overview!
This project implements a multi-signature wallet smart contract in Solidity. The wallet requires multiple owners to confirm transactions before execution, enhancing security for decentralized applications.

## Features!
- **Multiple Owners**: Contract is owned by multiple addresses!
- **Confirmation Threshold**: Configurable number of required confirmations (e.g., 2-of-3)!
- **Transaction Lifecycle**:
  - Submit: Owners can propose transactions (Ether transfers or arbitrary data)!
  - Confirm: Owners confirm pending transactions!
  - Execute: Transaction executes automatically when confirmation threshold is met!
  - Revoke: Owners can revoke their confirmation before execution!
- **Event Logging**: All key actions emit events (`SubmitTransaction`, `ConfirmTransaction`, `ExecuteTransaction`, `RevokeConfirmation`, `Deposit`)!
- **Security**: Uses checks-effects-interactions pattern, proper access control!

## Contract Details!

### MultiSigWallet.sol!
Location: `contracts/MultiSigWallet.sol`!

**Key Data Structures:**
- `owners`: Array of owner addresses!
- `isOwner`: Mapping to check if an address is an owner!
- `numConfirmationsRequired`: Minimum confirmations needed!
- `Transaction`: Struct containing `to`, `value`, `data`, `executed`, `numConfirmations`!
- `transactions`: Array of all submitted transactions!
- `isConfirmed`: Nested mapping tracking which owner confirmed which transaction!

**Functions:**
- `constructor(_owners, _numConfirmationsRequired)`: Initializes wallet with owners and threshold!
- `submitTransaction(_to, _value, _data)`: Submit a new transaction (only owner)!
- `confirmTransaction(_txIndex)`: Confirm a pending transaction (only owner)!
- `executeTransaction(_txIndex)`: Execute transaction if threshold met (only owner)!
- `revokeConfirmation(_txIndex)`: Revoke confirmation before execution (only owner)!
- `getOwners()`: Returns array of owners!
- `getTransactionCount()`: Returns number of submitted transactions!
- `getTransaction(_txIndex)`: Returns transaction details!

**Modifiers:**
- `onlyOwner`: Restricts access to owners only!
- `txExists`: Checks transaction exists!
- `notExecuted`: Checks transaction not yet executed!
- `notConfirmed`: Checks owner hasn't already confirmed!

## Deployment!

### Prerequisites!
- Node.js installed!
- Hardhat installed globally or locally!

### Steps!
1. Install dependencies:!
   ```bash!
   cd Lab8Cryp/my-multisig-project!
   npm install --legacy-peer-deps!
   ```

2. Compile contracts:!
   ```bash!
   npx hardhat compile!
   ```

3. Start local Hardhat node (new terminal):!
   ```bash!
   npx hardhat node!
   ```

4. Deploy to localhost:!
   ```bash!
   npx hardhat run scripts/deploy.js --network localhost!
   ```

## Testing!

### Run tests:!
```bash!
npx hardhat test!
```

### Test Coverage!
- ✅ Contract deployment with correct owners and threshold!
- ✅ Transaction submission by owners only!
- ✅ Transaction confirmation by multiple owners!
- ✅ Transaction execution after threshold reached!
- ✅ Confirmation revocation before execution!
- ✅ Ether deposits and `Deposit` event!
- ✅ Access control (only owners can submit/confirm/revoke)!
- ✅ Edge cases (duplicate confirmation, already executed, etc.)!

## Security Considerations!

1. **Checks-Effects-Interactions Pattern**: State changes before external calls in `executeTransaction`!
2. **Reentrancy Protection**: Single external call per transaction execution!
3. **Access Control**: All sensitive functions restricted to owners via `onlyOwner` modifier!
4. **Transaction Validity**: Modifiers ensure transactions exist, are not executed, and not duplicate-confirmed!
5. **Ether Handling**: Contract accepts Ether via `receive()` function with event logging!

## Comparison with Gnosis Safe!

| Feature | Our MultiSig | Gnosis Safe |
|---------|----------------|--------------|
| Owners | ✅ Dynamic array | ✅ Dynamic |
| Confirmation Threshold | ✅ Configurable | ✅ Configurable |
| Ether Transfers | ✅ Supported | ✅ Supported |
| Token Support | ✅ Via `data` field | ✅ Native support |
| Upgradeability | ❌ Not included | ✅ Modular |
| Off-chain signing | ❌ Not included | ✅ Supported |
| Gas optimizations | ⚠️ Basic | ✅ Highly optimized |

## Conclusion!

Multi-signature wallets are critical for:!
- **DAO Treasuries**: Secure management of organizational funds!
- **Escrow Services**: Multi-party transaction approval!
- **Personal Security**: Requiring multiple devices/keys to spend funds!
- **DeFi Protocols**: Governance and admin function control!

This implementation demonstrates core multi-sig functionality while maintaining simplicity and security best practices.
