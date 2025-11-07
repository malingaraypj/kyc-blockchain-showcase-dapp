import { ethers } from 'ethers';

export interface Bank {
  address: string;
  name: string;
  id: number;
  isActive: boolean;
}

export interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number; // 0: Not Verified, 1: Verified, 2: Rejected
  vcHash: string;
}

export interface KYCRequest {
  id: number;
  customerKycId: string;
  customerName: string;
  bankAddress: string;
  bankName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

// Fetch all banks from blockchain
export const fetchAllBanks = async (contract: ethers.Contract): Promise<Bank[]> => {
  try {
    const bankCount = await contract.getAllBanksCount();
    const banks: Bank[] = [];
    
    for (let i = 0; i < Number(bankCount); i++) {
      try {
        // Banks are stored by index, need to get bank details
        // Note: You may need to adjust this based on your contract's bank storage structure
        const bankData = await contract.banks(i);
        banks.push({
          address: bankData.addr || bankData[0],
          name: bankData.bName || bankData[1],
          id: i,
          isActive: bankData.isActive !== undefined ? bankData.isActive : true
        });
      } catch (error) {
        console.error(`Error fetching bank ${i}:`, error);
      }
    }
    
    return banks;
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
};

// Fetch all customers from blockchain
export const fetchAllCustomers = async (contract: ethers.Contract): Promise<Customer[]> => {
  try {
    const customerCount = await contract.getAllCustomersCount();
    const customers: Customer[] = [];
    
    // Note: You'll need to track customer KYC IDs separately or emit them in events
    // For now, we'll return the count
    console.log('Total customers:', Number(customerCount));
    
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// Fetch customer details by KYC ID
export const fetchCustomerDetails = async (
  contract: ethers.Contract, 
  kycId: string
): Promise<Customer | null> => {
  try {
    const details = await contract.getCustomerDetails(kycId);
    return {
      kycId: details.kycId || details[0],
      name: details.name || details[1],
      pan: details.pan || details[2],
      kycStatus: Number(details.kycStatus || details[3]),
      vcHash: details.vcHash || details[4]
    };
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return null;
  }
};

// Get KYC status label
export const getKYCStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Pending';
    case 1:
      return 'Verified';
    case 2:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

// Fetch admin statistics
export const fetchAdminStats = async (contract: ethers.Contract) => {
  try {
    const [totalCustomers, totalBanks] = await Promise.all([
      contract.getAllCustomersCount(),
      contract.getAllBanksCount()
    ]);
    
    return {
      totalCustomers: Number(totalCustomers),
      totalBanks: Number(totalBanks),
      pendingRequests: 0, // Will be calculated from events or requests
      verifiedCustomers: 0 // Will be calculated from customer data
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalCustomers: 0,
      totalBanks: 0,
      pendingRequests: 0,
      verifiedCustomers: 0
    };
  }
};

// Parse blockchain events for KYC requests
export const fetchKYCRequestsFromEvents = async (
  contract: ethers.Contract,
  provider: ethers.Provider
): Promise<KYCRequest[]> => {
  try {
    // Get RequestAdded events
    const filter = contract.filters.RequestAdded();
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks
    
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    
    const requests: KYCRequest[] = events.map((event, index) => ({
      id: index,
      customerKycId: event.args?.kycId || '',
      customerName: 'Customer', // Will need to fetch from customer details
      bankAddress: event.args?.bank || '',
      bankName: 'Bank', // Will need to fetch from bank details
      status: 'Pending',
      timestamp: Date.now()
    }));
    
    return requests;
  } catch (error) {
    console.error('Error fetching KYC requests from events:', error);
    return [];
  }
};

// Check if address is bank
export const checkIsBank = async (
  contract: ethers.Contract,
  address: string
): Promise<boolean> => {
  try {
    return await contract.isBank(address);
  } catch (error) {
    console.error('Error checking bank status:', error);
    return false;
  }
};

// Check if address is admin
export const checkIsAdmin = async (
  contract: ethers.Contract,
  address: string
): Promise<boolean> => {
  try {
    return await contract.isAdmin(address);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
