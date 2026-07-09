# AEGIUS

Aegius AMM is a decentralized Automated Market Maker (AMM) built on the Sui blockchain with an integrated circuit breaker mechanism designed to protect liquidity providers during periods of abnormal market volatility.

Unlike traditional AMMs that continue processing swaps regardless of market conditions, Aegius AMM monitors pool activity and can temporarily halt trading when predefined risk thresholds are exceeded, improving protocol safety and resilience.
## Technology Stack

### Smart Contracts

- Sui Move
- Sui Framework

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- Mysten dApp Kit
- React Query

### Wallet

- Slush Wallet

### Network

- Sui Testnet

---

## Project Structure

# Project Structure

guardian-amm/
│
├── build/                     # Compiled Move artifacts
│
├── frontend/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Transactions & constants
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── sources/                   # Move smart contracts
│   ├── guardian_amm.move      # Package entry module
│   ├── oracle.move            # Price oracle & TWAP logic
│   ├── pool.move              # Liquidity pool implementation
│   ├── swap.move              # Swap execution logic
│   ├── token_x.move           # TOKEN_X implementation
│   └── token_y.move           # TOKEN_Y implementation
│
├── tests/                     # Move unit tests
│
├── Move.toml                  # Move package configuration
├── Move.lock                  # Dependency lockfile
├── Published.toml             # Published package metadata
├── .gitignore
└── README.md

---

# How It Works

Guardian AMM follows the constant-product Automated Market Maker model while introducing a built-in circuit breaker layer.

Users can:

- Create liquidity pools
- Deposit liquidity
- Remove liquidity
- Swap between assets
- Receive LP tokens representing their pool share

The protocol continuously monitors trading conditions and activates a protective state whenever abnormal price movements are detected.

---

# Circuit Breaker
Aegis AMM introduces an additional safety layer over traditional decentralized exchanges.

When market conditions become excessively volatile:

- Swaps can be paused
- Liquidity remains protected
- Manipulative trading is reduced
- Trading resumes once conditions normalize

This mechanism helps reduce sudden losses for liquidity providers while improving market stability.

---

# Smart Contract Modules

### Pool

Responsible for:
- Pool creation
- Liquidity management
- Swaps
- LP supply
- Circuit breaker state

### Token X

Custom fungible asset used in liquidity pools.

### Token Y

Second custom fungible asset used for trading pairs.

---

# Installation

## Clone Repository

git clone https://github.com/Yash-arch-ui/Aegis.git

## Build Move Contracts

```bash
sui move build
```

---

## Publish Package

```bash
sui client publish
```

---

## Create Liquidity Pool

```bash
sui client call \
--package <PACKAGE_ID> \
--module pool \
--function create_pool \
--type-args <TOKEN_X> <TOKEN_Y> \
--gas-budget 20000000
```

---

## Frontend

Move into frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

---

# Configuration

Update

```
src/utils/constants.js
```

```javascript
export const PACKAGE_ID = "0x45855e4fd5ae8c89a983c2aadd5227fc268201318441342df2479562d691eaba";
export const POOL_ID = "0x659d1cc4c184c46cfd2400c395c9ba5d243abffa9799c6e9f7f09cc2a28ae8f3";

export const COIN_X_TYPE =
`${PACKAGE_ID}::token_x::TOKEN_X`;

export const COIN_Y_TYPE =
`${PACKAGE_ID}::token_y::TOKEN_Y`;
```

---

# Current Functionality

- Wallet Connection
- Pool Creation
- Add Liquidity
- Remove Liquidity
- Swap Tokens
- LP Token Minting
- Pool Statistics
- Circuit Breaker Logic
- Manipulative Trading Prohibited
- Flash Loans Prevented 

---

# Future Improvements

- Dynamic volatility thresholds
- TWAP oracle integration
- Multiple liquidity pools
- Governance module
- Analytics dashboard
- Trading history
- Fee distribution
- Emergency guardian controls
- Multi-token support

---

# Why Aegis AMM?

Aegis AMM combines the efficiency of decentralized liquidity pools with additional protection inspired by traditional financial circuit breakers.

Its goal is to create a more secure DeFi trading experience by reducing risks associated with extreme market movements while remaining fully decentralized.

---

# License

MIT License

---

# Author

Developed by **Yash**

Built using **Sui Move**, **React**, **Tailwind CSS**, and **Mysten dApp Kit**.
