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
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            {/* Status Section */}
            <div className="mb-8">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={12} /> Network Status
                </h3>
                <div className="p-4 rounded bg-bg-main border border-bg-border flex items-center justify-between group hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center text-sm border border-bg-border" style={{ background: `${currentNetwork.color}10`, color: currentNetwork.color, borderColor: `${currentNetwork.color}30` }}>
                            {currentNetwork.icon}
                        </div>
                        <div>
                            <div className="font-bold text-xs text-text-main uppercase tracking-wider">{currentNetwork.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-mono mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                Operational
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Prices */}
            <div className="flex-1">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 size={12} /> Live Market
                </h3>
                <div className="space-y-1">
                    {prices.map(coin => (
                        <div key={coin.symbol} className="flex items-center justify-between p-3 rounded hover:bg-bg-main transition-colors cursor-default group border border-transparent hover:border-bg-border">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded flex items-center justify-center text-text-muted text-[10px] bg-bg-main border border-bg-border">
                                    {coin.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-text-main">{coin.symbol}</div>
                                    <div className="text-[10px] text-text-dim">{coin.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-xs text-text-main">${formatPrice(coin.price)}</div>
                                <div className={`text-[10px] font-medium ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-8 pt-8 border-t border-bg-border">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Chain Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-bg-main border border-bg-border hover:border-text-dim transition-colors">
                        <div className="flex items-center gap-2 text-text-muted text-[10px] mb-1">
                            <Zap size={10} /> Gas (Gwei)
                        </div>
                        <div className="text-sm font-mono font-bold text-text-main">
                            {(15 + Math.random() * 10).toFixed(0)}
                        </div>
                    </div>
                    <div className="p-3 rounded bg-bg-main border border-bg-border hover:border-text-dim transition-colors">
                        <div className="flex items-center gap-2 text-text-muted text-[10px] mb-1">
                            <Box size={10} /> Block
                        </div>
                        <div className="text-xs font-mono font-bold text-text-main truncate">
                            18.5M
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
