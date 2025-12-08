-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  nonce VARCHAR(64),
  nonce_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tx_hash VARCHAR(66) NOT NULL,
  chain VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount VARCHAR(50),
  token VARCHAR(10),
  recipient VARCHAR(42),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Daily limits table
CREATE TABLE IF NOT EXISTS daily_limits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_usd DECIMAL(18, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_limits(user_id, date);

-- Blocklist table (for known scam addresses)
CREATE TABLE IF NOT EXISTS blocklist (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  reason TEXT,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Create index on address
CREATE INDEX IF NOT EXISTS idx_blocklist_address ON blocklist(address);

-- Allowlist table (for trusted addresses)
CREATE TABLE IF NOT EXISTS allowlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address VARCHAR(42) NOT NULL,
  label VARCHAR(100),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, address)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_allowlist_user_address ON allowlist(user_id, address);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_limits_updated_at BEFORE UPDATE ON daily_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
