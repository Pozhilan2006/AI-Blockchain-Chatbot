import express from 'express';
import axios from 'axios';

const router = express.Router();

// Simple in-memory cache
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

// GET /api/prices/:symbol - Get token price in USD
router.get('/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const normalizedSymbol = symbol.toLowerCase();

        // Check cache
        const cached = priceCache.get(normalizedSymbol);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.json({
                symbol: symbol.toUpperCase(),
                usd: cached.price,
                lastUpdated: new Date(cached.timestamp).toISOString(),
                cached: true,
            });
        }

        // Map common symbols to CoinGecko IDs
        const coinGeckoIds: Record<string, string> = {
            eth: 'ethereum',
            matic: 'matic-network',
            bnb: 'binancecoin',
            usdc: 'usd-coin',
            usdt: 'tether',
            dai: 'dai',
            weth: 'weth',
            wmatic: 'wmatic',
            wbnb: 'wbnb',
        };

        const coinId = coinGeckoIds[normalizedSymbol];
        if (!coinId) {
            return res.status(404).json({ error: 'Token not supported' });
        }

        // Fetch from CoinGecko
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            {
                params: {
                    vs_currencies: 'usd',
                },
                headers: process.env.COINGECKO_API_KEY ? { 'X-Cg-Pro-Api-Key': process.env.COINGECKO_API_KEY } : {},
            }
        );

        const price = response.data[coinId]?.usd;
        if (!price) {
            return res.status(404).json({ error: 'Price not found' });
        }

        // Update cache
        priceCache.set(normalizedSymbol, { price, timestamp: Date.now() });

        res.json({
            symbol: symbol.toUpperCase(),
            usd: price,
            lastUpdated: new Date().toISOString(),
            cached: false,
        });
    } catch (error: any) {
        console.error('Price fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

export default router;
