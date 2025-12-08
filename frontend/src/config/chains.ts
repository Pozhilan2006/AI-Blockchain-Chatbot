import { Chain } from '../types';

// Chain configurations
export const CHAINS: Record<string, Chain> = {
    ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: [
            `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
            `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
            'https://eth.llamarpc.com',
        ],
        blockExplorerUrls: ['https://etherscan.io'],
    },
    polygon: {
        chainId: 137,
        name: 'Polygon',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: [
            `https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
            'https://polygon-rpc.com',
            'https://rpc-mainnet.matic.network',
        ],
        blockExplorerUrls: ['https://polygonscan.com'],
    },
    bsc: {
        chainId: 56,
        name: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrls: [
            'https://bsc-dataseed.binance.org',
            'https://bsc-dataseed1.defibit.io',
            'https://bsc-dataseed1.ninicoin.io',
        ],
        blockExplorerUrls: ['https://bscscan.com'],
    },
};

// Get chain by chainId
export function getChainById(chainId: number): Chain | undefined {
    return Object.values(CHAINS).find(chain => chain.chainId === chainId);
}

// Get chain by name
export function getChainByName(name: string): Chain | undefined {
    const normalizedName = name.toLowerCase();
    return CHAINS[normalizedName] || Object.values(CHAINS).find(
        chain => chain.name.toLowerCase().includes(normalizedName)
    );
}

// Uniswap V2 Router addresses
export const UNISWAP_V2_ROUTER: Record<number, string> = {
    1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Ethereum
    137: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // Polygon (QuickSwap)
    56: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // BSC (PancakeSwap)
};

// WETH/WMATIC/WBNB addresses
export const WRAPPED_NATIVE_TOKEN: Record<number, string> = {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
};

// Common token addresses
export const COMMON_TOKENS: Record<number, Record<string, string>> = {
    1: { // Ethereum
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    137: { // Polygon
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    56: { // BSC
        USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        USDT: '0x55d398326f99059fF775485246999027B3197955',
        DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
        WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
};

// Get token address by symbol and chain
export function getTokenAddress(symbol: string, chainId: number): string | undefined {
    const upperSymbol = symbol.toUpperCase();
    return COMMON_TOKENS[chainId]?.[upperSymbol];
}

// Block explorer API keys
export const BLOCK_EXPLORER_API_KEYS: Record<number, string> = {
    1: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
    137: import.meta.env.VITE_POLYGONSCAN_API_KEY || '',
    56: import.meta.env.VITE_BSCSCAN_API_KEY || '',
};

// Get block explorer URL
export function getBlockExplorerUrl(chainId: number, type: 'tx' | 'address' | 'token', value: string): string {
    const chain = getChainById(chainId);
    if (!chain) return '';

    const baseUrl = chain.blockExplorerUrls[0];
    switch (type) {
        case 'tx':
            return `${baseUrl}/tx/${value}`;
        case 'address':
            return `${baseUrl}/address/${value}`;
        case 'token':
            return `${baseUrl}/token/${value}`;
        default:
            return baseUrl;
    }
}

// Gas settings
export const GAS_BUFFER_PERCENTAGE = 20; // Add 20% to estimated gas
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 50; // 50%
export const DEFAULT_DEADLINE_MINUTES = 20;

// Safety limits
export const SUSPICIOUS_AMOUNT_THRESHOLD = 0.5; // 50% of balance
export const HIGH_SLIPPAGE_WARNING = 5; // 5%
export const HIGH_PRICE_IMPACT_WARNING = 10; // 10%
export const DEFAULT_DAILY_LIMIT_USD = 10000;

// Known scam addresses (example - should be maintained in database)
export const BLOCKLIST: string[] = [
    // Add known scam addresses here
    '0x0000000000000000000000000000000000000000',
];

// Check if address is blocklisted
export function isBlocklisted(address: string): boolean {
    return BLOCKLIST.includes(address.toLowerCase());
}
