import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBlockExplorerUrl } from '../config/chains';
import type { HistoricalTransaction } from '../types';

interface TransactionHistoryProps {
    address: string;
    chainId: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address, chainId }) => {
    const [transactions, setTransactions] = useState<HistoricalTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHistory();
    }, [address, chainId]);

    async function loadHistory() {
        setIsLoading(true);
        setError('');

        try {
            // In a real implementation, this would call the backend API
            // For now, we'll show a placeholder
            setTransactions([]);
        } catch (err: any) {
            console.error('Error loading history:', err);
            setError('Failed to load transaction history');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                <button
                    onClick={loadHistory}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">No transactions yet</p>
                    <p className="text-gray-500 text-xs mt-1">Your transaction history will appear here</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.map((tx) => (
                        <a
                            key={tx.hash}
                            href={getBlockExplorerUrl(chainId, 'tx', tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                    {tx.type === 'send' ? '↑ Sent' : '↓ Received'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${tx.status === 'success' ? 'bg-green-500/20 text-green-300' :
                                        tx.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                            'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 font-mono">{tx.hash.slice(0, 10)}...</span>
                                <span className="text-white font-semibold">{tx.value} {tx.token || 'ETH'}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(tx.timestamp * 1000).toLocaleString()}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};
