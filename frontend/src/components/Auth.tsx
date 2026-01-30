import { useState } from 'react';
import axios from 'axios';
import { getSigner } from '../utils/ethereum';

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
            // Step 1: Request nonce from backend
            const nonceResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/nonce`, {
                address,
            });

            const { nonce } = nonceResponse.data;

            // Step 2: Create SIWE message
            const message = createSIWEMessage(address, nonce);

            // Step 3: Sign message with MetaMask
            const signer = await getSigner();
            const signature = await signer.signMessage(message);

            // Step 4: Verify signature on backend
            const verifyResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
                address,
                message,
                signature,
            });

            const { token } = verifyResponse.data;

            // Store token in localStorage
            localStorage.setItem('authToken', token);

            // Call onAuthenticated callback
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

        return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to AI Web3 Chatbot

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${timestamp}`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                    <p className="text-gray-300 mb-2">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                    <p className="text-gray-400 text-sm mb-6">
                        Sign a message to verify wallet ownership
                    </p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-left">
                                <p className="text-blue-200 text-sm font-medium mb-1">Secure Authentication</p>
                                <p className="text-blue-300 text-xs">
                                    This signature request will not trigger a blockchain transaction or cost any gas fees.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSignIn}
                        disabled={isAuthenticating}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isAuthenticating ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Waiting for signature...
                            </span>
                        ) : (
                            'Sign Message'
                        )}
                    </button>

                    <p className="text-gray-400 text-xs mt-4">
                        By signing in, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    );
};
