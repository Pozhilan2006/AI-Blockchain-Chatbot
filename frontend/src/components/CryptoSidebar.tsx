import React, { useState, useEffect } from 'react';
import '../styles/crypto-sidebar.css';

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
        { symbol: 'MATIC', name: 'Polygon', price: 0.89, change24h: 5.67, icon: '◆' },
        { symbol: 'BNB', name: 'BNB', price: 315.20, change24h: 1.45, icon: '◉' },
        { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, icon: '$' },
        { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.02, icon: '₮' },
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
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    function formatPrice(price: number, symbol: string): string {
        if (symbol === 'USDC' || symbol === 'USDT') {
            return price.toFixed(4);
        }
        if (price < 1) {
            return price.toFixed(4);
        }
        if (price < 100) {
            return price.toFixed(2);
        }
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
        <div className="crypto-sidebar">
            {/* Network Status */}
            <div className="sidebar-section">
                <h3 className="sidebar-section__title">Network</h3>
                <div className="network-card" style={{ borderColor: currentNetwork.color }}>
                    <div className="network-card__icon" style={{ background: currentNetwork.color }}>
                        {currentNetwork.icon}
                    </div>
                    <div className="network-card__info">
                        <div className="network-card__name">{currentNetwork.name}</div>
                        <div className="network-card__status">
                            <span className="status-dot"></span>
                            Active
                        </div>
                    </div>
                </div>

                {/* Other Networks */}
                <div className="network-list">
                    {networks.filter(n => n.chainId !== currentChainId).map(network => (
                        <div key={network.chainId} className="network-item">
                            <div className="network-item__icon" style={{ background: network.color }}>
                                {network.icon}
                            </div>
                            <span className="network-item__name">{network.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Prices */}
            <div className="sidebar-section">
                <h3 className="sidebar-section__title">
                    Live Prices
                    <span className="live-indicator">
                        <span className="live-dot"></span>
                        LIVE
                    </span>
                </h3>
                <div className="price-list">
                    {prices.map(coin => (
                        <div key={coin.symbol} className="price-card">
                            <div className="price-card__header">
                                <div className="price-card__icon">{coin.icon}</div>
                                <div className="price-card__info">
                                    <div className="price-card__symbol">{coin.symbol}</div>
                                    <div className="price-card__name">{coin.name}</div>
                                </div>
                            </div>
                            <div className="price-card__data">
                                <div className="price-card__price">
                                    ${formatPrice(coin.price, coin.symbol)}
                                </div>
                                <div className={`price-card__change ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
                                    {coin.change24h >= 0 ? '↑' : '↓'} {Math.abs(coin.change24h).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="sidebar-section">
                <h3 className="sidebar-section__title">Market Stats</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card__label">Gas Price</div>
                        <div className="stat-card__value">
                            {(15 + Math.random() * 10).toFixed(0)} <span className="stat-card__unit">gwei</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__label">Block</div>
                        <div className="stat-card__value">
                            {(18500000 + Math.floor(Math.random() * 1000)).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
