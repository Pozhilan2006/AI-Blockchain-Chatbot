import React, { useState } from 'react';
import { connectWallet } from '../utils/ethereum';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface ConnectWalletProps {
    onConnect: (address: string, chainId: number) => void;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    async function handleConnect() {
        setIsConnecting(true);
        setError('');
        try {
            const { address, chainId } = await connectWallet();
            onConnect(address, chainId);
        } catch (err: any) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    }

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 to-transparent blur-3xl pointer-events-none opacity-50" />

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-text-muted mb-8 animate-fade-in-up">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        System Operational
                    </div>

                    <h1 className="text-5xl font-medium text-white mb-6 tracking-tight leading-tight animate-fade-in-up [animation-delay:0.1s]">
                        Access your <br />
                        <span className="text-gradient-amber">Financial Intelligence.</span>
                    </h1>

                    <p className="text-text-muted text-lg max-w-sm mx-auto animate-fade-in-up [animation-delay:0.2s] font-light">
                        Securely connect your wallet to analyze, swap, and manage assets with AI precision.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-200 text-sm flex items-center gap-3 animate-fade-in-up">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-4 animate-fade-in-up [animation-delay:0.3s]">
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="group w-full h-16 bg-white text-black text-lg font-medium rounded-2xl hover:scale-[1.01] hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-8"
                    >
                        <span>{isConnecting ? 'Initializing...' : 'Connect Wallet'}</span>
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-text-dim text-xs mt-4">
                        <ShieldCheck size={14} />
                        <span>Non-custodial connection. Private keys never shared.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
