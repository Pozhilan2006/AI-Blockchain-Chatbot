import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Command } from 'lucide-react';
import { processAIRequest } from '../utils/ai';
import { TransactionPreview } from './TransactionPreview';
import { TransactionHistory } from './TransactionHistory';
import { BalanceDisplay } from './BalanceDisplay';
import { CryptoSidebar } from './CryptoSidebar';
import type { ChatMessage } from '../types';

interface ChatInterfaceProps {
    address: string;
    chainId: number;
    onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ address, chainId, onLogout }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Greetings. I am your Web3 Portfolio Intelligence. How may I assist you with your assets today?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSend() {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await processAIRequest(inputValue, address, chainId);

            // Artificial delay for "Thinking" feel, makes it feel more "Intelligent" less "Bot"
            setTimeout(() => {
                const aiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date(),
                    intent: response.intent,
                    transaction: response.transaction,
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);

                if (response.intent && response.transaction) {
                    setActiveTransaction({
                        intent: response.intent,
                        tx: response.transaction
                    });
                }
            }, 800);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I encountered an issue processing that request. Please try again.",
                timestamp: new Date(),
            }]);
        }
    }

    function handleTransactionComplete(hash: string) {
        setActiveTransaction(null);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Transaction executed successfully. Hash: ${hash}`,
            timestamp: new Date(),
            status: 'success',
            txHash: hash
        }]);
    }

    return (
        <div className="flex h-screen w-full bg-bg-main overflow-hidden text-text-main relative selection:bg-primary/20">

            {/* Ambient Background Glows - Subtler & Centered */}
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />

            {/* LEFT SIDEBAR - Context & Navigation */}
            <div className="w-72 hidden lg:flex flex-col border-r border-bg-border/40 bg-bg-main/95 backdrop-blur-sm z-20 shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-bg-border/40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles size={16} />
                        </div>
                        <span className="font-semibold text-sm tracking-wide text-white">Counsellor AI</span>
                    </div>
                </div>

                <div className="p-5 border-b border-bg-border/40">
                    <BalanceDisplay address={address} chainId={chainId} />
                </div>

                <div className="flex-1 overflow-hidden">
                    <CryptoSidebar currentChainId={chainId} />
                </div>

                <div className="p-4 border-t border-bg-border/40">
                    <button
                        onClick={onLogout}
                        className="w-full py-3 px-4 rounded-lg text-xs font-medium text-text-dim hover:text-text-main hover:bg-white/5 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        Disconnect Wallet
                    </button>
                </div>
            </div>

            {/* CENTER MAIN AREA - Interaction Canvas */}
            <div className="flex-1 flex flex-col relative z-10 min-w-0 bg-transparent">

                {/* Header - Minimal & Anchored */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-bg-border/40 bg-bg-main/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                        Network Active
                    </div>
                    <div className="text-xs font-mono text-text-dim">
                        v1.0.4 • Secure Connection
                    </div>
                </header>

                {/* Messages - The Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-3xl mx-auto w-full px-8 py-10 flex flex-col gap-8">
                        {messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up group`}>

                                {/* Role Label - Subtle */}
                                <span className={`text-[10px] uppercase tracking-widest mb-2 font-bold opacity-60 ${msg.role === 'user' ? 'text-text-dim mr-1' : 'text-primary ml-1'}`}>
                                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                </span>

                                {/* Message Content - High Readability */}
                                <div className={`relative max-w-2xl text-[15px] leading-7 tracking-wide ${msg.role === 'user'
                                        ? 'text-text-muted text-right font-light'
                                        : 'text-text-main font-regular'
                                    }`}>
                                    {msg.content}

                                    {/* Link Transaction to Message visually if active */}
                                    {msg.role === 'assistant' && activeTransaction && idx === messages.length - 1 && (
                                        <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/50 to-transparent opacity-50" />
                                    )}
                                </div>

                                {/* Embedded Transaction Card */}
                                {msg.role === 'assistant' && activeTransaction && idx === messages.length - 1 && (
                                    <div className="mt-6 w-full max-w-xl animate-fade-in-up">
                                        <TransactionPreview
                                            intent={activeTransaction.intent}
                                            address={address}
                                            chainId={chainId}
                                            onComplete={handleTransactionComplete}
                                            onCancel={() => setActiveTransaction(null)}
                                        />
                                    </div>
                                )}

                                {/* Success State */}
                                {msg.role === 'assistant' && msg.status === 'success' && (
                                    <div className="mt-3 px-3 py-1.5 border border-green-500/20 bg-green-500/5 rounded-md inline-flex items-center gap-2 text-xs text-green-400 font-medium tracking-wide">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        Confirmed on Blockchain
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex flex-col items-start animate-fade-in-up ml-1">
                                <span className="text-[10px] uppercase tracking-widest mb-2 font-bold text-primary opacity-60">AI Assistant</span>
                                <div className="flex items-center gap-1.5 h-6">
                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-[bounce_1s_infinite_-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-[bounce_1s_infinite_-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-[bounce_1s_infinite]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* Input Area - Focal Point */}
                <div className="w-full border-t border-bg-border/40 bg-bg-main/80 backdrop-blur-xl p-6 pb-8 z-40">
                    <div className="max-w-3xl mx-auto relative cursor-text group" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.focus();
                    }}>
                        {/* Glow Effect on Focus */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-orange-600/30 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-md pointer-events-none" />

                        <div className="relative bg-[#0F0F0F] border border-bg-border rounded-xl flex items-center p-2 shadow-xl transition-all group-focus-within:border-primary/50 group-focus-within:bg-[#141414]">
                            <div className="pl-4 pr-3 text-text-dim group-focus-within:text-primary transition-colors">
                                <Command size={18} strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Describe a transaction or ask for balance..."
                                className="flex-1 bg-transparent border-none text-text-main text-[15px] placeholder-text-dim/50 focus:ring-0 p-3 outline-none font-medium tracking-wide"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-text-main text-bg-main rounded-lg hover:bg-white/90 transform hover:scale-105 transition-all disabled:opacity-0 disabled:scale-95 disabled:pointer-events-none shadow-lg shadow-white/5"
                            >
                                <Send size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <p className="text-[10px] text-text-dim/60 font-medium tracking-widest uppercase">
                                Enter to send • Securely Encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR - Secondary Info */}
            <div className="w-72 hidden xl:flex flex-col border-l border-bg-border/40 bg-bg-main/95 backdrop-blur-sm z-20 shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-bg-border/40">
                    <h3 className="text-[11px] font-bold tracking-widest uppercase text-text-muted">Activity Log</h3>
                </div>
                <div className="flex-1 overflow-hidden p-0">
                    <TransactionHistory address={address} chainId={chainId} />
                </div>
            </div>

        </div>
    );
};
