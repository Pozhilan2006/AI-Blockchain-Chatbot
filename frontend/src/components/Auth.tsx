import { useState } from 'react';
import axios from 'axios';
import { getSigner } from '../utils/ethereum';
import { Shield, ChevronRight, Lock } from 'lucide-react';

interface AuthProps {
    address: string;
    onAuthenticated: (token: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ address, onAuthenticated }) => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string>('');

    async function handleSignIn() {
        setIsAuthenticating(true);
        setError('');

        try {
            const nonceResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/nonce`, { address });
            const { nonce } = nonceResponse.data;
            const message = createSIWEMessage(address, nonce);
            const signer = await getSigner();
            const signature = await signer.signMessage(message);
            const verifyResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
                address,
                message,
                signature,
            });
            const { token } = verifyResponse.data;
            localStorage.setItem('authToken', token);
            onAuthenticated(token);
        } catch (err: any) {
            console.error('Authentication error:', err);
            setError(err.response?.data?.error || err.message || 'Authentication failed');
        } finally {
            setIsAuthenticating(false);
        }
    }

    function createSIWEMessage(address: string, nonce: string): string {
        const domain = window.location.host;
        const origin = window.location.origin;
        const timestamp = new Date().toISOString();
        return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to AI Web3 Chatbot\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${timestamp}`;
    }

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-bg-card border border-bg-border rounded-xl shadow-2xl p-8 relative overflow-hidden">

                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bg-card via-primary to-bg-card" />

                <div className="mb-8 text-center">
                    <div className="w-12 h-12 bg-bg-main border border-bg-border rounded-lg mx-auto flex items-center justify-center mb-4">
                        <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Secure Authentication</h2>
                    <p className="text-text-muted text-sm">Verify your identity to access the trading interface.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-bg-main border border-bg-border rounded p-4 flex items-center justify-between">
                        <span className="text-xs text-text-muted uppercase tracking-wider">Wallet Connected</span>
                        <span className="text-sm font-mono text-text-main bg-bg-card px-2 py-1 rounded border border-bg-border">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-primary-dim border border-primary/20 rounded">
                        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-text-main">Signature Request</p>
                            <p className="text-xs text-text-muted leading-relaxed">
                                You are signing a secure message to prove ownership. This will not trigger a blockchain transaction or cost gas.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignIn}
                        disabled={isAuthenticating}
                        className="w-full flex items-center justify-center gap-2 bg-text-main text-bg-main font-bold py-3.5 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isAuthenticating ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin"></span>
                                Verifying...
                            </span>
                        ) : (
                            <>
                                Sign Message <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-text-dim uppercase tracking-wider">
                        End-to-End Encrypted Session
                    </p>
                </div>
            </div>
        </div>
    );
};
