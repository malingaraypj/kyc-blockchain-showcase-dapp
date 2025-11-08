import { ethers } from 'ethers';

// KYC Contract ABI - Updated to match the new contract
export const KYC_ABI = [
  // State variables
  "function owner() view returns (address)",
  "function bankIndex() view returns (uint256)",
  "function paused() view returns (bool)",
  "function isAdmin(address) view returns (bool)",
  "function isBank(address) view returns (bool)",
  "function isCustomer(string) view returns (bool)",
  "function isCustomerFromPAN(string) view returns (bool)",
  "function isRequested(address, string) view returns (bool)",
  "function isBankAuth(string, address) view returns (bool)",
  
  // Owner/Admin management
  "function setOwner(address _owner) returns (bool)",
  "function setPaused(bool _paused)",
  "function addAdmin(address _address) returns (bool)",
  "function removeAdmin(address _address) returns (bool)",
  
  // Bank management
  "function addBank(string _bName, address _addr)",
  "function setBankApproval(address _bank, bool _approved)",
  "function getBankByAddress(address _address) view returns (string bName, address addr, bool isApproved)",
  
  // Customer management
  "function addCustomer(string _name, string _pan, string _kycId, string _ipfsAadhar, string _ipfsPan, bytes32 _vcHash)",
  "function updateRecord(string _kycId, string _recordType, string _recordData)",
  
  // Request management
  "function addRequest(string _kycId)",
  "function removeRequest(string _kycId)",
  "function manageRequest(string _kycId, address _bankAddress, bool response)",
  
  // KYC status management
  "function updateKycStatus(string _kycId, string _remarks, uint256 _verdict, bytes32 _vcHash)",
  
  // Authorization management
  "function addAuth(string _kycId, address _bankAddress)",
  "function revokeAuth(string _kycId, address _bankAddress)",
  
  // View functions
  "function getAllCustomers(uint256 index) view returns (string kycId, string name, string pan, uint256 kycStatus, bytes32 vcHash)",
  "function getAllCustomersCount() view returns (uint256)",
  "function getCustomerDetails(string _kycId) view returns (string, string, string, uint256, bytes32)",
  "function getCustomerRecordsCount(string _kycId) view returns (uint256)",
  "function getCustomerRecord(string _kycId, uint256 index) view returns (string bName, string data, uint256 time)",
  "function getKycHistoryCount(string _kycId) view returns (uint256)",
  "function getKycHistoryEntry(string _kycId, uint256 index) view returns (string bName, string remarks, uint256 status, uint256 time)",
  "function isCustomerRegistered(string _kycId) view returns (bool)",
  "function isPanRegistered(string _pan) view returns (bool)",
  "function isBankAuthorized(string _kycId, address _bankAddress) view returns (bool)",
  "function getVerifiableCredentialHash(string _kycId) view returns (bytes32)",
  
  // Events
  "event OwnerChanged(address indexed from, address indexed to)",
  "event AdminAdded(address indexed adminAddress)",
  "event AdminRemoved(address indexed adminAddress)",
  "event PausedSet(bool paused)",
  "event BankAdded(address indexed bankAddress, string name, uint256 id)",
  "event BankApprovalSet(address indexed bankAddress, bool isApproved)",
  "event CustomerAdded(bytes32 indexed kycIdHash, string kycId, string name, string pan)",
  "event RequestAdded(address indexed bank, string indexed kycId)",
  "event RequestRemoved(address indexed bank, string indexed kycId)",
  "event RequestManaged(address indexed bank, string indexed kycId, bool approved)",
  "event KycStatusUpdated(string indexed kycId, uint256 status, string remarks)",
  "event AuthAdded(string indexed kycId, address indexed bank)",
  "event AuthRevoked(string indexed kycId, address indexed bank)",
  "event RecordUpdated(string indexed kycId, string recordType, string recordData)"
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