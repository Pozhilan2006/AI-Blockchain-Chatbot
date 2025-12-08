# Architecture & System Design

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        UI[User Interface]
        WC[Wallet Connection]
        AUTH[EIP-4361 Auth]
        CHAT[Chat Interface]
        AI[AI Intent Parser]
        TX[Transaction Builder]
    end
    
    subgraph "MetaMask"
        MM[MetaMask Extension]
        WALLET[User Wallet]
    end
    
    subgraph "Backend (Node.js + Express)"
        API[API Server]
        AUTHSVC[Auth Service]
        TXLOG[Transaction Logger]
        PRICE[Price Service]
    end
    
    subgraph "Database"
        PG[(PostgreSQL)]
    end
    
    subgraph "Blockchain Networks"
        ETH[Ethereum Mainnet]
        POLY[Polygon]
        BSC[Binance Smart Chain]
    end
    
    subgraph "External APIs"
        INFURA[Infura/Alchemy RPC]
        COINGECKO[CoinGecko Prices]
        ETHERSCAN[Block Explorers]
    end
    
    UI --> WC
    WC --> MM
    MM --> WALLET
    
    WC --> AUTH
    AUTH --> AUTHSVC
    AUTHSVC --> PG
    
    UI --> CHAT
    CHAT --> AI
    AI --> TX
    
    TX --> MM
    MM --> INFURA
    INFURA --> ETH
    INFURA --> POLY
    INFURA --> BSC
    
    TX --> TXLOG
    TXLOG --> PG
    
    CHAT --> PRICE
    PRICE --> COINGECKO
    
    TX --> ETHERSCAN
```

## Authentication Flow (EIP-4361)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MetaMask
    participant Backend
    participant Database
    
    User->>Frontend: Click "Connect Wallet"
    Frontend->>MetaMask: Request Accounts
    MetaMask->>User: Approve Connection?
    User->>MetaMask: Approve
    MetaMask->>Frontend: Return Address
    
    Frontend->>Backend: POST /api/auth/nonce {address}
    Backend->>Database: Generate & Store Nonce
    Database->>Backend: Nonce + Expiration
    Backend->>Frontend: Return Nonce
    
    Frontend->>Frontend: Create SIWE Message
    Frontend->>MetaMask: Sign Message
    MetaMask->>User: Sign Request?
    User->>MetaMask: Sign
    MetaMask->>Frontend: Return Signature
    
    Frontend->>Backend: POST /api/auth/verify {address, message, signature}
    Backend->>Backend: Verify Signature
    Backend->>Database: Check Nonce Valid
    Database->>Backend: Nonce OK
    Backend->>Database: Clear Nonce
    Backend->>Backend: Generate JWT Token
    Backend->>Frontend: Return JWT Token
    
    Frontend->>Frontend: Store Token
    Frontend->>User: Show Chat Interface
```

## ETH Transfer Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatUI
    participant AIParser
    participant TxBuilder
    participant MetaMask
    participant Blockchain
    
    User->>ChatUI: "Send 0.5 ETH to 0x742d..."
    ChatUI->>AIParser: Parse Intent
    AIParser->>AIParser: Extract Amount & Recipient
    AIParser->>ChatUI: Intent: TRANSFER_ETH
    
    ChatUI->>TxBuilder: Prepare Transaction
    TxBuilder->>TxBuilder: Validate Address
    TxBuilder->>TxBuilder: Convert Amount to Wei
    TxBuilder->>Blockchain: Estimate Gas
    Blockchain->>TxBuilder: Gas Estimate
    TxBuilder->>TxBuilder: Get Gas Prices (EIP-1559)
    TxBuilder->>ChatUI: Transaction Object
    
    ChatUI->>User: Show Preview
    User->>ChatUI: Type "CONFIRM"
    
    ChatUI->>MetaMask: Send Transaction
    MetaMask->>User: Approve Transaction?
    User->>MetaMask: Approve
    MetaMask->>Blockchain: Broadcast Transaction
    Blockchain->>MetaMask: Transaction Hash
    MetaMask->>ChatUI: Transaction Hash
    
    ChatUI->>Blockchain: Monitor Transaction
    Blockchain->>ChatUI: Transaction Confirmed
    ChatUI->>User: Success Message
```

## Token Swap Flow (with Approval)

```mermaid
sequenceDiagram
    participant User
    participant ChatUI
    participant TxBuilder
    participant TokenContract
    participant Router
    participant MetaMask
    
    User->>ChatUI: "Swap 100 USDC for ETH"
    ChatUI->>TxBuilder: Prepare Swap
    
    TxBuilder->>TokenContract: Check Allowance
    TokenContract->>TxBuilder: Allowance = 0
    
    Note over TxBuilder: Approval Needed
    
    TxBuilder->>TxBuilder: Prepare Approval TX
    TxBuilder->>ChatUI: Approval + Swap TXs
    
    ChatUI->>User: Show Preview
    User->>ChatUI: Type "CONFIRM"
    
    Note over ChatUI,MetaMask: Step 1: Approval
    ChatUI->>MetaMask: Send Approval TX
    MetaMask->>User: Approve?
    User->>MetaMask: Approve
    MetaMask->>TokenContract: Approve Router
    TokenContract->>MetaMask: TX Hash
    ChatUI->>TokenContract: Wait for Confirmation
    TokenContract->>ChatUI: Confirmed
    
    Note over ChatUI,MetaMask: Step 2: Swap
    ChatUI->>MetaMask: Send Swap TX
    MetaMask->>User: Approve?
    User->>MetaMask: Approve
    MetaMask->>Router: Execute Swap
    Router->>TokenContract: Transfer USDC
    Router->>User: Transfer ETH
    Router->>MetaMask: TX Hash
    ChatUI->>Router: Wait for Confirmation
    Router->>ChatUI: Confirmed
    
    ChatUI->>User: Success!
```

## Component Architecture

### Frontend Components

```
App.tsx
├── ConnectWallet.tsx
│   ├── MetaMask Detection
│   ├── Connection Handler
│   └── Event Listeners
│
├── Auth.tsx
│   ├── Nonce Request
│   ├── SIWE Message Creation
│   ├── Signature Request
│   └── Token Storage
│
└── ChatInterface.tsx
    ├── Message Display
    ├── Input Handler
    ├── Intent Parser Integration
    │
    ├── TransactionPreview.tsx
    │   ├── Transaction Details
    │   ├── Confirmation Input
    │   ├── MetaMask Integration
    │   └── Status Tracking
    │
    ├── BalanceDisplay.tsx
    │   ├── Native Balance
    │   ├── Token Balances
    │   └── USD Values
    │
    └── TransactionHistory.tsx
        ├── Transaction List
        ├── Status Indicators
        └── Block Explorer Links
```

### Backend Routes

```
server.ts
├── /api/auth
│   ├── POST /nonce
│   └── POST /verify
│
├── /api/transactions
│   ├── POST /log
│   ├── GET /history
│   └── PUT /:txHash/status
│
└── /api/prices
    └── GET /:symbol
```

## Data Flow

### User Message → Transaction

1. **User Input**: Natural language message
2. **Intent Parsing**: Extract intent type and parameters
3. **Validation**: Check for missing/invalid parameters
4. **Transaction Building**: Create transaction object
5. **Preview**: Show details to user
6. **Confirmation**: User types "CONFIRM"
7. **Execution**: Send to MetaMask
8. **Monitoring**: Track transaction status
9. **Logging**: Record in database
10. **Feedback**: Show result to user

## Security Layers

```
┌─────────────────────────────────────┐
│ User Authentication (EIP-4361)      │
├─────────────────────────────────────┤
│ JWT Token Verification              │
├─────────────────────────────────────┤
│ Rate Limiting (100 req/min)         │
├─────────────────────────────────────┤
│ Input Validation                    │
├─────────────────────────────────────┤
│ Transaction Confirmation Required   │
├─────────────────────────────────────┤
│ Fraud Detection Checks              │
├─────────────────────────────────────┤
│ Daily Limit Enforcement             │
├─────────────────────────────────────┤
│ Blocklist Verification              │
├─────────────────────────────────────┤
│ HTTPS/TLS Encryption                │
└─────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: ethers.js v6
- **Wallet**: @metamask/detect-provider
- **HTTP Client**: axios
- **QR Codes**: qrcode.react

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: jsonwebtoken
- **Security**: helmet, cors
- **Rate Limiting**: express-rate-limit
- **Blockchain**: ethers.js v6

### Infrastructure
- **Frontend Hosting**: Vercel / Netlify
- **Backend Hosting**: Railway / Heroku
- **Database**: PostgreSQL (managed)
- **RPC Providers**: Infura / Alchemy
- **Price Data**: CoinGecko API
- **Block Explorers**: Etherscan APIs

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT tokens)
- Load balancer for multiple instances
- Database connection pooling
- CDN for frontend assets

### Caching Strategy
- Price data: 1 minute cache
- Token metadata: 1 hour cache
- Transaction history: 5 minute cache
- User balances: On-demand refresh

### Performance Optimizations
- Code splitting in frontend
- Lazy loading of components
- Database query optimization
- RPC request batching
- WebSocket for real-time updates (future)

## Future Enhancements

1. **Multi-Signature Support**: Team wallets
2. **Scheduled Transactions**: DCA, recurring payments
3. **Advanced Trading**: Limit orders, stop-loss
4. **Portfolio Analytics**: Charts, P&L tracking
5. **Mobile App**: React Native version
6. **More Chains**: Arbitrum, Optimism, Avalanche
7. **DeFi Integration**: Lending, staking, yield farming
8. **NFT Marketplace**: Browse and trade NFTs
9. **Social Features**: Share transactions, leaderboards
10. **AI Improvements**: Better intent recognition, market insights
