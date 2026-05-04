# Lab 7: Explorer Links, Screenshots and Logs

## Адреса контрактов (Localhost)

| Контракт | Адрес |
|----------|-------|
| **Proxy** | `0x0165878A594ca255338adfa4d48449f69242Eb8F` |
| **V1 Implementation** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| **V2 Implementation** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |

## 1. Token Minting and Transfer on V1 Proxy

### Лог выполнения (interact-v1-log.txt):
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

### Скриншот (как это выглядит в консоли):
```
PS C:\Users\gg\CryptoAndBC\Lab7Cryp\my-token-project> npx hardhat run scripts/interact.js --network localhost

Token: MyUpgradeableToken MUT
Total Supply: 1000000.0
Owner balance: 1000000.0

Minting 100 tokens to test account...
Test account balance: 100.0

Transferring 50 tokens from test account to owner...
Test account balance after transfer: 50.0
Owner balance after transfer: 1000050.0
```

## 2. Successful Upgrade Transaction

### Лог выполнения (upgrade-log.txt):
```
Upgrading with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Upgrading proxy at: 0x0165878A594ca255338adfa4d48449f69242Eb8F
Proxy upgraded to V2!
V2 Implementation: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### Транзакция апгрейда (пример для Etherscan):
Если бы мы использовали тестовую сеть (Sepolia), ссылка выглядела бы так:
`https://sepolia.etherscan.io/tx/0x...` (хеш транзакции апгрейда)

## 3. Token Balances After Upgrade

### Лог выполнения (after-upgrade-log.txt):
```
=== After Upgrade ===
Token: MyUpgradeableToken MUT
Total Supply: 1000100.0
Owner balance: 1000050.0
Test account balance: 50.0
```

### Проверка балансов (сохранены после апгрейда):
- **Total Supply**: 1,000,100 MUT
- **Owner (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)**: 1,000,050 MUT
- **Test Account (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)**: 50 MUT

## 4. Output of version() Function After Upgrade

### Лог выполнения (after-upgrade-log.txt):
```
Version: V2
```

### Вызов version() через прокси:
```javascript
const token = ERC20V2.attach(proxyAddress);
console.log(await token.version()); // Вывод: "V2"
```

## Как получить Explorer Links (для тестовой сети)

Если развернуть в тестовой сети (например, Sepolia), шаги такие:

1. **Получить API ключ Etherscan**: https://etherscan.io/apis
2. **Добавить в hardhat.config.js**:
```javascript
etherscan: {
  apiKey: "YOUR_ETHERSCAN_API_KEY"
}
```
3. **Деплой в Sepolia**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```
4. **Верификация контрактов**:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```
5. **Ссылки на Etherscan** будут вида:
   - Proxy: `https://sepolia.etherscan.io/address/0x...`
   - Implementation V1: `https://sepolia.etherscan.io/address/0x...`
   - Implementation V2: `https://sepolia.etherscan.io/address/0x...`

## Скриншоты (инструкция)

Для создания скриншотов выполните следующие шаги:

1. **Запустите Hardhat node** (Terminal 1):
   ```bash
   cd Lab7Cryp/my-token-project
   npx hardhat node
   ```

2. **Выполните скрипты** (Terminal 2), делая скриншоты вывода:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   npx hardhat run scripts/interact.js --network localhost
   npx hardhat run scripts/upgrade.js --network localhost
   npx hardhat run scripts/check-after-upgrade.js --network localhost
   ```

3. **Сделайте скриншоты** каждого вывода в терминале.

4. **Для просмотра транзакций** в локальном ноде можно использовать:
   - Hardhat Console: `npx hardhat console --network localhost`
   - Или посмотреть логи ноды в Terminal 1

## Полные логи деплоя

### deploy-log.txt
```
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Proxy deployed to: 0x0165878A594ca255338adfa4d48449f69242Eb8F
V1 Implementation: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### interact-v1-log.txt
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

### upgrade-log.txt
```
Upgrading with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Upgrading proxy at: 0x0165878A594ca255338adfa4d48449f69242Eb8F
Proxy upgraded to V2!
V2 Implementation: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### after-upgrade-log.txt
```
=== After Upgrade ===
Token: MyUpgradeableToken MUT
Total Supply: 1000100.0
Owner balance: 1000050.0
Test account balance: 50.0

Version: V2
```
