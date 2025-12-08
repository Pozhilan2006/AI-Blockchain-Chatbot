# AI-Powered Web3 Chatbot

A production-grade AI-assisted asset-transfer chatbot that connects to MetaMask and executes real on-chain transactions.

## Features

- 🔐 **Secure Wallet Authentication**: EIP-4361 Sign-In With Ethereum
- 🌐 **Multi-Chain Support**: Ethereum, Polygon, Binance Smart Chain
- 💸 **Asset Transfers**: ETH, ERC-20 tokens, ERC-721 NFTs, ERC-1155 multi-tokens
- 🔄 **DEX Integration**: Token swaps via Uniswap Router
- 🤖 **AI Intent Detection**: Natural language to blockchain transactions
- 🛡️ **Safety Features**: Confirmation screens, fraud detection, daily limits
- 📊 **Portfolio Management**: Balance tracking, transaction history

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- ethers.js v6
- MetaMask integration
- TailwindCSS

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT authentication
- ethers.js for signature verification

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MetaMask browser extension
- API keys (see `.env.example`)

### Installation

1. **Clone and install dependencies**

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

2. **Configure environment variables**

```bash
# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values

# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

3. **Set up database**

```bash
# Create database
createdb web3_chatbot

# Run schema
psql web3_chatbot < backend/database/schema.sql
```

4. **Start development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Open application**

Navigate to `http://localhost:5173`

## Project Structure

```
chatbot/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Blockchain & AI utilities
│   │   ├── types/           # TypeScript types
│   │   ├── config/          # Chain configs & ABIs
│   │   └── App.tsx          # Main app component
│   └── package.json
├── backend/                 # Node.js server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Server entry point
│   ├── database/
│   │   └── schema.sql       # Database schema
│   └── package.json
└── README.md
```

## Usage Examples

### Transfer ETH
```
"Send 0.5 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
```

### Swap Tokens
```
"Swap 100 USDC for ETH"
```

### Check Balance
```
"What's my balance?"
```

### Transfer NFT
```
"Send my Bored Ape #1234 to alice.eth"
```

## Security

⚠️ **IMPORTANT**: This system executes REAL blockchain transactions with REAL funds.

- Never share private keys or seed phrases
- All transactions require explicit confirmation
- Daily transfer limits enforced
- Fraud detection active
- Blocklist checked before transfers

See [SECURITY.md](./SECURITY.md) for complete security guidelines.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Testing

See [TESTING.md](./TESTING.md) for testing guidelines and attack scenarios.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
