// ERC-20 Token ABI (minimal)
export const ERC20_ABI = [
    // Read functions
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',

    // Write functions
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',

    // Events
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// ERC-721 NFT ABI (minimal)
export const ERC721_ABI = [
    // Read functions
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',

    // Write functions
    'function approve(address to, uint256 tokenId)',
    'function setApprovalForAll(address operator, bool approved)',
    'function transferFrom(address from, address to, uint256 tokenId)',
    'function safeTransferFrom(address from, address to, uint256 tokenId)',
    'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',

    // Events
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

// ERC-1155 Multi-Token ABI (minimal)
export const ERC1155_ABI = [
    // Read functions
    'function uri(uint256 id) view returns (string)',
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
    'function isApprovedForAll(address account, address operator) view returns (bool)',

    // Write functions
    'function setApprovalForAll(address operator, bool approved)',
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
    'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',

    // Events
    'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
    'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
    'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
    'event URI(string value, uint256 indexed id)',
];

// Uniswap V2 Router ABI (minimal)
export const UNISWAP_V2_ROUTER_ABI = [
    // Read functions
    'function factory() view returns (address)',
    'function WETH() view returns (address)',
    'function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)',
    'function getAmountsIn(uint amountOut, address[] path) view returns (uint[] amounts)',

    // Write functions - Token to Token
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)',
    'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] path, address to, uint deadline) returns (uint[] amounts)',

    // Write functions - ETH to Token
    'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)',
    'function swapETHForExactTokens(uint amountOut, address[] path, address to, uint deadline) payable returns (uint[] amounts)',

    // Write functions - Token to ETH
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)',
    'function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] path, address to, uint deadline) returns (uint[] amounts)',

    // Liquidity functions (for reference)
    'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)',
    'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)',
];

// Uniswap V2 Pair ABI (for getting reserves)
export const UNISWAP_V2_PAIR_ABI = [
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
];

// Chainlink Price Feed ABI (for price oracles)
export const CHAINLINK_PRICE_FEED_ABI = [
    'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
    'function decimals() view returns (uint8)',
];

// ENS Registry ABI (for resolving .eth names)
export const ENS_REGISTRY_ABI = [
    'function resolver(bytes32 node) view returns (address)',
];

// ENS Resolver ABI
export const ENS_RESOLVER_ABI = [
    'function addr(bytes32 node) view returns (address)',
];

// Multicall ABI (for batching calls)
export const MULTICALL_ABI = [
    'function aggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes[] returnData)',
];
