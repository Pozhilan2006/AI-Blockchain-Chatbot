import { BrowserProvider, Contract, parseUnits, formatUnits, isAddress, JsonRpcProvider } from 'ethers';
import type { TransactionRequest, TransactionReceipt, Token, SwapTransaction, SwapQuote } from '../types';
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI, UNISWAP_V2_ROUTER_ABI } from '../config/abis';
import {
    CHAINS,
    UNISWAP_V2_ROUTER,
    WRAPPED_NATIVE_TOKEN,
    getChainById,
    getTokenAddress,
    GAS_BUFFER_PERCENTAGE,
    DEFAULT_SLIPPAGE,
    DEFAULT_DEADLINE_MINUTES,
} from '../config/chains';

// Get provider from MetaMask
export async function getProvider(): Promise<BrowserProvider> {
    if (!window.ethereum) {
        throw new Error('MetaMask not detected');
    }
    return new BrowserProvider(window.ethereum);
}

// Get signer
export async function getSigner() {
    const provider = await getProvider();
    return provider.getSigner();
}

// Validate Ethereum address
export function validateAddress(address: string): boolean {
    return isAddress(address);
}

// Format address for display (0x1234...5678)
export function formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get current gas prices (EIP-1559)
export async function getGasPrices(chainId: number) {
    const provider = await getProvider();
    const feeData = await provider.getFeeData();

    // For chains that don't support EIP-1559, use legacy gas price
    if (!feeData.maxFeePerGas) {
        const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei');
        return {
            gasPrice: gasPrice.toString(),
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
        };
    }

    return {
        gasPrice: null,
        maxFeePerGas: feeData.maxFeePerGas.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || parseUnits('2', 'gwei').toString(),
    };
}

// Estimate gas with buffer
export async function estimateGasWithBuffer(tx: TransactionRequest): Promise<string> {
    const provider = await getProvider();
    const estimated = await provider.estimateGas(tx);
    const buffered = (estimated * BigInt(100 + GAS_BUFFER_PERCENTAGE)) / BigInt(100);
    return buffered.toString();
}

// ============================================================================
// ETH TRANSFER
// ============================================================================

export async function prepareEthTransfer(
    recipient: string,
    amount: string,
    chainId: number
): Promise<TransactionRequest> {
    if (!validateAddress(recipient)) {
        throw new Error('Invalid recipient address');
    }

    const signer = await getSigner();
    const from = await signer.getAddress();
    const value = parseUnits(amount, 18).toString();

    // Get gas prices
    const gasPrices = await getGasPrices(chainId);

    // Build transaction
    const tx: TransactionRequest = {
        to: recipient,
        from,
        value,
        chainId,
    };

    // Add gas prices
    if (gasPrices.maxFeePerGas) {
        tx.maxFeePerGas = gasPrices.maxFeePerGas;
        tx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    // Estimate gas
    tx.gasLimit = await estimateGasWithBuffer(tx);

    return tx;
}

// ============================================================================
// ERC-20 TRANSFER
// ============================================================================

export async function prepareERC20Transfer(
    tokenAddress: string,
    recipient: string,
    amount: string,
    decimals: number,
    chainId: number
): Promise<TransactionRequest> {
    if (!validateAddress(tokenAddress)) {
        throw new Error('Invalid token address');
    }
    if (!validateAddress(recipient)) {
        throw new Error('Invalid recipient address');
    }

    const signer = await getSigner();
    const from = await signer.getAddress();

    // Create contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

    // Check balance
    const balance = await tokenContract.balanceOf(from);
    const amountWei = parseUnits(amount, decimals);

    if (balance < amountWei) {
        throw new Error(`Insufficient token balance. You have ${formatUnits(balance, decimals)} tokens`);
    }

    // Encode transfer calldata
    const data = tokenContract.interface.encodeFunctionData('transfer', [recipient, amountWei]);

    // Get gas prices
    const gasPrices = await getGasPrices(chainId);

    // Build transaction
    const tx: TransactionRequest = {
        to: tokenAddress,
        from,
        data,
        value: '0',
        chainId,
    };

    // Add gas prices
    if (gasPrices.maxFeePerGas) {
        tx.maxFeePerGas = gasPrices.maxFeePerGas;
        tx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    // Estimate gas
    tx.gasLimit = await estimateGasWithBuffer(tx);

    return tx;
}

// ============================================================================
// NFT TRANSFER (ERC-721)
// ============================================================================

export async function prepareNFTTransfer(
    nftAddress: string,
    from: string,
    to: string,
    tokenId: string,
    chainId: number
): Promise<TransactionRequest> {
    if (!validateAddress(nftAddress)) {
        throw new Error('Invalid NFT contract address');
    }
    if (!validateAddress(to)) {
        throw new Error('Invalid recipient address');
    }

    const signer = await getSigner();
    const nftContract = new Contract(nftAddress, ERC721_ABI, signer);

    // Verify ownership
    const owner = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() !== from.toLowerCase()) {
        throw new Error('You do not own this NFT');
    }

    // Encode safeTransferFrom calldata
    const data = nftContract.interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [
        from,
        to,
        tokenId,
    ]);

    // Get gas prices
    const gasPrices = await getGasPrices(chainId);

    // Build transaction
    const tx: TransactionRequest = {
        to: nftAddress,
        from,
        data,
        value: '0',
        chainId,
    };

    // Add gas prices
    if (gasPrices.maxFeePerGas) {
        tx.maxFeePerGas = gasPrices.maxFeePerGas;
        tx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    // Estimate gas
    tx.gasLimit = await estimateGasWithBuffer(tx);

    return tx;
}

// ============================================================================
// ERC-1155 TRANSFER
// ============================================================================

export async function prepareERC1155Transfer(
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: string,
    chainId: number
): Promise<TransactionRequest> {
    if (!validateAddress(contractAddress)) {
        throw new Error('Invalid contract address');
    }
    if (!validateAddress(to)) {
        throw new Error('Invalid recipient address');
    }

    const signer = await getSigner();
    const contract = new Contract(contractAddress, ERC1155_ABI, signer);

    // Check balance
    const balance = await contract.balanceOf(from, tokenId);
    if (balance < BigInt(amount)) {
        throw new Error('Insufficient token balance');
    }

    // Encode safeTransferFrom calldata
    const data = contract.interface.encodeFunctionData('safeTransferFrom', [
        from,
        to,
        tokenId,
        amount,
        '0x', // empty data
    ]);

    // Get gas prices
    const gasPrices = await getGasPrices(chainId);

    // Build transaction
    const tx: TransactionRequest = {
        to: contractAddress,
        from,
        data,
        value: '0',
        chainId,
    };

    // Add gas prices
    if (gasPrices.maxFeePerGas) {
        tx.maxFeePerGas = gasPrices.maxFeePerGas;
        tx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    // Estimate gas
    tx.gasLimit = await estimateGasWithBuffer(tx);

    return tx;
}

// ============================================================================
// TOKEN SWAP (UNISWAP V2)
// ============================================================================

export async function prepareSwap(
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    decimalsIn: number,
    slippage: number = DEFAULT_SLIPPAGE,
    chainId: number
): Promise<SwapTransaction> {
    const signer = await getSigner();
    const from = await signer.getAddress();

    const routerAddress = UNISWAP_V2_ROUTER[chainId];
    if (!routerAddress) {
        throw new Error('Router not available for this chain');
    }

    const router = new Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, signer);
    const amountInWei = parseUnits(amountIn, decimalsIn);

    // Determine path
    const wethAddress = WRAPPED_NATIVE_TOKEN[chainId];
    let path: string[];

    if (tokenInAddress.toLowerCase() === wethAddress.toLowerCase()) {
        path = [tokenInAddress, tokenOutAddress];
    } else if (tokenOutAddress.toLowerCase() === wethAddress.toLowerCase()) {
        path = [tokenInAddress, tokenOutAddress];
    } else {
        // Route through WETH
        path = [tokenInAddress, wethAddress, tokenOutAddress];
    }

    // Get expected output amount
    const amounts = await router.getAmountsOut(amountInWei, path);
    const amountOut = amounts[amounts.length - 1];

    // Calculate minimum output with slippage
    const slippageBps = Math.floor(slippage * 100);
    const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

    // Calculate price impact (simplified)
    const priceImpact = 0; // Would need pool reserves for accurate calculation

    // Set deadline
    const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60;

    const quote: SwapQuote = {
        amountIn: amountInWei.toString(),
        amountOut: amountOut.toString(),
        amountOutMin: amountOutMin.toString(),
        path,
        priceImpact,
        slippage,
    };

    // Check allowance
    const tokenIn = new Contract(tokenInAddress, ERC20_ABI, signer);
    const allowance = await tokenIn.allowance(from, routerAddress);

    let approvalTx: TransactionRequest | undefined;

    // If allowance insufficient, prepare approval transaction
    if (allowance < amountInWei) {
        const approvalData = tokenIn.interface.encodeFunctionData('approve', [routerAddress, amountInWei]);
        const gasPrices = await getGasPrices(chainId);

        approvalTx = {
            to: tokenInAddress,
            from,
            data: approvalData,
            value: '0',
            chainId,
        };

        if (gasPrices.maxFeePerGas) {
            approvalTx.maxFeePerGas = gasPrices.maxFeePerGas;
            approvalTx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
        }

        approvalTx.gasLimit = await estimateGasWithBuffer(approvalTx);
    }

    // Prepare swap transaction
    const swapData = router.interface.encodeFunctionData('swapExactTokensForTokens', [
        amountInWei,
        amountOutMin,
        path,
        from,
        deadline,
    ]);

    const gasPrices = await getGasPrices(chainId);

    const swapTx: TransactionRequest = {
        to: routerAddress,
        from,
        data: swapData,
        value: '0',
        chainId,
    };

    if (gasPrices.maxFeePerGas) {
        swapTx.maxFeePerGas = gasPrices.maxFeePerGas;
        swapTx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    swapTx.gasLimit = await estimateGasWithBuffer(swapTx);

    return {
        approvalTx,
        swapTx,
        quote,
    };
}

// ============================================================================
// BUY TOKEN (Native to ERC-20)
// ============================================================================

export async function prepareBuyToken(
    tokenOutAddress: string,
    amountInEth: string,
    slippage: number = DEFAULT_SLIPPAGE,
    chainId: number
): Promise<TransactionRequest> {
    const signer = await getSigner();
    const from = await signer.getAddress();

    const routerAddress = UNISWAP_V2_ROUTER[chainId];
    if (!routerAddress) {
        throw new Error('Router not available for this chain');
    }

    const router = new Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, signer);
    const amountInWei = parseUnits(amountInEth, 18);

    const wethAddress = WRAPPED_NATIVE_TOKEN[chainId];
    const path = [wethAddress, tokenOutAddress];

    // Get expected output
    const amounts = await router.getAmountsOut(amountInWei, path);
    const amountOut = amounts[1];

    // Calculate minimum output
    const slippageBps = Math.floor(slippage * 100);
    const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

    const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60;

    // Encode swap
    const data = router.interface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        path,
        from,
        deadline,
    ]);

    const gasPrices = await getGasPrices(chainId);

    const tx: TransactionRequest = {
        to: routerAddress,
        from,
        data,
        value: amountInWei.toString(),
        chainId,
    };

    if (gasPrices.maxFeePerGas) {
        tx.maxFeePerGas = gasPrices.maxFeePerGas;
        tx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    tx.gasLimit = await estimateGasWithBuffer(tx);

    return tx;
}

// ============================================================================
// SELL TOKEN (ERC-20 to Native)
// ============================================================================

export async function prepareSellToken(
    tokenInAddress: string,
    amountIn: string,
    decimals: number,
    slippage: number = DEFAULT_SLIPPAGE,
    chainId: number
): Promise<SwapTransaction> {
    const signer = await getSigner();
    const from = await signer.getAddress();

    const routerAddress = UNISWAP_V2_ROUTER[chainId];
    if (!routerAddress) {
        throw new Error('Router not available for this chain');
    }

    const router = new Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, signer);
    const amountInWei = parseUnits(amountIn, decimals);

    const wethAddress = WRAPPED_NATIVE_TOKEN[chainId];
    const path = [tokenInAddress, wethAddress];

    // Get expected output
    const amounts = await router.getAmountsOut(amountInWei, path);
    const amountOut = amounts[1];

    // Calculate minimum output
    const slippageBps = Math.floor(slippage * 100);
    const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

    const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60;

    const quote: SwapQuote = {
        amountIn: amountInWei.toString(),
        amountOut: amountOut.toString(),
        amountOutMin: amountOutMin.toString(),
        path,
        priceImpact: 0,
        slippage,
    };

    // Check allowance
    const tokenIn = new Contract(tokenInAddress, ERC20_ABI, signer);
    const allowance = await tokenIn.allowance(from, routerAddress);

    let approvalTx: TransactionRequest | undefined;

    if (allowance < amountInWei) {
        const approvalData = tokenIn.interface.encodeFunctionData('approve', [routerAddress, amountInWei]);
        const gasPrices = await getGasPrices(chainId);

        approvalTx = {
            to: tokenInAddress,
            from,
            data: approvalData,
            value: '0',
            chainId,
        };

        if (gasPrices.maxFeePerGas) {
            approvalTx.maxFeePerGas = gasPrices.maxFeePerGas;
            approvalTx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
        }

        approvalTx.gasLimit = await estimateGasWithBuffer(approvalTx);
    }

    // Prepare swap
    const swapData = router.interface.encodeFunctionData('swapExactTokensForETH', [
        amountInWei,
        amountOutMin,
        path,
        from,
        deadline,
    ]);

    const gasPrices = await getGasPrices(chainId);

    const swapTx: TransactionRequest = {
        to: routerAddress,
        from,
        data: swapData,
        value: '0',
        chainId,
    };

    if (gasPrices.maxFeePerGas) {
        swapTx.maxFeePerGas = gasPrices.maxFeePerGas;
        swapTx.maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas!;
    }

    swapTx.gasLimit = await estimateGasWithBuffer(swapTx);

    return {
        approvalTx,
        swapTx,
        quote,
    };
}

// ============================================================================
// TRANSACTION EXECUTION & MONITORING
// ============================================================================

export async function sendTransaction(tx: TransactionRequest): Promise<string> {
    const signer = await getSigner();
    const response = await signer.sendTransaction(tx);
    return response.hash;
}

export async function monitorTransaction(
    txHash: string,
    timeout: number = 300000 // 5 minutes
): Promise<TransactionReceipt> {
    const provider = await getProvider();

    try {
        const receipt = await provider.waitForTransaction(txHash, 1, timeout);

        if (!receipt) {
            throw new Error('Transaction not found or dropped');
        }

        return {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            from: receipt.from,
            to: receipt.to || '',
            gasUsed: receipt.gasUsed.toString(),
            status: receipt.status || 0,
            logs: receipt.logs,
        };
    } catch (error: any) {
        if (error.message.includes('timeout')) {
            throw new Error('Transaction timeout - check block explorer for status');
        }
        throw error;
    }
}

// Get token metadata
export async function getTokenMetadata(tokenAddress: string): Promise<Token> {
    const provider = await getProvider();
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
    ]);

    return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
    };
}

// Get token balance
export async function getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const provider = await getProvider();
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    return balance.toString();
}
