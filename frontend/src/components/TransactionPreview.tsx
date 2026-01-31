import React, { useState } from 'react';
import type { Intent } from '../types';
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
import { ArrowRight, Lock, Loader2, Check, AlertCircle } from 'lucide-react';

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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'preview' | 'confirming' | 'pending' | 'success' | 'failed'>('preview');

    const chain = getChainById(chainId);

    async function handleExecute() {
        setIsProcessing(true);
        setError('');
        setStatus('confirming');

        try {
            let tx;

            // Prepare transaction based on intent type
            switch (intent.intent) {
                case 'TRANSFER_ETH':
                    tx = await prepareEthTransfer(intent.params.recipient, intent.params.amount, chainId);
                    break;
                case 'TRANSFER_TOKEN':
                    const tokenAddress = getTokenAddress(intent.params.token, chainId);
                    if (!tokenAddress) throw new Error('Token not found');
                    const metadata = await getTokenMetadata(tokenAddress);
                    tx = await prepareERC20Transfer(tokenAddress, intent.params.recipient, intent.params.amount, metadata.decimals, chainId);
                    break;
                case 'SWAP_TOKENS':
                    const tokenInAddr = getTokenAddress(intent.params.tokenIn, chainId);
                    const tokenOutAddr = getTokenAddress(intent.params.tokenOut, chainId);
                    if (!tokenInAddr || !tokenOutAddr) throw new Error('Token not found');
                    const tokenInMeta = await getTokenMetadata(tokenInAddr);
                    const swapTxs = await prepareSwap(tokenInAddr, tokenOutAddr, intent.params.amountIn, tokenInMeta.decimals, intent.params.slippage || 0.5, chainId);
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
                    if (!buyTokenAddr) throw new Error('Token not found');
                    tx = await prepareBuyToken(buyTokenAddr, intent.params.amount, intent.params.slippage || 0.5, chainId);
                    break;
                case 'SELL_TOKEN':
                    const sellTokenAddr = getTokenAddress(intent.params.token, chainId);
                    if (!sellTokenAddr) throw new Error('Token not found');
                    const sellTokenMeta = await getTokenMetadata(sellTokenAddr);
                    const sellTxs = await prepareSellToken(sellTokenAddr, intent.params.amount, sellTokenMeta.decimals, intent.params.slippage || 0.5, chainId);
                    if (sellTxs.approvalTx) {
                        setStatus('confirming');
                        const approvalHash = await sendTransaction(sellTxs.approvalTx);
                        setStatus('pending');
                        await monitorTransaction(approvalHash);
                    }
                    tx = sellTxs.swapTx;
                    break;
                case 'TRANSFER_NFT':
                    tx = await prepareNFTTransfer(intent.params.contractAddress, address, intent.params.recipient, intent.params.tokenId, chainId);
                    break;
                default:
                    throw new Error(`Transaction type ${intent.intent} not supported`);
            }

            // Send transaction
            setStatus('confirming');
            const hash = await sendTransaction(tx!);
            setStatus('pending');

            // Monitor transaction
            const receipt = await monitorTransaction(hash);

            if (receipt.status === 1) {
                setStatus('success');
                setTimeout(() => onComplete(hash), 1500);
            } else {
                setStatus('failed');
                setError('Transaction reverted on-chain');
            }
        } catch (err: any) {
            console.error('Transaction error:', err);
            setError(err.message || 'Transaction failed');
            setStatus('failed');
        } finally {
            setIsProcessing(false);
        }
    }

    if (status !== 'preview') {
        return (
            <div className="w-full bg-[#121212] border border-[#222] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] animate-fade-in-up">
                {status === 'confirming' && (
                    <>
                        <div className="w-12 h-12 rounded-full border-4 border-[#222] border-t-primary animate-spin mb-6" />
                        <h3 className="text-xl font-medium text-white mb-2">Signature Required</h3>
                        <p className="text-text-muted text-sm">Please confirm in your wallet</p>
                    </>
                )}
                {status === 'pending' && (
                    <>
                        <div className="w-16 h-1 bg-[#222] rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-primary w-1/2 animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Broadcasting...</h3>
                        <p className="text-text-muted text-sm">Waiting for block confirmation</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Transaction Failed</h3>
                        <p className="text-red-400 text-sm mb-6">{error}</p>
                        <button onClick={onCancel} className="text-text-muted hover:text-white text-sm underline">Dismiss</button>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                            <Check size={24} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Success</h3>
                        <p className="text-text-muted text-sm">Transaction confirmed</p>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="w-full bg-[#121212] border border-[#222] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Ambient Header Gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-primary to-orange-600 opacity-80" />

            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-semibold text-white tracking-tight mb-1">
                            {intent.intent === 'SWAP_TOKENS' ? 'Swap Assets' :
                                intent.intent === 'TRANSFER_ETH' ? 'Transfer Funds' :
                                    'Execution Plan'}
                        </h3>
                        <p className="text-text-muted text-sm">Review transaction details before signing.</p>
                    </div>
                    <div className="px-3 py-1 bg-[#1A1A1A] rounded-full border border-[#333] text-[10px] font-bold tracking-widest text-text-muted uppercase">
                        {chain?.name || 'Unknown Chain'}
                    </div>
                </div>

                {/* Main Visual Intent */}
                <div className="flex items-center justify-between mb-10 px-4">
                    <div className="flex-1">
                        <div className="text-sm text-text-muted font-medium mb-1 uppercase tracking-wider">Send</div>
                        <div className="text-3xl font-medium text-white">
                            {intent.params.amount || intent.params.amountIn} <span className="text-text-dim text-lg">{intent.params.token || intent.params.tokenIn || 'ETH'}</span>
                        </div>
                    </div>

                    {(intent.params.tokenOut || intent.params.recipient) && (
                        <div className="flex items-center justify-center px-6">
                            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-text-muted border border-[#333]">
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    )}

                    {(intent.params.tokenOut || intent.params.recipient) && (
                        <div className="flex-1 text-right">
                            <div className="text-sm text-text-muted font-medium mb-1 uppercase tracking-wider">Receive</div>
                            {intent.params.tokenOut ? (
                                <div className="text-3xl font-medium text-white">
                                    <span className="text-sm text-text-dim">Est. </span>
                                    {/* Placeholder for estimated out, usually from quote */}
                                    ~ <span className="text-text-dim text-lg">{intent.params.tokenOut}</span>
                                </div>
                            ) : (
                                <div className="text-lg font-medium text-white truncate max-w-[150px] ml-auto">
                                    {intent.params.recipient.slice(0, 6)}...{intent.params.recipient.slice(-4)}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-[#222]">
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing}
                        className="flex-1 bg-white text-black h-14 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
                        Confirm & Sign
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-6 h-14 rounded-xl font-medium text-text-muted hover:text-white hover:bg-[#1A1A1A] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
