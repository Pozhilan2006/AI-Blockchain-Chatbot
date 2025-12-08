import { verifyMessage } from 'ethers';

export interface SIWEMessage {
    domain: string;
    address: string;
    statement?: string;
    uri: string;
    version: string;
    chainId: number;
    nonce: string;
    issuedAt: string;
}

export function parseSIWEMessage(message: string): SIWEMessage | null {
    try {
        const lines = message.split('\n');

        // Extract domain and address from first two lines
        const domain = lines[0].split(' wants you to sign in')[0];
        const address = lines[1];

        // Parse other fields
        const fields: any = {};
        for (const line of lines) {
            if (line.includes(': ')) {
                const [key, value] = line.split(': ');
                fields[key] = value;
            }
        }

        return {
            domain,
            address,
            statement: lines[3] || undefined,
            uri: fields['URI'],
            version: fields['Version'],
            chainId: parseInt(fields['Chain ID']),
            nonce: fields['Nonce'],
            issuedAt: fields['Issued At'],
        };
    } catch (error) {
        console.error('Error parsing SIWE message:', error);
        return null;
    }
}

export async function verifySIWESignature(
    message: string,
    signature: string,
    expectedAddress: string
): Promise<boolean> {
    try {
        // Verify the signature
        const recoveredAddress = verifyMessage(message, signature);

        // Check if recovered address matches expected address (case-insensitive)
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

export function generateNonce(): string {
    // Generate a random 32-character hex string
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
