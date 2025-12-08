import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage (for development without database)
const transactionsStore = new Map<number, any[]>();

// POST /api/transactions/log - Log a transaction
router.post('/log', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { txHash, chain, type, amount, token, recipient } = req.body;
        const userId = req.user!.userId;

        if (!txHash || !chain || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const transaction = {
            txHash,
            chain,
            type,
            amount,
            token,
            recipient,
            status: 'pending',
            createdAt: new Date(),
        };

        if (!transactionsStore.has(userId)) {
            transactionsStore.set(userId, []);
        }

        transactionsStore.get(userId)!.push(transaction);

        console.log(`✅ Logged transaction ${txHash} for user ${userId}`);

        res.json({ success: true, message: 'Transaction logged' });
    } catch (error) {
        console.error('Transaction logging error:', error);
        res.status(500).json({ error: 'Failed to log transaction' });
    }
});

// GET /api/transactions/history - Get transaction history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const userTransactions = transactionsStore.get(userId) || [];
        const paginatedTransactions = userTransactions.slice(offset, offset + limit);

        res.json({
            transactions: paginatedTransactions,
            count: paginatedTransactions.length,
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
});

// PUT /api/transactions/:txHash/status - Update transaction status
router.put('/:txHash/status', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { txHash } = req.params;
        const { status } = req.body;
        const userId = req.user!.userId;

        if (!['pending', 'success', 'failed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const userTransactions = transactionsStore.get(userId) || [];
        const transaction = userTransactions.find(tx => tx.txHash === txHash);

        if (transaction) {
            transaction.status = status;
            console.log(`✅ Updated transaction ${txHash} status to ${status}`);
        }

        res.json({ success: true, message: 'Transaction status updated' });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update transaction status' });
    }
});

export default router;
