import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface ConnectWalletProps {
    onConnect: (address: string, chainId: number) => void;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string>('');
    const [hasMetaMask, setHasMetaMask] = useState(false);

    useEffect(() => {
        checkMetaMask();
    }, []);

    async function checkMetaMask() {
        const provider = await detectEthereumProvider({ silent: true });
        setHasMetaMask(!!provider);
    }

    async function handleConnect() {
        setIsConnecting(true);
        setError('');

        try {
            const provider = await detectEthereumProvider();
            if (!provider) throw new Error('MetaMask not detected.');

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) throw new Error('No accounts found');
            const address = accounts[0];

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNumber = parseInt(chainId, 16);

            setupEventListeners();
            onConnect(address, chainIdNumber);
        } catch (err: any) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    }

    function setupEventListeners() {
        if (!window.ethereum) return;
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('disconnect', () => window.location.reload());
    }

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[100px] -z-10" />

            <div className="bg-brand-gray/30 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative">
                {/* Glow Line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="text-center">
                    <div className="w-16 h-16 bg-white/5  rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                        <Sparkles className="w-8 h-8 text-brand-orange" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Wrapper AI</h1>
                    <h2 className="text-gray-400 text-sm mb-8 uppercase tracking-widest">Intelligent Transaction Layer</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!hasMetaMask ? (
                        <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block bg-brand-orange hover:bg-brand-orangeHover text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:shadow-[0_0_30px_rgba(255,77,0,0.5)]"
                        >
                            Install MetaMask
                        </a>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full group bg-white text-black hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    Connect Wallet
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    )}

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="text-brand-orange text-xs font-bold mb-1">ZERO</div>
                            <div className="text-gray-400 text-xs">Latencey</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="text-brand-orange text-xs font-bold mb-1">100%</div>
                            <div className="text-gray-400 text-xs">Secure</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
