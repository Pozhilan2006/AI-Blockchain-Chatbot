# Example Conversations & Transaction Objects

## Example Conversations

### 1. ETH Transfer

**User:** "Send 0.3 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

**Intent Parsed:**
```json
{
  "intent": "TRANSFER_ETH",
  "params": {
    "amount": "0.3",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "chain": "ethereum"
  },
  "confidence": 0.9,
  "missingParams": []
}
```

**Transaction Preview:**
```
Action: TRANSFER ETH
Amount: 0.3 ETH
Fiat Value: ~$675.00
Recipient: 0x742d...bEb0
Chain: Ethereum Mainnet
Gas Estimate: 0.0005 ETH (~$1.12)
```

**Transaction Object:**
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "from": "0x1234567890123456789012345678901234567890",
  "value": "300000000000000000",
  "chainId": 1,
  "gasLimit": "25200",
  "maxFeePerGas": "30000000000",
  "maxPriorityFeePerGas": "2000000000"
}
```

---

### 2. ERC-20 Token Transfer

**User:** "Send 100 USDC to 0x8ba1f109551bD432803012645Ac136ddd64DBA72"

**Intent Parsed:**
```json
{
  "intent": "TRANSFER_TOKEN",
  "params": {
    "amount": "100",
    "token": "USDC",
    "recipient": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    "chain": "ethereum"
  },
  "confidence": 0.9,
  "missingParams": []
}
```

**Transaction Object:**
```json
{
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0xa9059cbb0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000005f5e100",
  "value": "0",
  "chainId": 1,
  "gasLimit": "65000",
  "maxFeePerGas": "30000000000",
  "maxPriorityFeePerGas": "2000000000"
}
```

---

### 3. Token Swap (USDC → ETH)

**User:** "Swap 100 USDC for ETH"

**Intent Parsed:**
```json
{
  "intent": "SWAP_TOKENS",
  "params": {
    "amountIn": "100",
    "tokenIn": "USDC",
    "tokenOut": "ETH",
    "slippage": 0.5,
    "chain": "ethereum"
  },
  "confidence": 0.85,
  "missingParams": []
}
```

**Approval Transaction (if needed):**
```json
{
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d0000000000000000000000000000000000000000000000000000000005f5e100",
  "value": "0",
  "chainId": 1,
  "gasLimit": "50000"
}
```

**Swap Transaction:**
```json
{
  "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x38ed17390000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000020c49ba5e353f5...",
  "value": "0",
  "chainId": 1,
  "gasLimit": "200000",
  "maxFeePerGas": "30000000000",
  "maxPriorityFeePerGas": "2000000000"
}
```

---

### 4. Buy Token with Native Currency

**User:** "Buy 100 USDT with ETH"

**Intent Parsed:**
```json
{
  "intent": "BUY_TOKEN",
  "params": {
    "amount": "100",
    "token": "USDT",
    "chain": "ethereum"
  },
  "confidence": 0.85,
  "missingParams": []
}
```

**Transaction Object:**
```json
{
  "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x7ff36ab5000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000000800000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000006580a3c0...",
  "value": "44500000000000000",
  "chainId": 1,
  "gasLimit": "180000"
}
```

---

### 5. Sell Token for Native Currency

**User:** "Sell 50 DAI"

**Intent Parsed:**
```json
{
  "intent": "SELL_TOKEN",
  "params": {
    "amount": "50",
    "token": "DAI",
    "chain": "ethereum"
  },
  "confidence": 0.85,
  "missingParams": []
}
```

---

### 6. NFT Transfer

**User:** "Send my Bored Ape #1234 to 0x9876543210987654321098765432109876543210"

**Intent Parsed:**
```json
{
  "intent": "TRANSFER_NFT",
  "params": {
    "contractAddress": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    "tokenId": "1234",
    "recipient": "0x9876543210987654321098765432109876543210",
    "chain": "ethereum"
  },
  "confidence": 0.8,
  "missingParams": []
}
```

**Transaction Object:**
```json
{
  "to": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x42842e0e00000000000000000000000012345678901234567890123456789012345678900000000000000000000000009876543210987654321098765432109876543210000000000000000000000000000000000000000000000000000000000000004d2",
  "value": "0",
  "chainId": 1,
  "gasLimit": "100000"
}
```

---

### 7. Check Balance

**User:** "What's my balance?"

**Intent Parsed:**
```json
{
  "intent": "CHECK_BALANCE",
  "params": {},
  "confidence": 0.9,
  "missingParams": []
}
```

**Assistant Response:**
```
Your wallet balance:

ETH: 2.5431 (~$5,722.00)

Tokens:
- USDC: 1,500.00
- DAI: 250.00
- USDT: 100.00

Total Portfolio Value: ~$7,572.00
```

---

### 8. Show Address

**User:** "Show my address"

**Intent Parsed:**
```json
{
  "intent": "SHOW_ADDRESS",
  "params": {},
  "confidence": 0.9,
  "missingParams": []
}
```

**Assistant Response:**
```
Your wallet address is:
0x1234567890123456789012345678901234567890

You can share this address to receive assets.

[QR Code displayed]
```

---

### 9. Show Transaction History

**User:** "Show my transaction history"

**Intent Parsed:**
```json
{
  "intent": "SHOW_HISTORY",
  "params": {},
  "confidence": 0.9,
  "missingParams": []
}
```

---

### 10. Error Scenarios

#### Insufficient Funds

**User:** "Send 10 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

**Assistant Response:**
```
Error: Insufficient funds. You have 2.5431 ETH but are trying to send 10 ETH.
```

#### Invalid Address

**User:** "Send 1 ETH to 0xinvalid"

**Assistant Response:**
```
Error: Invalid recipient address. Please provide a valid Ethereum address.
```

#### Missing Parameters

**User:** "Swap USDC"

**Intent Parsed:**
```json
{
  "intent": "SWAP_TOKENS",
  "params": {
    "tokenIn": "USDC"
  },
  "confidence": 0.5,
  "missingParams": ["amountIn", "tokenOut"]
}
```

**Assistant Response:**
```
How much USDC would you like to swap?
```

**User:** "100"

**Assistant Response:**
```
Which token would you like to swap to?
```

**User:** "ETH"

**Assistant Response:**
```
I'll help you swap 100 USDC for ETH. Please review the transaction details.
```

---

## Complete Transaction Flow Example

### Swap 20 USDC to MATIC on Polygon

**Step 1: User Input**
```
User: "Swap 20 USDC to MATIC on Polygon"
```

**Step 2: Intent Parsing**
```json
{
  "intent": "SWAP_TOKENS",
  "params": {
    "amountIn": "20",
    "tokenIn": "USDC",
    "tokenOut": "MATIC",
    "slippage": 0.5,
    "chain": "polygon"
  },
  "confidence": 0.85,
  "missingParams": []
}
```

**Step 3: Transaction Preview**
```
┌─────────────────────────────────────┐
│ TRANSACTION PREVIEW                 │
├─────────────────────────────────────┤
│ Action: Swap                        │
│ Amount: 20 USDC                     │
│ Fiat Value: $20.00                  │
│ You Receive: ~25.3 MATIC            │
│ Chain: Polygon                      │
│ Gas Estimate: 0.015 MATIC (~$0.01)  │
│ Recipient: QuickSwap Router         │
│ Slippage Tolerance: 0.5%            │
│ Minimum Received: 25.17 MATIC       │
│ Deadline: 20 minutes                │
├─────────────────────────────────────┤
│ Type CONFIRM to proceed             │
└─────────────────────────────────────┘
```

**Step 4: User Confirmation**
```
User types: "CONFIRM"
```

**Step 5: Approval Transaction (if needed)**
```json
{
  "to": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x095ea7b3000000000000000000000000a5e0829caced8ffdd4de3c43696c57f7d7a678ff0000000000000000000000000000000000000000000000000000000001312d00",
  "value": "0",
  "chainId": 137,
  "gasLimit": "50000"
}
```

**Step 6: MetaMask Approval Popup**
```
MetaMask: Approve USDC spending
Contract: QuickSwap Router
Amount: 20 USDC
```

**Step 7: Approval Confirmed**
```
Transaction Hash: 0xabc123...
Status: Pending...
Status: Confirmed ✓
```

**Step 8: Swap Transaction**
```json
{
  "to": "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  "from": "0x1234567890123456789012345678901234567890",
  "data": "0x38ed17390000000000000000000000000000000000000000000000000000000001312d00...",
  "value": "0",
  "chainId": 137,
  "gasLimit": "200000"
}
```

**Step 9: MetaMask Swap Popup**
```
MetaMask: Confirm Swap
From: 20 USDC
To: ~25.3 MATIC
Gas Fee: 0.015 MATIC
```

**Step 10: Swap Confirmed**
```
Transaction Hash: 0xdef456...
Status: Pending...
Status: Confirmed ✓

Success! You swapped 20 USDC for 25.31 MATIC.
```

---

## Advanced Examples

### Multi-Step Conversation

**User:** "I want to swap some tokens"

**Assistant:** "Which token would you like to swap from?"

**User:** "USDC"

**Assistant:** "How much USDC would you like to swap?"

**User:** "50"

**Assistant:** "Which token would you like to swap to?"

**User:** "ETH"

**Assistant:** "I'll help you swap 50 USDC for ETH. Please review the transaction details."

---

### Error Recovery

**User:** "Send 100 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

**Assistant:** "Error: Insufficient funds. You have 2.5431 ETH but are trying to send 100 ETH."

**User:** "Send 1 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

**Assistant:** "I'll help you send 1 ETH to 0x742d...bEb0. Please review the transaction details."

---

### Safety Warnings

**User:** "Send 2 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

**Assistant:**
```
⚠️ Warning: You are transferring more than 50% of your balance.

Current Balance: 2.5431 ETH
Transfer Amount: 2 ETH (78.6% of balance)

Are you sure you want to proceed?
Type CONFIRM to continue.
```
