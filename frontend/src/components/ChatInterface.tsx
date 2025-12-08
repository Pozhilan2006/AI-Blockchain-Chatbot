import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Intent } from '../types';
import { parseIntent, generateClarifyingQuestion, validateIntentParams, formatIntentDescription } from '../utils/ai';
import { TransactionPreview } from './TransactionPreview';
import { BalanceDisplay } from './BalanceDisplay';
import { TransactionHistory } from './TransactionHistory';
import { getChainById } from '../config/chains';
import { formatAddress } from '../utils/ethereum';

interface ChatInterfaceProps {
    address: string;
    chainId: number;
    authToken: string;
    onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ address, chainId, authToken, onLogout }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI Web3 assistant. I can help you send ETH, transfer tokens, swap on DEXs, and manage your NFTs. What would you like to do?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
    const [showTransactionPreview, setShowTransactionPreview] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chain = getChainById(chainId);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    async function handleSend() {
        if (!input.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);

        try {
            // Parse intent from user message
            const intent = parseIntent(input, chain?.name.toLowerCase() || 'ethereum');

            // Handle different intents
            if (intent.intent === 'UNKNOWN') {
                addAssistantMessage('I\'m not sure what you want to do. You can ask me to send ETH, transfer tokens, swap tokens, check your balance, or show your transaction history.');
                setIsProcessing(false);
                return;
            }

            // Check for missing parameters
            if (intent.missingParams.length > 0) {
                const question = generateClarifyingQuestion(intent);
                addAssistantMessage(question);
                setCurrentIntent(intent);
                setIsProcessing(false);
                return;
            }

            // Validate parameters
            const validation = validateIntentParams(intent);
            if (!validation.valid) {
                addAssistantMessage(`Error: ${validation.errors.join(', ')}`);
                setIsProcessing(false);
                return;
            }

            // Handle special intents
            if (intent.intent === 'CHECK_BALANCE') {
                setShowBalance(true);
                addAssistantMessage('Here\'s your wallet balance:');
                setIsProcessing(false);
                return;
            }

            if (intent.intent === 'SHOW_ADDRESS') {
                addAssistantMessage(`Your wallet address is: ${address}\n\nYou can share this address to receive assets.`);
                setIsProcessing(false);
                return;
            }

            if (intent.intent === 'SHOW_HISTORY') {
                setShowHistory(true);
                addAssistantMessage('Here\'s your transaction history:');
                setIsProcessing(false);
                return;
            }

            // For transaction intents, show preview
            setCurrentIntent(intent);
            setShowTransactionPreview(true);
            addAssistantMessage(`I'll help you ${formatIntentDescription(intent)}. Please review the transaction details.`);

        } catch (error: any) {
            console.error('Error processing message:', error);
            addAssistantMessage(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    }

    function addAssistantMessage(content: string) {
        const message: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, message]);
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleTransactionComplete(txHash: string) {
        setShowTransactionPreview(false);
        setCurrentIntent(null);
        addAssistantMessage(`Transaction submitted successfully! Hash: ${txHash}`);
    }

    function handleTransactionCancel() {
        setShowTransactionPreview(false);
        setCurrentIntent(null);
        addAssistantMessage('Transaction cancelled.');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">AI Web3 Chatbot</h1>
                            <p className="text-gray-400 text-sm">{chain?.name || 'Unknown Chain'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-gray-400 text-xs">Connected</p>
                            <p className="text-white text-sm font-mono">{formatAddress(address)}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'bg-white/10 text-gray-100'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isProcessing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-white/10 p-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message... (e.g., 'Send 0.1 ETH to 0x...')"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isProcessing || !input.trim()}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setInput('What\'s my balance?')}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1 rounded-full transition-colors"
                                    >
                                        Check Balance
                                    </button>
                                    <button
                                        onClick={() => setInput('Show my address')}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1 rounded-full transition-colors"
                                    >
                                        Show Address
                                    </button>
                                    <button
                                        onClick={() => setInput('Show transaction history')}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1 rounded-full transition-colors"
                                    >
                                        History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {showBalance && <BalanceDisplay address={address} chainId={chainId} />}
                        {showHistory && <TransactionHistory address={address} chainId={chainId} />}
                        {showTransactionPreview && currentIntent && (
                            <TransactionPreview
                                intent={currentIntent}
                                address={address}
                                chainId={chainId}
                                onComplete={handleTransactionComplete}
                                onCancel={handleTransactionCancel}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
