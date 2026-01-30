import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, Box, Zap } from 'lucide-react';

interface CryptoPrice {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    icon: string;
}

interface Network {
    name: string;
    chainId: number;
    color: string;
    icon: string;
}

export const CryptoSidebar: React.FC<{ currentChainId: number }> = ({ currentChainId }) => {
    const [prices, setPrices] = useState<CryptoPrice[]>([
        { symbol: 'ETH', name: 'Ethereum', price: 2250.45, change24h: 2.34, icon: '⟠' },
        { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change24h: -1.23, icon: '₿' },
        { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: 8.12, icon: '◎' },
        { symbol: 'MATIC', name: 'Polygon', price: 0.89, change24h: 5.67, icon: '◆' },
        { symbol: 'BNB', name: 'BNB', price: 315.20, change24h: 1.45, icon: '◉' },
    ]);

    const networks: Network[] = [
        { name: 'Ethereum', chainId: 1, color: '#627EEA', icon: '⟠' },
        { name: 'Polygon', chainId: 137, color: '#8247E5', icon: '◆' },
        { name: 'BSC', chainId: 56, color: '#F3BA2F', icon: '◉' },
    ];

    const currentNetwork = networks.find(n => n.chainId === currentChainId) || networks[0];

    // Simulate live price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPrices(prev => prev.map(coin => ({
                ...coin,
                price: coin.price * (1 + (Math.random() - 0.5) * 0.002),
                change24h: coin.change24h + (Math.random() - 0.5) * 0.1,
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    function formatPrice(price: number): string {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            {/* Status Section */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14} /> Network Status
                </h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner" style={{ background: `${currentNetwork.color}20`, color: currentNetwork.color }}>
                            {currentNetwork.icon}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-200">{currentNetwork.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                Operational
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Prices */}
            <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 size={14} /> Live Market
                </h3>
                <div className="space-y-2">
                    {prices.map(coin => (
                        <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs border border-white/5 group-hover:border-white/20 transition-colors">
                                    {coin.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-gray-200">{coin.symbol}</div>
                                    <div className="text-[10px] text-gray-500">{coin.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-sm text-gray-300">${formatPrice(coin.price)}</div>
                                <div className={`text-[10px] font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Chain Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Zap size={12} /> Gas (Gwei)
                        </div>
                        <div className="text-lg font-mono font-bold text-white">
                            {(15 + Math.random() * 10).toFixed(0)}
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Box size={12} /> Block
                        </div>
                        <div className="text-sm font-mono font-bold text-white truncate">
                            18.5M
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
