# Security Guidelines

## ⚠️ CRITICAL SECURITY RULES

### Rule 1: Never Touch Private Keys

**NEVER:**
- Ask users for private keys
- Ask for seed phrases or mnemonic words
- Store private keys anywhere
- Transmit private keys over network
- Log private keys

**ALWAYS:**
- Use MetaMask for all signing operations
- Let users control their own keys
- Sign transactions client-side only

### Rule 2: Human Confirmation Required

**Before EVERY transaction:**
1. Display complete transaction preview
2. Show all details (amount, recipient, gas, etc.)
3. Require user to type "CONFIRM"
4. Then prompt MetaMask signature
5. Log confirmation timestamp

**Never:**
- Auto-execute transactions
- Skip confirmation screens
- Hide transaction details

### Rule 3: Fraud Detection

Implement checks for:

#### Suspicious Amounts
```typescript
// Warn if transfer > 50% of balance
if (amount > balance * 0.5) {
  showWarning('You are transferring more than 50% of your balance');
}
```

#### New Recipients
```typescript
// Warn if address not in address book
if (!isInAddressBook(recipient)) {
  showWarning('This is a new recipient address');
}
```

#### High Slippage
```typescript
// Warn if slippage > 5%
if (slippage > 5) {
  showWarning('High slippage tolerance may result in unfavorable swap');
}
```

#### Abnormal Gas
```typescript
// Alert if gas > 2x recent average
if (gasPrice > averageGasPrice * 2) {
  showWarning('Gas price is unusually high');
}
```

#### Unlimited Approvals
```typescript
// Warn if approval amount is max uint256
if (approvalAmount === MAX_UINT256) {
  showWarning('Unlimited approval requested - consider approving exact amount');
}
```

### Rule 4: Daily Transfer Limits

```typescript
const DEFAULT_DAILY_LIMIT_USD = 10000;

async function checkDailyLimit(userId: number, amountUSD: number) {
  const today = new Date().toISOString().split('T')[0];
  const used = await getDailyUsage(userId, today);
  
  if (used + amountUSD > DEFAULT_DAILY_LIMIT_USD) {
    throw new Error(`Daily limit exceeded. Limit: $${DEFAULT_DAILY_LIMIT_USD}, Used: $${used}`);
  }
  
  await updateDailyUsage(userId, today, amountUSD);
}
```

### Rule 5: Blocklist & Allowlist

#### Blocklist Check
```typescript
const KNOWN_SCAM_ADDRESSES = [
  '0x0000000000000000000000000000000000000000',
  // Add known scam addresses
];

function isBlocklisted(address: string): boolean {
  return KNOWN_SCAM_ADDRESSES.includes(address.toLowerCase());
}

// Before every transaction
if (isBlocklisted(recipient)) {
  throw new Error('Recipient address is on the blocklist');
}
```

#### Allowlist Benefits
```typescript
// Trusted addresses skip some checks
if (isAllowlisted(recipient)) {
  // Skip new recipient warning
  // Allow higher amounts
  // Faster confirmation
}
```

### Rule 6: Transaction Preview

**Always show:**
```
┌─────────────────────────────────────┐
│ TRANSACTION PREVIEW                 │
├─────────────────────────────────────┤
│ Action: Swap                        │
│ Amount: 100 USDC                    │
│ Fiat Value: $100.00                 │
│ You Receive: ~0.037 ETH             │
│ Chain: Ethereum Mainnet             │
│ Gas Estimate: 0.0023 ETH (~$5.20)   │
│ Recipient: Uniswap V2 Router        │
│ Slippage Tolerance: 0.5%            │
│ Deadline: 20 minutes                │
├─────────────────────────────────────┤
│ Type CONFIRM to proceed             │
└─────────────────────────────────────┘
```

## Authentication Security

### EIP-4361 (Sign-In With Ethereum)

**Implementation:**
```typescript
// 1. Generate unique nonce
const nonce = crypto.randomBytes(16).toString('hex');

// 2. Store with expiration (5 minutes)
await storeNonce(address, nonce, Date.now() + 5 * 60 * 1000);

// 3. Create SIWE message
const message = `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${origin}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

// 4. User signs message
const signature = await signer.signMessage(message);

// 5. Verify signature server-side
const recoveredAddress = ethers.verifyMessage(message, signature);
if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
  throw new Error('Invalid signature');
}

// 6. Check nonce is valid and not expired
const storedNonce = await getNonce(address);
if (storedNonce !== nonce || isExpired(address)) {
  throw new Error('Invalid or expired nonce');
}

// 7. Clear nonce (one-time use)
await clearNonce(address);

// 8. Issue JWT token
const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '24h' });
```

**Security Benefits:**
- No password storage
- Cryptographic proof of ownership
- Prevents replay attacks (nonce)
- Time-limited sessions (JWT expiration)

## API Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests',
});

app.use('/api/', limiter);
```

### Input Validation

```typescript
// Validate Ethereum addresses
function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate amounts
function validateAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < Number.MAX_SAFE_INTEGER;
}

// Sanitize user input
function sanitize(input: string): string {
  return input.replace(/[<>]/g, '');
}
```

### SQL Injection Prevention

```typescript
// ✅ GOOD: Parameterized queries
await query('SELECT * FROM users WHERE wallet_address = $1', [address]);

// ❌ BAD: String concatenation
await query(`SELECT * FROM users WHERE wallet_address = '${address}'`);
```

### XSS Prevention

```typescript
// Sanitize all user-generated content
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
```

## Smart Contract Security

### Verify Contract Addresses

```typescript
// Maintain whitelist of verified contracts
const VERIFIED_CONTRACTS = {
  1: { // Ethereum
    UNISWAP_V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
};

function isVerifiedContract(address: string, chainId: number): boolean {
  const contracts = VERIFIED_CONTRACTS[chainId];
  return Object.values(contracts).includes(address);
}
```

### Gas Limit Protection

```typescript
// Cap gas limit to prevent DoS
const MAX_GAS_LIMIT = 500000;

if (gasLimit > MAX_GAS_LIMIT) {
  throw new Error('Gas limit too high');
}
```

## Database Security

### Connection Security

```typescript
// Use SSL for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});
```

### Sensitive Data

```typescript
// Never store:
// - Private keys
// - Seed phrases
// - Unencrypted passwords

// OK to store:
// - Wallet addresses (public)
// - Transaction hashes (public)
// - Nonces (temporary)
// - JWT tokens (hashed)
```

## HTTPS/TLS

### Enforce HTTPS

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## Logging & Monitoring

### What to Log

```typescript
// ✅ Log these:
- Authentication attempts
- Transaction submissions
- Failed validations
- API errors
- Rate limit violations

// ❌ Never log these:
- Private keys
- Signatures
- JWT tokens
- User passwords
```

### Audit Trail

```typescript
// Log all transactions
await query(
  `INSERT INTO transactions (user_id, tx_hash, chain, type, amount, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())`,
  [userId, txHash, chain, type, amount]
);
```

## Incident Response

### If Private Key Compromised

1. **Immediately** move all funds to new wallet
2. Revoke all token approvals
3. Notify users if platform wallet
4. Investigate breach source
5. Update security measures

### If Database Compromised

1. Take database offline
2. Assess what data was accessed
3. Notify affected users
4. Reset all JWT tokens
5. Audit all recent transactions
6. Implement additional security

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] JWT tokens in httpOnly cookies
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] CSRF tokens for state-changing operations
- [ ] Private keys never stored or transmitted
- [ ] All transactions require explicit confirmation
- [ ] Gas limits capped
- [ ] Daily transfer limits enforced
- [ ] Blocklist checked before transfers
- [ ] Fraud detection active
- [ ] Transaction logs maintained
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies regularly updated
- [ ] Security headers configured
- [ ] Database credentials in environment variables
- [ ] Backup and disaster recovery plan
- [ ] Monitoring and alerting set up

## Regular Security Maintenance

### Weekly
- Review transaction logs for anomalies
- Check error logs
- Monitor rate limit violations

### Monthly
- Update dependencies (`npm audit fix`)
- Review and update blocklist
- Audit user permissions
- Test backup restoration

### Quarterly
- Security audit of codebase
- Penetration testing
- Review and update security policies
- Train team on new threats

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [EIP-4361 Specification](https://eips.ethereum.org/EIPS/eip-4361)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
