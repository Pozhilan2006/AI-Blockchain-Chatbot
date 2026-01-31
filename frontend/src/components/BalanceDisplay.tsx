import React, { useState, useEffect } from 'react';
import { formatUnits } from 'ethers';
import { getProvider } from '../utils/ethereum';
import { getChainById } from '../config/chains';
import type { Token } from '../types';
import { Wallet, RefreshCw } from 'lucide-react';

interface BalanceDisplayProps {
    address: string;
    chainId: number;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ address, chainId }) => {
    const [nativeBalance, setNativeBalance] = useState('0');
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const chain = getChainById(chainId);

    useEffect(() => {
        loadBalances();
    }, [address, chainId]);

    async function loadBalances() {
        setIsLoading(true);
        setError('');

        try {
            const provider = await getProvider();
            const balance = await provider.getBalance(address);
            setNativeBalance(formatUnits(balance, 18));

            // Simplified for display speed in mockup
            // Real implementation would look up tokens
            const tokenList: Token[] = [];

            setTokens(tokenList);
        } catch (err: any) {
            console.error('Error loading balances:', err);
            setError('Failed to load balances');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="w-full py-4 flex justify-center">
                <div className="w-4 h-4 border-2 border-bg-border border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-3 bg-red-900/10 border border-red-900/20 rounded text-red-400 text-xs">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <Wallet size={12} className="text-primary" />
                    Portfolio
                </h3>
                <button
                    onClick={loadBalances}
                    className="text-text-dim hover:text-text-main transition-colors"
                >
                    <RefreshCw size={12} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Native Balance */}
                <div className="bg-bg-card/30 border border-bg-border/60 rounded-lg p-3">
                    <p className="text-text-dim text-[10px] uppercase tracking-wider mb-1">Total Equity</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-text-main tracking-tight">{parseFloat(nativeBalance).toFixed(4)}</span>
                        <span className="text-xs text-text-muted font-medium">{chain?.nativeCurrency.symbol}</span>
                    </div>
                </div>

                {/* Tokens (Compact) */}
                {tokens.length > 0 && (
                    <div className="space-y-1">
                        {tokens.map((token) => (
                            <div
                                key={token.address}
                                className="flex justify-between items-center py-1.5 px-2 hover:bg-white/5 rounded transition-colors cursor-default"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                    <div>
                                        <p className="text-text-main font-medium text-xs">{token.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-text-muted font-mono text-xs">{parseFloat(token.balanceFormatted || '0').toFixed(4)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tokens.length === 0 && (
                    <div className="text-center py-2 text-text-dim text-[10px] italic">
                        No active assets detected.
                    </div>
                )}
            </div>
        </div>
    );
};
