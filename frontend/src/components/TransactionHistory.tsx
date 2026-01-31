import React, { useState, useEffect } from 'react';
import { getBlockExplorerUrl } from '../config/chains';
import type { HistoricalTransaction } from '../types';
import { RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionHistoryProps {
    address: string;
    chainId: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address, chainId }) => {
    const [transactions] = useState<HistoricalTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Placeholder load
        setTimeout(() => setIsLoading(false), 500);
    }, [address, chainId]);

    function loadHistory() {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Recent Activity</h3>
                <button
                    onClick={loadHistory}
                    className={`text-text-dim hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {transactions.length === 0 ? (
                    <div className="text-left text-text-dim text-sm font-light">
                        No recent transactions found.
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.hash} className="group">
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-${tx.type === 'send' ? 'text-text-muted' : 'primary'}`}>
                                        {tx.type === 'send' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                    </span>
                                    <span className="text-text-main font-medium text-sm">
                                        {tx.type === 'send' ? 'Sent' : 'Received'} {tx.token || 'Asset'}
                                    </span>
                                </div>
                                <span className="text-text-main font-medium text-sm">
                                    {tx.value}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-text-dim">
                                <span>{new Date(tx.timestamp * 1000).toLocaleDateString()}</span>
                                <a
                                    href={getBlockExplorerUrl(chainId, 'tx', tx.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors hover:underline"
                                >
                                    View on scan
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
