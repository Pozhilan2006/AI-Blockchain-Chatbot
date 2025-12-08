import React, { useState } from 'react';
import type { Intent, TransactionConfirmation } from '../types';
import {
    prepareEthTransfer,
    prepareERC20Transfer,
    prepareNFTTransfer,
    prepareSwap,
    prepareBuyToken,
    prepareSellToken,
    sendTransaction,
    monitorTransaction,
    getTokenMetadata,
} from '../utils/ethereum';
import { getTokenAddress, getChainById } from '../config/chains';
import { formatUnits } from 'ethers';

interface TransactionPreviewProps {
    intent: Intent;
    address: string;
    chainId: number;
    onComplete: (txHash: string) => void;
    onCancel: () => void;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
    intent,
    address,
    chainId,
    onComplete,
    onCancel,
}) => {
    const [confirmText, setConfirmText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState('');
    const [status, setStatus] = useState<'preview' | 'confirming' | 'pending' | 'success' | 'failed'>('preview');

    async function handleConfirm() {
        if (confirmText.toUpperCase() !== 'CONFIRM') {
            setError('Please type CONFIRM to proceed');
            return;
        }

        setIsProcessing(true);
        setError('');
        setStatus('confirming');

        try {
            let tx;

            // Prepare transaction based on intent type
            switch (intent.intent) {
                case 'TRANSFER_ETH':
                    tx = await prepareEthTransfer(
                        intent.params.recipient,
                        intent.params.amount,
                        chainId
                    );
                    break;

                case 'TRANSFER_TOKEN':
                    const tokenAddress = getTokenAddress(intent.params.token, chainId);
                    if (!tokenAddress) {
                        throw new Error('Token not found');
                    }
                    const metadata = await getTokenMetadata(tokenAddress);
                    tx = await prepareERC20Transfer(
                        tokenAddress,
                        intent.params.recipient,
                        intent.params.amount,
                        metadata.decimals,
                        chainId
                    );
                    break;

                case 'SWAP_TOKENS':
                    const tokenInAddr = getTokenAddress(intent.params.tokenIn, chainId);
                    const tokenOutAddr = getTokenAddress(intent.params.tokenOut, chainId);
                    if (!tokenInAddr || !tokenOutAddr) {
                        throw new Error('Token not found');
                    }
                    const tokenInMeta = await getTokenMetadata(tokenInAddr);
                    const swapTxs = await prepareSwap(
                        tokenInAddr,
                        tokenOutAddr,
                        intent.params.amountIn,
                        tokenInMeta.decimals,
                        intent.params.slippage || 0.5,
                        chainId
                    );

                    // If approval needed, send approval first
                    if (swapTxs.approvalTx) {
                        setStatus('confirming');
                        const approvalHash = await sendTransaction(swapTxs.approvalTx);
                        setStatus('pending');
                        await monitorTransaction(approvalHash);
                    }

                    tx = swapTxs.swapTx;
                    break;

                case 'BUY_TOKEN':
                    const buyTokenAddr = getTokenAddress(intent.params.token, chainId);
                    if (!buyTokenAddr) {
                        throw new Error('Token not found');
                    }
                    tx = await prepareBuyToken(
                        buyTokenAddr,
                        intent.params.amount,
                        intent.params.slippage || 0.5,
                        chainId
                    );
                    break;

                case 'SELL_TOKEN':
                    const sellTokenAddr = getTokenAddress(intent.params.token, chainId);
                    if (!sellTokenAddr) {
                        throw new Error('Token not found');
                    }
                    const sellTokenMeta = await getTokenMetadata(sellTokenAddr);
                    const sellTxs = await prepareSellToken(
                        sellTokenAddr,
                        intent.params.amount,
                        sellTokenMeta.decimals,
                        intent.params.slippage || 0.5,
                        chainId
                    );

                    // If approval needed, send approval first
                    if (sellTxs.approvalTx) {
                        setStatus('confirming');
                        const approvalHash = await sendTransaction(sellTxs.approvalTx);
                        setStatus('pending');
                        await monitorTransaction(approvalHash);
                    }

                    tx = sellTxs.swapTx;
                    break;

                case 'TRANSFER_NFT':
                    tx = await prepareNFTTransfer(
                        intent.params.contractAddress,
                        address,
                        intent.params.recipient,
                        intent.params.tokenId,
                        chainId
                    );
                    break;

                default:
                    throw new Error('Unsupported transaction type');
            }

            // Send transaction
            setStatus('confirming');
            const hash = await sendTransaction(tx);
            setTxHash(hash);
            setStatus('pending');

            // Monitor transaction
            const receipt = await monitorTransaction(hash);

            if (receipt.status === 1) {
                setStatus('success');
                setTimeout(() => onComplete(hash), 2000);
            } else {
                setStatus('failed');
                setError('Transaction failed');
            }
        } catch (err: any) {
            console.error('Transaction error:', err);
            setError(err.message || 'Transaction failed');
            setStatus('failed');
        } finally {
            setIsProcessing(false);
        }
    }

    const chain = getChainById(chainId);

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Transaction Preview</h3>

            {status === 'preview' && (
                <>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Action:</span>
                            <span className="text-white font-semibold">{intent.intent.replace(/_/g, ' ')}</span>
                        </div>

                        {intent.params.amount && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount:</span>
                                <span className="text-white font-semibold">{intent.params.amount} {intent.params.token || chain?.nativeCurrency.symbol}</span>
                            </div>
                        )}

                        {intent.params.recipient && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Recipient:</span>
                                <span className="text-white font-mono text-sm">{intent.params.recipient.slice(0, 10)}...{intent.params.recipient.slice(-8)}</span>
                            </div>
                        )}

                        {intent.params.tokenIn && intent.params.tokenOut && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">From:</span>
                                    <span className="text-white font-semibold">{intent.params.tokenIn}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">To:</span>
                                    <span className="text-white font-semibold">{intent.params.tokenOut}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-400">Chain:</span>
                            <span className="text-white">{chain?.name}</span>
                        </div>

                        {intent.params.slippage && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Slippage Tolerance:</span>
                                <span className="text-white">{intent.params.slippage}%</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <p className="text-yellow-200 text-sm font-medium mb-2">⚠️ Confirmation Required</p>
                        <p className="text-yellow-300 text-xs">
                            Type <strong>CONFIRM</strong> below to proceed with this transaction. This action cannot be undone.
                        </p>
                    </div>

                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type CONFIRM"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        disabled={isProcessing}
                    />

                    <div className="flex space-x-3">
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing || confirmText.toUpperCase() !== 'CONFIRM'}
                            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Transaction'}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}

            {status === 'confirming' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-semibold mb-2">Waiting for confirmation...</p>
                    <p className="text-gray-400 text-sm">Please confirm the transaction in MetaMask</p>
                </div>
            )}

            {status === 'pending' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-semibold mb-2">Transaction Pending...</p>
                    <p className="text-gray-400 text-sm">Waiting for blockchain confirmation</p>
                    {txHash && (
                        <p className="text-blue-400 text-xs mt-2 font-mono">{txHash.slice(0, 20)}...</p>
                    )}
                </div>
            )}

            {status === 'success' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-white font-semibold mb-2">Transaction Successful!</p>
                    <p className="text-gray-400 text-sm">Your transaction has been confirmed</p>
                </div>
            )}

            {status === 'failed' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p className="text-white font-semibold mb-2">Transaction Failed</p>
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={onCancel}
                        className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};
