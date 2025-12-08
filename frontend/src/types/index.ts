// Core blockchain types
export interface Chain {
    chainId: number;
    name: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrl?: string;
}

export interface TransactionRequest {
    to: string;
    from: string;
    value?: string;
    data?: string;
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
    chainId: number;
}

export interface TransactionReceipt {
    transactionHash: string;
    blockNumber: number;
    blockHash: string;
    from: string;
    to: string;
    gasUsed: string;
    status: number;
    logs: any[];
}

// Token types
export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    balance?: string;
    balanceFormatted?: string;
    usdValue?: number;
}

export interface NFT {
    contractAddress: string;
    tokenId: string;
    tokenType: 'ERC-721' | 'ERC-1155';
    name?: string;
    description?: string;
    imageUrl?: string;
    amount?: string; // For ERC-1155
}

// Intent types
export type IntentType =
    | 'TRANSFER_ETH'
    | 'TRANSFER_TOKEN'
    | 'SWAP_TOKENS'
    | 'BUY_TOKEN'
    | 'SELL_TOKEN'
    | 'CHECK_BALANCE'
    | 'TRANSFER_NFT'
    | 'SHOW_ADDRESS'
    | 'SHOW_HISTORY'
    | 'UNKNOWN';

export interface Intent {
    intent: IntentType;
    params: Record<string, any>;
    confidence: number;
    missingParams: string[];
}

export interface IntentSchema {
    triggers: string[];
    requiredParams: string[];
    optionalParams: string[];
}

// Transaction intent params
export interface TransferETHParams {
    amount: string;
    recipient: string;
    chain?: string;
}

export interface TransferTokenParams {
    amount: string;
    token: string;
    recipient: string;
    chain?: string;
}

export interface SwapTokensParams {
    amountIn: string;
    tokenIn: string;
    tokenOut: string;
    slippage?: number;
    chain?: string;
}

export interface BuyTokenParams {
    amount: string;
    token: string;
    chain?: string;
}

export interface SellTokenParams {
    amount: string;
    token: string;
    chain?: string;
}

export interface TransferNFTParams {
    contractAddress: string;
    tokenId: string;
    recipient: string;
    chain?: string;
}

// Swap types
export interface SwapQuote {
    amountIn: string;
    amountOut: string;
    amountOutMin: string;
    path: string[];
    priceImpact: number;
    slippage: number;
}

export interface SwapTransaction {
    approvalTx?: TransactionRequest;
    swapTx: TransactionRequest;
    quote: SwapQuote;
}

// Confirmation types
export interface TransactionConfirmation {
    action: string;
    amount: string;
    fiatValue?: string;
    token?: string;
    chain: string;
    gasEstimate: string;
    gasEstimateUSD?: string;
    recipient: string;
    slippage?: number;
    deadline?: number;
    confirmed: boolean;
    confirmedAt?: string;
    warnings?: string[];
}

// User types
export interface User {
    address: string;
    chainId: number;
    isAuthenticated: boolean;
    token?: string;
}

// Chat types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    intent?: Intent;
    transaction?: TransactionRequest;
    txHash?: string;
    status?: 'pending' | 'success' | 'failed';
}

// Balance types
export interface WalletBalance {
    nativeBalance: string;
    nativeBalanceFormatted: string;
    nativeBalanceUSD?: number;
    tokens: Token[];
    nfts: NFT[];
    totalUSD?: number;
}

// Transaction history types
export interface HistoricalTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
    status: 'success' | 'failed' | 'pending';
    type: 'send' | 'receive' | 'swap' | 'approval' | 'contract';
    token?: string;
    gasUsed?: string;
    gasFee?: string;
}

// Safety types
export interface SafetyCheck {
    type: 'suspicious_amount' | 'new_recipient' | 'high_slippage' | 'high_gas' | 'unlimited_approval' | 'blocklist';
    severity: 'warning' | 'error';
    message: string;
}

export interface DailyLimit {
    limit: number; // USD
    used: number; // USD
    remaining: number; // USD
    resetAt: Date;
}

// API response types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface NonceResponse {
    nonce: string;
    expiresAt: string;
}

export interface AuthResponse {
    token: string;
    user: {
        address: string;
    };
}

export interface PriceResponse {
    symbol: string;
    usd: number;
    lastUpdated: string;
}

export interface TokenMetadata {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply?: string;
}

// Error types
export interface BlockchainError {
    code: string;
    message: string;
    reason?: string;
    transaction?: TransactionRequest;
}
