import React, { useState, useEffect } from 'react';
import { formatUnits } from 'ethers';
import { getProvider, getTokenBalance, getTokenMetadata } from '../utils/ethereum';
import { COMMON_TOKENS, getChainById } from '../config/chains';
import type { Token } from '../types';

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

            // Get native balance
            const balance = await provider.getBalance(address);
            setNativeBalance(formatUnits(balance, 18));

            // Get token balances
            const tokenAddresses = COMMON_TOKENS[chainId] || {};
            const tokenList: Token[] = [];

            for (const [symbol, tokenAddress] of Object.entries(tokenAddresses)) {
                try {
                    const metadata = await getTokenMetadata(tokenAddress);
                    const balance = await getTokenBalance(tokenAddress, address);
                    const balanceFormatted = formatUnits(balance, metadata.decimals);

                    if (parseFloat(balanceFormatted) > 0) {
                        tokenList.push({
                            ...metadata,
                            balance,
                            balanceFormatted,
                        });
                    }
                } catch (err) {
                    console.error(`Error loading ${symbol}:`, err);
                }
            }

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
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Wallet Balance</h3>
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Wallet Balance</h3>
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
                <button
                    onClick={loadBalances}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Native Balance */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">{chain?.nativeCurrency.symbol}</p>
                        <p className="text-white text-2xl font-bold">{parseFloat(nativeBalance).toFixed(4)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Token Balances */}
            {tokens.length > 0 && (
                <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-medium mb-2">Tokens</p>
                    {tokens.map((token) => (
                        <div
                            key={token.address}
                            className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{token.symbol}</p>
                                    <p className="text-gray-400 text-xs">{token.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-semibold">{parseFloat(token.balanceFormatted || '0').toFixed(4)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tokens.length === 0 && (
                <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No token balances found</p>
                </div>
            )}
        </div>
    );
};
