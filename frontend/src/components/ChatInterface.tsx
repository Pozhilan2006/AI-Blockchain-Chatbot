import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Intent } from '../types';
import { parseIntent, generateClarifyingQuestion, validateIntentParams, formatIntentDescription } from '../utils/ai';
import { TransactionPreview } from './TransactionPreview';
import { BalanceDisplay } from './BalanceDisplay';
import { TransactionHistory } from './TransactionHistory';
import { CryptoSidebar } from './CryptoSidebar';
import { getChainById } from '../config/chains';
import { formatAddress } from '../utils/ethereum';
import { Paperclip, Send, Bot, User } from 'lucide-react';

interface ChatInterfaceProps {
    address: string;
    chainId: number;
    authToken: string;
    onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ address, chainId }) => {
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

    function formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    return (
        <div className="flex h-screen w-full bg-brand-black overflow-hidden font-sans text-brand-text">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Header */}
                <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-white/10 bg-brand-black/95 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <Bot className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight">AI Web3 Assistant</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-brand-textMuted uppercase tracking-wider">Connected</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-brand-textMuted font-mono">
                            {formatAddress(address)}
                        </div>
                    </div>
                </header>

                {/* Messages Container */}
                <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 max-w-[85%] ${message.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${message.role === 'user'
                                    ? 'bg-brand-gray border-white/10'
                                    : 'bg-white/5 border-white/10'
                                    }`}>
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-brand-orange" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user'
                                        ? 'bg-brand-orange text-white rounded-tr-sm shadow-[0_4px_20px_rgba(255,77,0,0.2)]'
                                        : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-sm'
                                        }`}>
                                        {message.content.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < message.content.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <span className={`text-[10px] text-gray-600 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex gap-4 max-w-[85%] self-start">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-brand-orange" />
                                </div>
                                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                {/* Input Area (Sticky Bottom) */}
                <div className="flex-shrink-0 p-6 pt-2 bg-gradient-to-t from-brand-black via-brand-black to-transparent z-10">
                    <div className="max-w-3xl mx-auto relative">
                        <div className="flex items-center gap-2 p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transition-all focus-within:bg-white/10 focus-within:border-white/20">
                            <button className="p-3 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors" title="Attach">
                                <Paperclip className="w-5 h-5" />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about crypto prices, transfers, or swaps..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm px-2"
                                disabled={isProcessing}
                            />

                            <button
                                onClick={handleSend}
                                disabled={isProcessing || !input.trim()}
                                className="p-3 rounded-full bg-brand-orange text-white shadow-lg hover:bg-brand-orangeHover disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-600">AI can make mistakes. Verify important transactions.</span>
                        </div>
                    </div>
                </div>

                {/* Overlays (Balance, History, etc.) */}
                {(showTransactionPreview || showBalance || showHistory) && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-lg">
                            <button
                                onClick={() => {
                                    setShowTransactionPreview(false);
                                    setShowBalance(false);
                                    setShowHistory(false);
                                    setCurrentIntent(null);
                                }}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white"
                            >
                                Close
                            </button>

                            {showTransactionPreview && currentIntent && (
                                <TransactionPreview
                                    intent={currentIntent}
                                    address={address}
                                    chainId={chainId}
                                    onComplete={handleTransactionComplete}
                                    onCancel={handleTransactionCancel}
                                />
                            )}
                            {showBalance && <BalanceDisplay address={address} chainId={chainId} />}
                            {showHistory && <TransactionHistory address={address} chainId={chainId} />}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-[320px] flex-shrink-0 border-l border-white/5 bg-black/20 backdrop-blur-md">
                <CryptoSidebar currentChainId={chainId} />
            </div>
        </div>
    );
};
