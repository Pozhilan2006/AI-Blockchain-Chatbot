# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- MetaMask browser extension
- Domain with SSL certificate (for production)

## Environment Setup

### 1. API Keys Required

You'll need to obtain the following API keys:

- **Infura** or **Alchemy**: For blockchain RPC endpoints
  - Sign up at https://infura.io or https://alchemy.com
  - Create projects for Ethereum, Polygon, and BSC

- **Etherscan API Keys**: For transaction history
  - Ethereum: https://etherscan.io/apis
  - Polygon: https://polygonscan.com/apis
  - BSC: https://bscscan.com/apis

- **CoinGecko API** (optional): For token prices
  - Free tier available at https://www.coingecko.com/en/api

### 2. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# On Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# On macOS with Homebrew:
brew install postgresql@14
brew services start postgresql@14

# On Windows:
# Download installer from https://www.postgresql.org/download/windows/

# Create database
createdb web3_chatbot

# Run schema
psql web3_chatbot < backend/database/schema.sql
```

### 3. Backend Deployment

#### Local Development

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Run database migrations
psql web3_chatbot < database/schema.sql

# Start development server
npm run dev
```

#### Production (Railway/Heroku)

**Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway variables set JWT_SECRET=your_secret_here
railway variables set COINGECKO_API_KEY=your_key_here
# ... set all other variables

# Deploy
railway up
```

**Heroku:**

```bash
# Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create web3-chatbot-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret_here
heroku config:set COINGECKO_API_KEY=your_key_here
# ... set all other variables

# Deploy
git push heroku main

# Run migrations
heroku pg:psql < database/schema.sql
```

### 4. Frontend Deployment

#### Local Development

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Start development server
npm run dev
```

#### Production (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to: Project Settings > Environment Variables
# Add all variables from .env.example

# Deploy to production
vercel --prod
```

**Alternative: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

## Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/web3_chatbot
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
COINGECKO_API_KEY=your_coingecko_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com
VITE_INFURA_API_KEY=your_infura_key
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_ETHERSCAN_API_KEY=your_etherscan_key
VITE_POLYGONSCAN_API_KEY=your_polygonscan_key
VITE_BSCSCAN_API_KEY=your_bscscan_key
```

## SSL/HTTPS Setup

**CRITICAL**: Never deploy to production without HTTPS.

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### Using Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"

## Post-Deployment Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] Environment variables set correctly
- [ ] Database migrations run successfully
- [ ] CORS configured for production domain
- [ ] Rate limiting active
- [ ] JWT secret is strong and unique
- [ ] API keys are valid and have sufficient quota
- [ ] MetaMask connects successfully
- [ ] Test transaction on testnet first
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure database backups
- [ ] Set up monitoring/alerts

## Monitoring

### Recommended Tools

- **Backend Monitoring**: Railway/Heroku built-in, or PM2
- **Error Tracking**: Sentry (https://sentry.io)
- **Uptime Monitoring**: UptimeRobot (https://uptimerobot.com)
- **Database Monitoring**: PgHero or built-in provider tools

### Health Check Endpoint

```bash
# Check if backend is running
curl https://your-backend-domain.com/health
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_user -d web3_chatbot
```

### CORS Errors

- Ensure `CORS_ORIGIN` in backend matches frontend domain exactly
- Include protocol (https://) and no trailing slash

### MetaMask Connection Issues

- Ensure frontend is served over HTTPS (MetaMask requires it)
- Check browser console for errors
- Try clearing MetaMask cache

### Transaction Failures

- Check gas prices are sufficient
- Verify token addresses are correct for the chain
- Ensure wallet has sufficient balance
- Check slippage tolerance for swaps

## Scaling Considerations

### Database

- Add read replicas for high traffic
- Implement connection pooling (already included)
- Regular vacuum and analyze operations

### Backend

- Use load balancer for multiple instances
- Implement Redis for session/cache storage
- Consider serverless functions for specific endpoints

### Frontend

- Use CDN for static assets
- Implement code splitting
- Enable gzip compression

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump web3_chatbot > backup_$DATE.sql
# Upload to S3 or similar
```

### Automated Backups

- Railway/Heroku: Enable automatic backups in dashboard
- Self-hosted: Use pg_dump with cron jobs

## Security Hardening

1. **Never commit .env files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable rate limiting** (already configured)
4. **Implement IP whitelisting** for admin endpoints
5. **Regular security audits** of dependencies
6. **Monitor for suspicious activity**
7. **Keep dependencies updated**

```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

## Support

For issues:
1. Check logs first
2. Verify environment variables
3. Test on testnet before mainnet
4. Review security checklist
5. Open GitHub issue if needed
