import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Intent } from '../types';
import { parseIntent, generateClarifyingQuestion, validateIntentParams, formatIntentDescription } from '../utils/ai';
import { TransactionPreview } from './TransactionPreview';
import { BalanceDisplay } from './BalanceDisplay';
import { TransactionHistory } from './TransactionHistory';
import { CryptoSidebar } from './CryptoSidebar';
import { getChainById } from '../config/chains';
import { formatAddress } from '../utils/ethereum';
import '../styles/chat-interface.css';
import '../styles/crypto-sidebar.css';
import '../styles/message-bubbles.css';

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

    function formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    function getInitials(addr: string): string {
        return addr.slice(2, 4).toUpperCase();
    }

    return (
        <div className="chat-interface">
            <div className="chat-interface__main">
                {/* Header */}
                <header className="chat-interface__header">
                    <div className="header__left">
                        <div className="header__logo">
                            🤖
                        </div>
                        <h1 className="header__title">AI Web3 Assistant</h1>
                    </div>

                    <div className="header__right">
                        <div className="status-indicator">
                            <span className="status-indicator__dot"></span>
                            <span className="status-indicator__text">Connected</span>
                        </div>

                        <div className="wallet-address" title="Click to copy">
                            {formatAddress(address)}
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <main className="chat-interface__messages">
                    <div className="messages__container">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message message--${message.role === 'user' ? 'user' : 'ai'}`}
                            >
                                <div className="message__avatar">
                                    {message.role === 'user' ? getInitials(address) : '🤖'}
                                </div>
                                <div className="message__content">
                                    <div className="message__text">
                                        {message.content.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < message.content.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="message__timestamp">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="typing-indicator">
                                <div className="typing-indicator__avatar">
                                    🤖
                                </div>
                                <div className="typing-indicator__content">
                                    <span className="typing-indicator__dot"></span>
                                    <span className="typing-indicator__dot"></span>
                                    <span className="typing-indicator__dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </main>

                {/* Input Bar */}
                <footer className="chat-interface__input-bar">
                    <button className="input-bar__attach" aria-label="Attach file" title="Attach file">
                        📎
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        className="input-bar__field"
                        disabled={isProcessing}
                        aria-label="Type your message"
                    />

                    <button
                        onClick={handleSend}
                        disabled={isProcessing || !input.trim()}
                        className="input-bar__send"
                        aria-label="Send message"
                    >
                        🚀
                    </button>
                </footer>

                {/* Transaction Preview Modal (Overlay) */}
                {showTransactionPreview && currentIntent && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <TransactionPreview
                            intent={currentIntent}
                            address={address}
                            chainId={chainId}
                            onComplete={handleTransactionComplete}
                            onCancel={handleTransactionCancel}
                        />
                    </div>
                )}

                {/* Balance Display (Overlay) */}
                {showBalance && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{ position: 'relative', maxWidth: '500px', width: '100%' }}>
                            <button
                                onClick={() => setShowBalance(false)}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#F6851B',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    zIndex: 1001
                                }}
                            >
                                ×
                            </button>
                            <BalanceDisplay address={address} chainId={chainId} />
                        </div>
                    </div>
                )}

                {/* Transaction History (Overlay) */}
                {showHistory && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{ position: 'relative', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#F6851B',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    zIndex: 1001
                                }}
                            >
                                ×
                            </button>
                            <TransactionHistory address={address} chainId={chainId} />
                        </div>
                    </div>
                )}
            </div>

            {/* Crypto Sidebar */}
            <CryptoSidebar currentChainId={chainId} />
        </div>
    );
};
