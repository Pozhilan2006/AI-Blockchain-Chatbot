import express from 'express';
import { generateNonce, parseSIWEMessage, verifySIWESignature } from '../utils/signatures.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage (for development without database)
const nonceStore = new Map<string, { nonce: string; expiresAt: Date; userId: number }>();
let userIdCounter = 1;

// POST /api/auth/nonce - Generate nonce for wallet address
router.post('/nonce', async (req, res) => {
    try {
        const { address } = req.body;

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const normalizedAddress = address.toLowerCase();
        const nonce = generateNonce();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store nonce in memory
        const existing = nonceStore.get(normalizedAddress);
        const userId = existing?.userId || userIdCounter++;

        nonceStore.set(normalizedAddress, {
            nonce,
            expiresAt,
            userId,
        });

        console.log(`✅ Generated nonce for ${normalizedAddress}`);

        res.json({
            nonce,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Nonce generation error:', error);
        res.status(500).json({ error: 'Failed to generate nonce' });
    }
});

// POST /api/auth/verify - Verify signature and issue JWT
router.post('/verify', async (req, res) => {
    try {
        const { address, message, signature } = req.body;

        if (!address || !message || !signature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const normalizedAddress = address.toLowerCase();

        // Get nonce from memory
        const stored = nonceStore.get(normalizedAddress);

        if (!stored) {
            return res.status(404).json({ error: 'User not found. Request a nonce first.' });
        }

        // Check if nonce is expired
        if (new Date() > stored.expiresAt) {
            nonceStore.delete(normalizedAddress);
            return res.status(401).json({ error: 'Nonce expired. Request a new one.' });
        }

        // Parse SIWE message
        const siweMessage = parseSIWEMessage(message);
        if (!siweMessage) {
            return res.status(400).json({ error: 'Invalid SIWE message format' });
        }

        // Verify nonce matches
        if (siweMessage.nonce !== stored.nonce) {
            return res.status(401).json({ error: 'Invalid nonce' });
        }

        // Verify signature
        const isValid = await verifySIWESignature(message, signature, address);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Clear nonce (one-time use)
        nonceStore.delete(normalizedAddress);

        // Generate JWT token
        const token = generateToken(normalizedAddress, stored.userId);

        console.log(`✅ Authenticated ${normalizedAddress}`);

        res.json({
            token,
            user: {
                address: normalizedAddress,
            },
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify signature' });
    }
});

export default router;
