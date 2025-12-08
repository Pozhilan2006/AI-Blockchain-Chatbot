import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider } from 'ethers';
import { getChainById } from '../config/chains';

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
            // Detect MetaMask
            const provider = await detectEthereumProvider();

            if (!provider) {
                throw new Error('MetaMask not detected. Please install MetaMask extension.');
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const address = accounts[0];

            // Get chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNumber = parseInt(chainId, 16);

            // Set up event listeners
            setupEventListeners();

            // Call onConnect callback
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

        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                // User disconnected
                window.location.reload();
            } else {
                // Account changed
                window.location.reload();
            }
        });

        // Handle chain changes
        window.ethereum.on('chainChanged', () => {
            // Reload page on chain change
            window.location.reload();
        });

        // Handle disconnect
        window.ethereum.on('disconnect', () => {
            window.location.reload();
        });
    }

    if (!hasMetaMask) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">MetaMask Not Found</h2>
                        <p className="text-gray-300 mb-6">
                            You need MetaMask to use this application. Please install the MetaMask browser extension.
                        </p>
                        <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Install MetaMask
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                <div className="text-center">
                    {/* Logo/Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">AI Web3 Chatbot</h1>
                    <p className="text-gray-300 mb-8">
                        Your intelligent assistant for blockchain transactions
                    </p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isConnecting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </span>
                        ) : (
                            'Connect Wallet'
                        )}
                    </button>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-4">Features:</p>
                        <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-300 text-sm">Send ETH & Tokens</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-300 text-sm">Swap Tokens</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-300 text-sm">Transfer NFTs</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-300 text-sm">AI-Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
