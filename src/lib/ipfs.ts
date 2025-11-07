import { PinataSDK } from "pinata-web3";

// Initialize Pinata SDK
// You'll need to add NEXT_PUBLIC_PINATA_JWT to your .env.local
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud"
});

export interface UploadResult {
  ipfsHash: string;
  url: string;
}

/**
 * Upload a file to IPFS using Pinata
 * @param file - The file to upload
 * @param name - Optional name for the file
 * @returns IPFS hash and gateway URL
 */
export async function uploadToIPFS(file: File, name?: string): Promise<UploadResult> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT not configured. Please add NEXT_PUBLIC_PINATA_JWT to your environment variables.');
    }

    const upload = await pinata.upload.file(file);
    const ipfsHash = upload.IpfsHash;
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
    const url = `https://${gateway}/ipfs/${ipfsHash}`;

    return {
      ipfsHash,
      url
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Get the gateway URL for an IPFS hash
 * @param ipfsHash - The IPFS hash (can include ipfs:// prefix or just the hash)
 * @returns Gateway URL
 */
export function getIPFSUrl(ipfsHash: string): string {
  if (!ipfsHash) return '';
  
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '').replace('ipfs/', '');
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
  
  return `https://${gateway}/ipfs/${hash}`;
}

/**
 * Validate if a string is a valid IPFS hash
 * @param hash - String to validate
 * @returns true if valid IPFS hash
 */
export function isValidIPFSHash(hash: string): boolean {
  if (!hash) return false;
  
  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace('ipfs://', '').replace('ipfs/', '');
  
  // IPFS v0 hashes start with Qm and are 46 characters
  // IPFS v1 hashes start with b and are longer
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cleanHash) || 
         /^b[a-z2-7]{58,}$/.test(cleanHash);
}
