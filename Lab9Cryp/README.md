# Lab9Cryp: ERC-721 Soulbound Visit Card и ERC-1155 Game Characters

В этой лабораторной работе реализованы два отдельных NFT-контракта:

- `SoulboundVisitCardERC721.sol` - ERC-721 soulbound NFT-визитка студента.
- `GameCharacterCollectionERC1155.sol` - ERC-1155 коллекция из 10 игровых персонажей.

Контракты написаны на Solidity `0.8.24` и используют OpenZeppelin.

## Что сдавать

В отчёт или архив с работой нужно приложить:

1. Папку `Lab9Cryp` с исходным кодом.
2. Два Solidity-контракта:
   - `contracts/SoulboundVisitCardERC721.sol`
   - `contracts/GameCharacterCollectionERC1155.sol`
3. Скрипт деплоя:
   - `scripts/deploy.js`
4. README-файл с инструкцией:
   - `README.md`
5. Примеры metadata:
   - `metadata/visit-card-student.json`
   - `metadata/game-character-1.json` ... `metadata/game-character-10.json`
6. Доказательство работы:
   - transaction hash деплоя `SoulboundVisitCardERC721`
   - transaction hash деплоя `GameCharacterCollectionERC1155`
   - transaction hash mint ERC-721 NFT-визитки студенту
   - transaction hash batch mint 10 ERC-1155 NFT
   - transaction hash batch transfer 1 или 2 ERC-1155 NFT студенту
   - скриншоты из Remix / Hardhat console / Etherscan / кошелька, где видно mint и transfer

Если деплой выполняется только локально в Hardhat, можно приложить скриншот терминала с результатом `npm run deploy:hardhat`. Для публичной сети лучше использовать Sepolia и приложить ссылки на Etherscan.

## Структура проекта

```text
Lab9Cryp/
  contracts/
    SoulboundVisitCardERC721.sol
    GameCharacterCollectionERC1155.sol
  scripts/
    deploy.js
  test/
    nft-contracts.test.js
  metadata/
    visit-card-student.json
    game-character-1.json
    ...
    game-character-10.json
  hardhat.config.js
  package.json
  README.md
```

## Установка

Перейти в папку проекта:

```bash
cd Lab9Cryp
```

Установить зависимости:

```bash
npm install
```

Проверить тесты:

```bash
npm test
```

Ожидаемый результат:

```text
4 passing
```

## Контракт 1: SoulboundVisitCardERC721

Файл:

```text
contracts/SoulboundVisitCardERC721.sol
```

Что реализовано:

- Используется OpenZeppelin `ERC721`.
- Используется `Ownable` для ограничения mint.
- Только owner/admin может выпускать NFT-визитку.
- Один student wallet может получить только одну NFT-визитку.
- Metadata задаётся через `tokenURI`.
- Для токена хранятся параметры:
  - `studentName`
  - `studentID`
  - `course`
  - `studentYear`
- Soulbound-поведение:
  - запрещён `approve`
  - запрещён `setApprovalForAll`
  - запрещён `transferFrom`
  - запрещён `safeTransferFrom`
  - дополнительно заблокирован внутренний transfer через `_update`

Пример mint:

```solidity
mintVisitCard(
    studentWallet,
    "ipfs://bafybeilab9visitcard/student-visit-card.json",
    "Student Name",
    "STUDENT-001",
    "Cryptography and Blockchain",
    2026
);
```

## Контракт 2: GameCharacterCollectionERC1155

Файл:

```text
contracts/GameCharacterCollectionERC1155.sol
```

Что реализовано:

- Используется OpenZeppelin `ERC1155`.
- Используется `Ownable` для ограничения mint.
- Создано 10 разных token ID: от `1` до `10`.
- Каждый token ID представляет отдельного игрового персонажа.
- Для каждого token ID есть отдельный metadata URI.
- Для персонажей хранятся параметры:
  - `characterName`
  - `rarity`
  - `speed`
  - `strength`
- Поддерживается одиночный mint через `mintCharacter`.
- Поддерживается batch mint через `mintBatchCharacters`.
- Обычные ERC-1155 transfers и approvals не запрещены.
- Поддерживается batch transfer через стандартный `safeBatchTransferFrom`.

Пример batch mint 10 NFT:

```solidity
mintBatchCharacters(
    owner,
    [1,2,3,4,5,6,7,8,9,10],
    [1,1,1,1,1,1,1,1,1,1],
    "0x"
);
```

Пример batch transfer 2 NFT студенту:

```solidity
safeBatchTransferFrom(
    owner,
    studentWallet,
    [1,2],
    [1,1],
    "0x"
);
```

## Metadata

Metadata хранится off-chain и указывается через `ipfs://` URI.

Пример ERC-721 metadata:

```json
{
  "name": "Soulbound Student Visit Card #1",
  "description": "Non-transferable ERC-721 visit card NFT for a student.",
  "image": "ipfs://bafybeilab9visitcard/student-visit-card.png",
  "attributes": [
    { "trait_type": "studentName", "value": "Student Name" },
    { "trait_type": "studentID", "value": "STUDENT-001" },
    { "trait_type": "course", "value": "Cryptography and Blockchain" },
    { "trait_type": "year", "value": 2026 }
  ]
}
```

Пример ERC-1155 metadata:

```json
{
  "name": "Astra Knight",
  "description": "Game character token ID 1 from the ERC-1155 collection.",
  "image": "ipfs://bafybeilab9characters/astra-knight.png",
  "attributes": [
    { "trait_type": "color", "value": "Silver" },
    { "trait_type": "speed", "value": 45 },
    { "trait_type": "strength", "value": 70 },
    { "trait_type": "rarity", "value": "Common" }
  ]
}
```

В папке `metadata/` уже есть JSON-файлы для визитки и 10 игровых персонажей. Перед деплоем в публичную сеть нужно загрузить эти JSON-файлы и изображения на IPFS, затем заменить placeholder URI на реальные IPFS CID.

## Локальный запуск через Hardhat

Запустить тесты:

```bash
npm test
```

Запустить деплой в локальной in-memory Hardhat-сети:

```bash
npm run deploy:hardhat
```

Скрипт выполнит:

1. Деплой `SoulboundVisitCardERC721`.
2. Деплой `GameCharacterCollectionERC1155`.
3. Mint одной ERC-721 soulbound NFT-визитки студенту.
4. Batch mint 10 ERC-1155 NFT на адрес deployer.
5. Batch transfer token ID `1` и `2` студенту.
6. Вывод transaction hashes в терминал.

Пример вывода:

```text
SoulboundVisitCardERC721: 0x...
GameCharacterCollectionERC1155: 0x...
Visit card mint tx: 0x...
ERC-1155 batch mint tx: 0x...
ERC-1155 batch transfer tx: 0x...
```

## Деплой в Sepolia

Создать файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполнить поля:

```text
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY_WITHOUT_0X
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
STUDENT_WALLET=0xYourStudentWalletAddress
```

Запустить деплой:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

После деплоя сохранить:

- адрес ERC-721 контракта
- адрес ERC-1155 контракта
- hash mint ERC-721
- hash batch mint ERC-1155
- hash batch transfer ERC-1155

Эти данные нужно добавить в отчёт или в раздел ниже.

## Проверка функциональности

Команда:

```bash
npm test
```

Проверяется:

- owner может mint ERC-721 NFT-визитку студенту
- один student wallet не может получить вторую визитку
- ERC-721 NFT нельзя transfer
- ERC-721 NFT нельзя approve
- не-owner не может mint
- ERC-1155 batch mint создаёт 10 NFT
- ERC-1155 batch transfer отправляет 2 NFT студенту

## Доказательство работы

Заполнить после локального или Sepolia-деплоя:

```text
ERC-721 contract address:

ERC-1155 contract address:

ERC-721 visit card mint transaction hash:

ERC-1155 batch mint transaction hash:

ERC-1155 batch transfer transaction hash:

Student wallet address:

Screenshots:
- mint ERC-721 visit card
- failed transfer or approval for soulbound NFT
- batch mint ERC-1155
- batch transfer ERC-1155 to student wallet
```

## Команды для быстрой проверки

```bash
cd Lab9Cryp
npm install
npm test
npm run deploy:hardhat
```

Если все команды выполнились успешно, работа готова к сдаче.
