import { ethers } from 'ethers';

// KYC Contract ABI (add your full ABI here)
export const KYC_ABI = [
  "function owner() view returns (address)",
  "function isAdmin(address) view returns (bool)",
  "function isBank(address) view returns (bool)",
  "function isCustomer(string) view returns (bool)",
  "function bankIndex() view returns (uint256)",
  "function getAllCustomersCount() view returns (uint256)",
  "function getAllBanksCount() view returns (uint256)",
  "function addBank(string _bName, address _addr)",
  "function addCustomer(string _name, string _pan, string _kycId, string _ipfsAadhar, string _ipfsPan, bytes32 _vcHash)",
  "function addRequest(string _kycId)",
  "function removeRequest(string _kycId)",
  "function manageRequest(string _kycId, address _bankAddress, bool response)",
  "function updateKycStatus(string _kycId, string _bName, string _remarks, uint256 _timeStamp, uint256 _verdict, bytes32 _vcHash)",
  "function getCustomerDetails(string _kycId) view returns (string kycId, string name, string pan, uint256 kycStatus, bytes32 vcHash)",
  "function addAdmin(address _address) returns (bool)",
  "function removeAdmin(address _address) returns (bool)",
  "event AdminAdded(address indexed adminAddress)",
  "event BankAdded(address indexed bankAddress, string name, uint256 id)",
  "event CustomerAdded(string indexed kycId, string name, string pan)",
  "event RequestAdded(address indexed bank, string indexed kycId)",
  "event KycStatusUpdated(string indexed kycId, uint256 status, string remarks)"
];

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

// Contract address - replace with your deployed contract address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Validate contract address
export const isContractConfigured = () => {
  return CONTRACT_ADDRESS && CONTRACT_ADDRESS.length > 0 && CONTRACT_ADDRESS.startsWith('0x');
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  if (!isContractConfigured()) {
    throw new Error('Contract address not configured. Please deploy your contract and add the address to .env.local');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, KYC_ABI, signerOrProvider);
};

export const switchToSepolia = async () => {
  if (typeof window.ethereum === 'undefined') return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Sepolia network', addError);
        return false;
      }
    }
    console.error('Failed to switch to Sepolia', error);
    return false;
  }
};