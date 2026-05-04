# Lab 8: Multi-Signature Wallet — Documentation and Analysis

## 1. Архитектура контракта и механизм мультиподписного подтверждения

### Общая архитектура

Контракт `MultiSigWallet` реализует **мультиподписный кошелек** — смарт-контракт, который требует подтверждения от нескольких владельцев (owners) для выполнения любой транзакции. Это повышает безопасность, исключая единую точку отказа (single point of failure).

### Структуры данных (Data Structures)

```solidity
// Массив адресов владельцев
address[] public owners;

// Проверка: является ли адрес владельцем
mapping(address => bool) public isOwner;

// Количество подтверждений, необходимых для выполнения транзакции
uint public numConfirmationsRequired;

// Структура транзакции
struct Transaction {
    address to;          // Куда отправляем (адрес)
    uint value;         // Сколько ETH отправляем
    bytes data;         // Данные для вызова (для токенов/контрактов)
    bool executed;      // Выполнена ли уже
    uint numConfirmations; // Сколько подтверждений получено
}

// Массив всех транзакций
Transaction[] public transactions;

// Вложенная мапа: какая транзакция подтверждена каким владельцем
mapping(uint => mapping(address => bool)) public isConfirmed;
```

### Механизм мультиподписного подтверждения

Процесс выполнения транзакции состоит из 4 шагов:

#### Шаг 1: Предложение транзакции (Submit)
Любой владелец может предложить транзакцию:
```solidity
function submitTransaction(address _to, uint _value, bytes memory _data) public onlyOwner
```
- Создается новая транзакция в массиве `transactions`
- Записывается адрес получателя, сумма ETH, дополнительные данные
- Изначально: `executed = false`, `numConfirmations = 0`
- Генерируется событие `SubmitTransaction`

#### Шаг 2: Подтверждение (Confirm)
Владельцы подтверждают транзакцию:
```solidity
function confirmTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex)
```
- Увеличивается счетчик `numConfirmations` у транзакции
- В мапе `isConfirmed` отмечается, что владелец подтвердил
- Генерируется событие `ConfirmTransaction`
- **Нельзя подтвердить дважды** (модификатор `notConfirmed`)

#### Шаг 3: Выполнение (Execute)
Когда набрано достаточно подтверждений:
```solidity
function executeTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex)
```
- Проверяется: `numConfirmations >= numConfirmationsRequired`
- Выполняется внешний вызов: `(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);`
- Если успешно: `executed = true`
- Генерируется событие `ExecuteTransaction`
- **Используется паттерн Checks-Effects-Interactions** (сначала меняем состояние, потом внешний вызов)

#### Шаг 4: Отзыв подтверждения (Revoke) — опционально
Владелец может отозвать свое подтверждение до выполнения:
```solidity
function revokeConfirmation(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex)
```
- Уменьшается `numConfirmations`
- Сбрасывается флаг в `isConfirmed`
- Генерируется событие `RevokeConfirmation`

### Диаграмма состояний транзакции

```
[Предложена] --(Подтверждение)--> [Ожидает подтверждений] --(Порог достигнут)--> [Выполнена]
                    ^                                                                 |
                    |--(Отзыв подтверждения)---<--------------------------|
```

---

## 2. Процесс развертывания и взаимодействия с контрактом

### Развертывание (Deployment)

#### Предварительные требования:
- Node.js установлен
- Hardhat установлен локально в проекте
- Локальный узел (node) запущен

#### Шаги развертывания:

**1. Установка зависимостей:**
```bash
cd Lab8Cryp/my-multisig-project
npm install --legacy-peer-deps
```

**2. Компиляция контракта:**
```bash
npx hardhat compile
# Output: Compiled 1 Solidity file successfully (evm target: paris).
```

**3. Запуск локального узла (Терминал 1):**
```bash
npx hardhat node
# Output:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
# Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
# Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
# Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
```

**4. Развертывание (Терминал 2):**
```javascript
// scripts/deploy.js
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const accounts = await provider.send("eth_accounts", []);

const owners = [accounts[0], accounts[1], accounts[2]]; // 3 владельца
const numConfirmationsRequired = 2; // Требуется 2 подтверждения (2-of-3)

const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", owner1);
const multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);
await multiSig.waitForDeployment();

console.log("MultiSigWallet deployed to:", await multiSig.getAddress());
```

```bash
npx hardhat run scripts/deploy.js --network localhost
# Output:
# Deploying MultiSigWallet with:
# Owners: ['0xf39F...', '0x7099...', '0x3C44...']
# Required confirmations: 2
# MultiSigWallet deployed to: 0x...
```

### Взаимодействие с контрактом (Interaction)

**Пример взаимодействия (scripts/interact.js):**

```javascript
// 1. Получаем информацию о контракте
console.log("Owners:", await multiSig.getOwners());
console.log("Required confirmations:", await multiSig.numConfirmationsRequired());

// 2. Владелец #1 предлагает транзакцию (отправить 1 ETH на адрес addr1)
await multiSig.connect(owner1).submitTransaction(addr1.address, ethers.parseEther("1"), "0x");
console.log("Transaction submitted!");

// 3. Владелец #1 подтверждает
await multiSig.connect(owner1).confirmTransaction(0);
console.log("Owner 1 confirmed!");

// 4. Владелец #2 подтверждает (порог достигнут)
await multiSig.connect(owner2).confirmTransaction(0);
console.log("Owner 2 confirmed! Threshold reached!");

// 5. Выполнение транзакции
await multiSig.connect(owner1).executeTransaction(0);
console.log("Transaction executed! 1 ETH sent to addr1");

// 6. Проверяем баланс получателя
console.log("Balance of addr1:", ethers.formatEther(await provider.getBalance(addr1.address)));
```

**Прием депозита ETH в контракт:**
```javascript
// Отправляем 2 ETH в мультисиг
await owner1.sendTransaction({
  to: multiSig.getAddress(),
  value: ethers.parseEther("2")
});
// Генерируется событие Deposit
```

---

## 3. Меры безопасности и потенциальные уязвимости, которые мы учли

### ✅ Реализованные меры безопасности

#### 1. Паттерн Checks-Effects-Interactions
**Уязвимость:** Reentrancy (повторный вход)
**Решение:** В функции `executeTransaction()` сначала обновляем состояние (`executed = true`), затем делаем внешний вызов:
```solidity
transaction.executed = true; // Сначала меняем состояние
(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data); // Потом внешний вызов
require(success, "tx failed");
```

#### 2. Правильный доступ к контракту (Access Control)
**Уязвимость:** Несанкционированный доступ
**Решение:** Модификатор `onlyOwner` проверяет, что вызывающий является владельцем:
```solidity
modifier onlyOwner() {
    require(isOwner[msg.sender], "not owner");
    _;
}
```

#### 3. Защита от дублирования подтверждений
**Уязвимость:** Один владелец может подтвердить много раз, обманывая систему
**Решение:** Модификатор `notConfirmed` и проверка в `confirmTransaction()`:
```solidity
modifier notConfirmed(uint _txIndex) {
    require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
    _;
}
```

#### 4. Проверка существования транзакции
**Уязвимость:** Обращение к несуществующей транзакции (out-of-bounds)
**Решение:** Модификатор `txExists`:
```solidity
modifier txExists(uint _txIndex) {
    require(_txIndex < transactions.length, "tx does not exist");
    _;
}
```

#### 5. Защита от повторного выполнения
**Уязвимость:** Транзакция выполняется дважды (double-spending)
**Решение:** Модификатор `notExecuted` и проверка:
```solidity
modifier notExecuted(uint _txIndex) {
    require(!transactions[_txIndex].executed, "tx already executed");
    _;
}
```

#### 6. Корректная обработка ошибок
**Уязвимость:** Транзакция выполняется, но сбой во внешнем вызове игнорируется
**Решение:** Проверка `success` после `call`:
```solidity
(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
require(success, "tx failed");
```

### ⚠️ Потенциальные уязвимости, требующие внимания в продакшене

#### 1. Отсутствие защиты от потери ETH (No receive function guard)
- **Проблема:** Любой может отправить ETH на контракт
- **Решение (дополнительно):** Добавить логику в `receive()` для отклонения нежелательных депозитов (или ограничить только владельцами)

#### 2. Невозможность смены владельцев (Static ownership)
- **Проблема:** В текущей версии нельзя добавить/удалить владельцев без деплоя нового контракта
- **Решение (для продакшена):** Добавить функции `addOwner()`, `removeOwner()` с проверкой кворума

#### 3. Фиксированный порог подтверждений
- **Проблема:** Нельзя изменить `numConfirmationsRequired` после деплоя
- **Решение:** Добавить `changeRequirement()` функцию

#### 4. Отсутствие таймаута для транзакций
- **Проблема:** Транзакция может висеть в ожидании подтверждений бесконечно
- **Решение:** Добавить `expiration` времени и функцию `refundExpired()`

#### 5. Риск компрометации нескольких ключей
- **Проблема:** Если скомпрометировано >= `numConfirmationsRequired` ключей, средства могут быть украдены
- **Решение:** Использовать аппаратные кошельки (Ledger, Trezor) для хранения ключей владельцев

---

## 4. Анализ назначения мультисиг-кошельков и их роль в повышении безопасности децентрализованных приложений

### Что такое мультисиг-кошельки?

Мультисиг-кошелек (multi-signature wallet) — это смарт-контракт, который требует **M из N** подписей (подтверждений) для авторизации транзакции. Например, 2-of-3 означает, что из 3 владельцев нужно минимум 2 подтверждения.

### Роль в повышении безопасности DeFi и DAO

#### 1. Защита казны DAO (Treasury Security)
- **Проблема:** У DAO часто есть миллионы долларов в казне. Если один человек (даже директор) имеет единоличный контроль — это риск кражи, шантажа или потери ключей.
- **Решение мультисига:** Требовать подписи от 3-of-5 членов совета DAO. Даже если 2 члена скомпрометированы, средства в безопасности.

#### 2. Безопасное управление протоколами (Protocol Governance)
- **Проблема:** DeFi протоколы (Uniswap, Aave и др.) имеют административные функции (обновление параметров, апгрейд контрактов).
- **Решение:** Использовать мультисиг как "Timelock Contract" + "Admin Wallet". Любое изменение требует подтверждения от нескольких доверенных лиц.

#### 3. Эскроу-сервисы (Escrow Services)
- **Проблема:** При сделках P2P (например, покупка NFT за криптовалюту) нужен гарант.
- **Решение:** Мультисиг 2-of-3: Покупатель, Продавец и Независимый Арбитр. Средства заморожены в контракте до подтверждения выполнения условий.

#### 4. Личная безопасность (Personal Security)
- **Проблема:** Если ваш приватный ключ от MetaMask скомпрометирован — средства украдены.
- **Решение:** Использовать мультисиг 2-of-2 (или 2-of-3) с ключами на разных устройствах (телефон, ноутбук, аппаратный кошелек). Даже при краже одного устройства средства в безопасности.

#### 5. Корпоративные платежи (Corporate Payments)
- **Проблема:** В компаниях одобрение крупных транзакций требует подписи CEO и CFO.
- **Решение:** Мультисиг автоматизирует этот процесс в блокчейне, делая его прозрачным и необратимым.

### Сравнение с обычными кошельками

| Характеристика | Обычный кошелек | Мультисиг-кошелек |
|---------------|--------------------|----------------------|
| Единая точка отказа | ✅ Да (один ключ = все потеряно) | ❌ Нет (нужно скомпрометировать несколько ключей) |
| Безопасность | ⚠️ Низкая | ✅ Высокая |
| Удобство | ✅ Просто | ⚠️ Требует координации между владельцами |
| Подходит для | Личного использования | DAO, Компаний, Крупных хранилищ |

### Почему это важно для будущего DeFi?

1. **Децентрализация управления:** Мультисиги позволяют реализовать истинно децентрализованное управление (не одному человеку доверять миллионы)
2. **Страховка от человеческого фактора:** Люди теряют ключи, забывают пароли, попадают под фишинг. Мультисиг минимизирует эти риски
3. **Прозрачность:** Все подтверждения записываются в блокчейн, создавая аудиторский след
4. **Стандарт индустрии:** Крупнейшие проекты (Gnosis Safe, BitGo, BitMEX) используют мультисиги для хранения средств пользователей

---

## Заключение

В рамках этой лабораторной работы мы:
1. ✅ Спроектировали и реализовали мультисиг-кошелек на Solidity
2. ✅ Реализовали полный цикл транзакции: предложение → подтверждение → выполнение (с возможностью отзыва)
3. ✅ Применили лучшие практики безопасности (checks-effects-interactions, access control, input validation)
4. ✅ Написали тесты, покрывающие основные сценарии и краевые случаи
5. ✅ Провели анализ безопасности и роли мультисигов в экосистеме DeFi

Мультисиг-кошельки остаются критически важным инструментом для обеспечения безопасности средств в децентрализованных приложениях и протоколах.
