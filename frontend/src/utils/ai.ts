import type {
    Intent,
    IntentType,
    IntentSchema,
    TransferETHParams,
    TransferTokenParams,
    SwapTokensParams,
    BuyTokenParams,
    SellTokenParams,
    TransferNFTParams,
    TransactionRequest,
} from '../types';
import { validateAddress } from './ethereum';

// Intent schemas defining triggers and required parameters
export const INTENT_SCHEMAS: Record<IntentType, IntentSchema> = {
    TRANSFER_ETH: {
        triggers: ['send', 'transfer', 'pay'],
        requiredParams: ['amount', 'recipient'],
        optionalParams: ['chain'],
    },
    TRANSFER_TOKEN: {
        triggers: ['send', 'transfer'],
        requiredParams: ['amount', 'token', 'recipient'],
        optionalParams: ['chain'],
    },
    SWAP_TOKENS: {
        triggers: ['swap', 'exchange', 'trade'],
        requiredParams: ['amountIn', 'tokenIn', 'tokenOut'],
        optionalParams: ['slippage', 'chain'],
    },
    BUY_TOKEN: {
        triggers: ['buy', 'purchase'],
        requiredParams: ['amount', 'token'],
        optionalParams: ['chain'],
    },
    SELL_TOKEN: {
        triggers: ['sell'],
        requiredParams: ['amount', 'token'],
        optionalParams: ['chain'],
    },
    CHECK_BALANCE: {
        triggers: ['balance', 'how much', 'show'],
        requiredParams: [],
        optionalParams: ['token'],
    },
    TRANSFER_NFT: {
        triggers: ['send nft', 'transfer nft'],
        requiredParams: ['contractAddress', 'tokenId', 'recipient'],
        optionalParams: ['chain'],
    },
    SHOW_ADDRESS: {
        triggers: ['address', 'receive', 'deposit'],
        requiredParams: [],
        optionalParams: [],
    },
    SHOW_HISTORY: {
        triggers: ['history', 'transactions', 'activity'],
        requiredParams: [],
        optionalParams: [],
    },
    UNKNOWN: {
        triggers: [],
        requiredParams: [],
        optionalParams: [],
    },
};

// Extract Ethereum address from text
function extractAddress(text: string): string | null {
    // Match 0x followed by 40 hex characters
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const match = text.match(addressRegex);
    return match ? match[0] : null;
}

// Extract amount from text
function extractAmount(text: string): string | null {
    // Match numbers with optional decimals
    const amountRegex = /(\d+\.?\d*)/;
    const match = text.match(amountRegex);
    return match ? match[1] : null;
}

// Extract token symbol from text
function extractToken(text: string): string | null {
    const upperText = text.toUpperCase();
    const commonTokens = ['ETH', 'USDC', 'USDT', 'DAI', 'MATIC', 'BNB', 'WETH', 'WMATIC', 'WBNB'];

    for (const token of commonTokens) {
        if (upperText.includes(token)) {
            return token;
        }
    }

    return null;
}

// Extract chain from text
function extractChain(text: string): string | null {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('ethereum') || lowerText.includes('eth mainnet')) {
        return 'ethereum';
    }
    if (lowerText.includes('polygon') || lowerText.includes('matic')) {
        return 'polygon';
    }
    if (lowerText.includes('bsc') || lowerText.includes('binance')) {
        return 'bsc';
    }

    return null;
}

// Parse intent from user message
export function parseIntent(message: string, currentChain: string = 'ethereum'): Intent {
    const lowerMessage = message.toLowerCase();

    // Check for TRANSFER_ETH
    if (
        (lowerMessage.includes('send') || lowerMessage.includes('transfer') || lowerMessage.includes('pay')) &&
        (lowerMessage.includes('eth') || lowerMessage.includes('ether')) &&
        !lowerMessage.includes('token')
    ) {
        const amount = extractAmount(message);
        const recipient = extractAddress(message);
        const chain = extractChain(message) || currentChain;

        const params: TransferETHParams = {
            amount: amount || '',
            recipient: recipient || '',
            chain,
        };

        const missingParams: string[] = [];
        if (!amount) missingParams.push('amount');
        if (!recipient) missingParams.push('recipient');

        return {
            intent: 'TRANSFER_ETH',
            params,
            confidence: missingParams.length === 0 ? 0.9 : 0.6,
            missingParams,
        };
    }

    // Check for TRANSFER_TOKEN
    if (
        (lowerMessage.includes('send') || lowerMessage.includes('transfer')) &&
        !lowerMessage.includes('nft')
    ) {
        const token = extractToken(message);
        if (token && token !== 'ETH' && token !== 'MATIC' && token !== 'BNB') {
            const amount = extractAmount(message);
            const recipient = extractAddress(message);
            const chain = extractChain(message) || currentChain;

            const params: TransferTokenParams = {
                amount: amount || '',
                token,
                recipient: recipient || '',
                chain,
            };

            const missingParams: string[] = [];
            if (!amount) missingParams.push('amount');
            if (!recipient) missingParams.push('recipient');

            return {
                intent: 'TRANSFER_TOKEN',
                params,
                confidence: missingParams.length === 0 ? 0.9 : 0.6,
                missingParams,
            };
        }
    }

    // Check for SWAP_TOKENS
    if (lowerMessage.includes('swap') || lowerMessage.includes('exchange') || lowerMessage.includes('trade')) {
        const tokens = message.match(/\b(ETH|USDC|USDT|DAI|MATIC|BNB|WETH|WMATIC|WBNB)\b/gi);
        const amount = extractAmount(message);
        const chain = extractChain(message) || currentChain;

        let tokenIn = '';
        let tokenOut = '';

        if (tokens && tokens.length >= 2) {
            tokenIn = tokens[0].toUpperCase();
            tokenOut = tokens[1].toUpperCase();
        }

        // Detect "for" or "to" pattern
        const forMatch = message.match(/(\d+\.?\d*)\s*(\w+)\s+(?:for|to)\s+(\w+)/i);
        if (forMatch) {
            tokenIn = forMatch[2].toUpperCase();
            tokenOut = forMatch[3].toUpperCase();
        }

        const params: SwapTokensParams = {
            amountIn: amount || '',
            tokenIn,
            tokenOut,
            slippage: 0.5,
            chain,
        };

        const missingParams: string[] = [];
        if (!amount) missingParams.push('amountIn');
        if (!tokenIn) missingParams.push('tokenIn');
        if (!tokenOut) missingParams.push('tokenOut');

        return {
            intent: 'SWAP_TOKENS',
            params,
            confidence: missingParams.length === 0 ? 0.85 : 0.5,
            missingParams,
        };
    }

    // Check for BUY_TOKEN
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
        const token = extractToken(message);
        const amount = extractAmount(message);
        const chain = extractChain(message) || currentChain;

        const params: BuyTokenParams = {
            amount: amount || '',
            token: token || '',
            chain,
        };

        const missingParams: string[] = [];
        if (!amount) missingParams.push('amount');
        if (!token) missingParams.push('token');

        return {
            intent: 'BUY_TOKEN',
            params,
            confidence: missingParams.length === 0 ? 0.85 : 0.5,
            missingParams,
        };
    }

    // Check for SELL_TOKEN
    if (lowerMessage.includes('sell')) {
        const token = extractToken(message);
        const amount = extractAmount(message);
        const chain = extractChain(message) || currentChain;

        const params: SellTokenParams = {
            amount: amount || '',
            token: token || '',
            chain,
        };

        const missingParams: string[] = [];
        if (!amount) missingParams.push('amount');
        if (!token) missingParams.push('token');

        return {
            intent: 'SELL_TOKEN',
            params,
            confidence: missingParams.length === 0 ? 0.85 : 0.5,
            missingParams,
        };
    }

    // Check for CHECK_BALANCE
    if (
        lowerMessage.includes('balance') ||
        lowerMessage.includes('how much') ||
        (lowerMessage.includes('show') && lowerMessage.includes('balance'))
    ) {
        const token = extractToken(message);

        return {
            intent: 'CHECK_BALANCE',
            params: { token },
            confidence: 0.9,
            missingParams: [],
        };
    }

    // Check for TRANSFER_NFT
    if (lowerMessage.includes('nft') && (lowerMessage.includes('send') || lowerMessage.includes('transfer'))) {
        const contractAddress = extractAddress(message);
        const recipient = extractAddress(message);
        const tokenIdMatch = message.match(/#(\d+)/);
        const tokenId = tokenIdMatch ? tokenIdMatch[1] : '';
        const chain = extractChain(message) || currentChain;

        const params: TransferNFTParams = {
            contractAddress: contractAddress || '',
            tokenId,
            recipient: recipient || '',
            chain,
        };

        const missingParams: string[] = [];
        if (!contractAddress) missingParams.push('contractAddress');
        if (!tokenId) missingParams.push('tokenId');
        if (!recipient) missingParams.push('recipient');

        return {
            intent: 'TRANSFER_NFT',
            params,
            confidence: missingParams.length === 0 ? 0.8 : 0.4,
            missingParams,
        };
    }

    // Check for SHOW_ADDRESS
    if (
        lowerMessage.includes('address') ||
        lowerMessage.includes('receive') ||
        lowerMessage.includes('deposit') ||
        lowerMessage.includes('qr')
    ) {
        return {
            intent: 'SHOW_ADDRESS',
            params: {},
            confidence: 0.9,
            missingParams: [],
        };
    }

    // Check for SHOW_HISTORY
    if (
        lowerMessage.includes('history') ||
        lowerMessage.includes('transactions') ||
        lowerMessage.includes('activity')
    ) {
        return {
            intent: 'SHOW_HISTORY',
            params: {},
            confidence: 0.9,
            missingParams: [],
        };
    }

    // Unknown intent
    return {
        intent: 'UNKNOWN',
        params: {},
        confidence: 0,
        missingParams: [],
    };
}

// Generate clarifying question for missing parameters
export function generateClarifyingQuestion(intent: Intent): string {
    if (intent.missingParams.length === 0) {
        return '';
    }

    const param = intent.missingParams[0];

    switch (intent.intent) {
        case 'TRANSFER_ETH':
            if (param === 'amount') return 'How much ETH would you like to send?';
            if (param === 'recipient') return 'What is the recipient address?';
            break;

        case 'TRANSFER_TOKEN':
            if (param === 'amount') return `How many ${intent.params.token} tokens would you like to send?`;
            if (param === 'recipient') return 'What is the recipient address?';
            break;

        case 'SWAP_TOKENS':
            if (param === 'amountIn') return 'How much would you like to swap?';
            if (param === 'tokenIn') return 'Which token would you like to swap from?';
            if (param === 'tokenOut') return 'Which token would you like to swap to?';
            break;

        case 'BUY_TOKEN':
            if (param === 'amount') return 'How much would you like to buy?';
            if (param === 'token') return 'Which token would you like to buy?';
            break;

        case 'SELL_TOKEN':
            if (param === 'amount') return 'How much would you like to sell?';
            if (param === 'token') return 'Which token would you like to sell?';
            break;

        case 'TRANSFER_NFT':
            if (param === 'contractAddress') return 'What is the NFT contract address?';
            if (param === 'tokenId') return 'What is the token ID?';
            if (param === 'recipient') return 'What is the recipient address?';
            break;
    }

    return `I need more information. Please provide: ${intent.missingParams.join(', ')}`;
}

// Validate intent parameters
export function validateIntentParams(intent: Intent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (intent.intent) {
        case 'TRANSFER_ETH':
            const ethParams = intent.params as TransferETHParams;
            if (!ethParams.amount || isNaN(parseFloat(ethParams.amount))) {
                errors.push('Invalid amount');
            }
            if (!ethParams.recipient || !validateAddress(ethParams.recipient)) {
                errors.push('Invalid recipient address');
            }
            break;

        case 'TRANSFER_TOKEN':
            const tokenParams = intent.params as TransferTokenParams;
            if (!tokenParams.amount || isNaN(parseFloat(tokenParams.amount))) {
                errors.push('Invalid amount');
            }
            if (!tokenParams.recipient || !validateAddress(tokenParams.recipient)) {
                errors.push('Invalid recipient address');
            }
            if (!tokenParams.token) {
                errors.push('Token not specified');
            }
            break;

        case 'SWAP_TOKENS':
            const swapParams = intent.params as SwapTokensParams;
            if (!swapParams.amountIn || isNaN(parseFloat(swapParams.amountIn))) {
                errors.push('Invalid amount');
            }
            if (!swapParams.tokenIn || !swapParams.tokenOut) {
                errors.push('Tokens not specified');
            }
            if (swapParams.tokenIn === swapParams.tokenOut) {
                errors.push('Cannot swap same token');
            }
            break;

        case 'BUY_TOKEN':
        case 'SELL_TOKEN':
            const buyParams = intent.params as BuyTokenParams;
            if (!buyParams.amount || isNaN(parseFloat(buyParams.amount))) {
                errors.push('Invalid amount');
            }
            if (!buyParams.token) {
                errors.push('Token not specified');
            }
            break;

        case 'TRANSFER_NFT':
            const nftParams = intent.params as TransferNFTParams;
            if (!nftParams.contractAddress || !validateAddress(nftParams.contractAddress)) {
                errors.push('Invalid contract address');
            }
            if (!nftParams.recipient || !validateAddress(nftParams.recipient)) {
                errors.push('Invalid recipient address');
            }
            if (!nftParams.tokenId) {
                errors.push('Token ID not specified');
            }
            break;
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// Format intent as human-readable description
export function formatIntentDescription(intent: Intent): string {
    switch (intent.intent) {
        case 'TRANSFER_ETH':
            const ethParams = intent.params as TransferETHParams;
            return `Send ${ethParams.amount} ETH to ${ethParams.recipient}`;

        case 'TRANSFER_TOKEN':
            const tokenParams = intent.params as TransferTokenParams;
            return `Send ${tokenParams.amount} ${tokenParams.token} to ${tokenParams.recipient}`;

        case 'SWAP_TOKENS':
            const swapParams = intent.params as SwapTokensParams;
            return `Swap ${swapParams.amountIn} ${swapParams.tokenIn} for ${swapParams.tokenOut}`;

        case 'BUY_TOKEN':
            const buyParams = intent.params as BuyTokenParams;
            return `Buy ${buyParams.amount} ${buyParams.token}`;

        case 'SELL_TOKEN':
            const sellParams = intent.params as SellTokenParams;
            return `Sell ${sellParams.amount} ${sellParams.token}`;

        case 'CHECK_BALANCE':
            return intent.params.token ? `Check ${intent.params.token} balance` : 'Check balance';

        case 'TRANSFER_NFT':
            const nftParams = intent.params as TransferNFTParams;
            return `Transfer NFT #${nftParams.tokenId} to ${nftParams.recipient}`;

        case 'SHOW_ADDRESS':
            return 'Show wallet address';

        case 'SHOW_HISTORY':
            return 'Show transaction history';

        default:
            return 'Unknown action';
    }
}

interface AIResponse {
    message: string;
    intent?: Intent;
    transaction?: TransactionRequest | any; // using any for SwapTransaction flexibility
}

// Main AI processing function
export async function processAIRequest(input: string, address: string, chainId: number): Promise<AIResponse> {
    const chainName = chainId === 1 ? 'ethereum' : chainId === 137 ? 'polygon' : 'bsc';
    const intent = parseIntent(input, chainName);

    // If param check fails or missing params
    if (intent.missingParams.length > 0) {
        return {
            message: generateClarifyingQuestion(intent),
            intent,
        };
    }

    // Validate params
    const validation = validateIntentParams(intent);
    if (!validation.valid) {
        return {
            message: `I couldn't process that: ${validation.errors.join(', ')}. Could you clarify?`,
            intent
        };
    }

    // Respond based on intent
    try {
        switch (intent.intent) {
            case 'TRANSFER_ETH':
            case 'TRANSFER_TOKEN':
            case 'SWAP_TOKENS':
            case 'BUY_TOKEN':
            case 'SELL_TOKEN':
            case 'TRANSFER_NFT':
                return {
                    message: `I've prepared a transaction to ${formatIntentDescription(intent).toLowerCase()}. Please review and confirm below.`,
                    intent,
                    transaction: { to: '0x123' } // Placeholder, actual tx built in component
                };

            case 'CHECK_BALANCE':
                return {
                    message: intent.params.token
                        ? `Checking your ${intent.params.token} balance...`
                        : "Here is your current portfolio balance.",
                    intent
                };

            case 'SHOW_HISTORY':
                return {
                    message: "Pulling up your recent transaction history.",
                    intent
                };

            default:
                return {
                    message: "I'm not sure I understand. I can help you transfer assets, swap tokens, or check your balance.",
                    intent
                };
        }
    } catch (error: any) {
        return {
            message: `Something went wrong: ${error.message}`
        };
    }
}
