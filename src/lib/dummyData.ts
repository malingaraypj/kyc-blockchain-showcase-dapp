// ⚠️ TEMPORARY DUMMY DATA - REMOVE AFTER TESTING ⚠️
// This file contains mock data for UI testing purposes

export const dummyBanks = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    name: "First National Bank",
    registrationNumber: "FNB001",
    isActive: true,
    addedAt: "2024-01-15"
  },
  {
    address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    name: "Global Trust Bank",
    registrationNumber: "GTB002",
    isActive: true,
    addedAt: "2024-01-20"
  },
  {
    address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    name: "Metropolitan Bank",
    registrationNumber: "MET003",
    isActive: false,
    addedAt: "2024-02-01"
  },
  {
    address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    name: "Citizens Commerce Bank",
    registrationNumber: "CCB004",
    isActive: true,
    addedAt: "2024-02-10"
  }
];

export const dummyCustomers = [
  {
    address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    kycStatus: "Verified",
    dataHash: "QmX8K9p2L3m4N5o6P7q8R9s0T1u2V3w4X5y6Z7a8B9c0D",
    documentsHash: "QmY9L0p3M4n5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E",
    addedAt: "2024-01-18",
    authorizedBanks: 2
  },
  {
    address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
    name: "Bob Martinez",
    email: "bob.martinez@email.com",
    kycStatus: "Pending",
    dataHash: "QmZ0M1p4N5o6P7q8R9s0T1u2V3w4X5y6Z7a8B9c0D1e2F",
    documentsHash: "QmA1N2p5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3G",
    addedAt: "2024-02-05",
    authorizedBanks: 1
  },
  {
    address: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    kycStatus: "Verified",
    dataHash: "QmB2O3p6P7q8R9s0T1u2V3w4X5y6Z7a8B9c0D1e2F3g4H",
    documentsHash: "QmC3P4p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3G4h5I",
    addedAt: "2024-01-25",
    authorizedBanks: 3
  },
  {
    address: "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678",
    name: "David Chen",
    email: "david.chen@email.com",
    kycStatus: "Rejected",
    dataHash: "QmD4Q5p8R9s0T1u2V3w4X5y6Z7a8B9c0D1e2F3g4H5i6J",
    documentsHash: "QmE5R6p9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3G4h5I6j7K",
    addedAt: "2024-02-12",
    authorizedBanks: 0
  },
  {
    address: "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    kycStatus: "Verified",
    dataHash: "QmF6S7p0T1u2V3w4X5y6Z7a8B9c0D1e2F3g4H5i6J7k8L",
    documentsHash: "QmG7T8p1U2v3W4x5Y6z7A8b9C0d1E2f3G4h5I6j7K8l9M",
    addedAt: "2024-01-30",
    authorizedBanks: 2
  }
];

export const dummyKYCRequests = [
  {
    id: 1,
    customerAddress: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
    customerName: "Bob Martinez",
    bankAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    bankName: "First National Bank",
    status: "Pending",
    requestedAt: "2024-02-10T10:30:00",
    notes: "Standard KYC verification for new account opening"
  },
  {
    id: 2,
    customerAddress: "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678",
    customerName: "David Chen",
    bankAddress: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    bankName: "Global Trust Bank",
    status: "Rejected",
    requestedAt: "2024-02-08T14:20:00",
    notes: "Documentation incomplete - missing proof of address"
  },
  {
    id: 3,
    customerAddress: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    customerName: "Alice Johnson",
    bankAddress: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    bankName: "Citizens Commerce Bank",
    status: "Approved",
    requestedAt: "2024-02-05T09:15:00",
    notes: "All documents verified successfully"
  },
  {
    id: 4,
    customerAddress: "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7",
    customerName: "Emma Wilson",
    bankAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    bankName: "First National Bank",
    status: "Pending",
    requestedAt: "2024-02-11T16:45:00",
    notes: "Premium account application"
  },
  {
    id: 5,
    customerAddress: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
    customerName: "Carol Davis",
    bankAddress: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    bankName: "Global Trust Bank",
    status: "Approved",
    requestedAt: "2024-02-03T11:00:00",
    notes: "Business account verification"
  }
];

export const dummyStats = {
  admin: {
    totalCustomers: dummyCustomers.length,
    totalBanks: dummyBanks.filter(b => b.isActive).length,
    pendingRequests: dummyKYCRequests.filter(r => r.status === "Pending").length,
    verifiedCustomers: dummyCustomers.filter(c => c.kycStatus === "Verified").length
  },
  bank: {
    totalRequests: dummyKYCRequests.length,
    approvedCustomers: dummyKYCRequests.filter(r => r.status === "Approved").length,
    pendingVerifications: dummyKYCRequests.filter(r => r.status === "Pending").length,
    rejectedRequests: dummyKYCRequests.filter(r => r.status === "Rejected").length
  },
  customer: {
    kycStatus: "Verified",
    authorizedBanks: 2,
    totalRequests: 3,
    lastUpdated: "2024-02-01T14:30:00"
  }
};

// Helper function to check if we should use dummy data
export const useDummyData = () => {
  // Use dummy data if contract address is not set or empty
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  return !contractAddress || contractAddress.trim() === '';
};
