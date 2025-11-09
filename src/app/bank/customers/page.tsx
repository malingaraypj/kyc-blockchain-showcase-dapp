"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Search, Loader2, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
}

export default function BankCustomersPage() {
  const { isConnected, userRole, isCorrectNetwork, account, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [searchKycId, setSearchKycId] = useState('');
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Customer[]>([]);

  useEffect(() => {
    if (isCheckingRole) {
      return;
    }

    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    if (userRole && userRole !== 'bank') {
      router.push('/');
      return;
    }
  }, [isConnected, isCorrectNetwork, userRole, isCheckingRole, router]);

  const handleSearchCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !searchKycId) return;

    setFetchingCustomer(true);
    try {
      const details = await contract.getCustomerDetails(searchKycId);
      const customer: Customer = {
        kycId: details.kycId,
        name: details.name,
        pan: details.pan,
        kycStatus: Number(details.kycStatus),
        vcHash: details.vcHash
      };
      setCustomerDetails(customer);
      
      // Add to search history if not already present
      if (!searchHistory.find(c => c.kycId === customer.kycId)) {
        setSearchHistory(prev => [customer, ...prev].slice(0, 5)); // Keep last 5 searches
      }
      
      toast.success('Customer details retrieved!');
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error('Customer not found or you do not have access to this customer');
      setCustomerDetails(null);
    } finally {
      setFetchingCustomer(false);
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pending Verification';
      case 1: return 'Verified';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 1: return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 2: return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Clock className="w-4 h-4" />;
      case 1: return <CheckCircle className="w-4 h-4" />;
      case 2: return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const loadCustomerFromHistory = (customer: Customer) => {
    setCustomerDetails(customer);
    setSearchKycId(customer.kycId);
  };

  if (!isConnected || isCheckingRole) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'bank') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/bank')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Customer Management</h1>
        </div>
        <p className="text-muted-foreground">Search and view customer KYC information you have access to</p>
      </div>

      {/* Search Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Search Customer by KYC ID</h2>
        </div>
        <form onSubmit={handleSearchCustomer} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="kycId" className="sr-only">KYC ID</Label>
            <Input
              id="kycId"
              value={searchKycId}
              onChange={(e) => setSearchKycId(e.target.value)}
              placeholder="Enter customer KYC ID"
              required
            />
          </div>
          <Button type="submit" disabled={fetchingCustomer}>
            {fetchingCustomer && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {fetchingCustomer ? 'Searching...' : 'Search'}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-3">
          You can only view customers you have requested access to or have been granted permission
        </p>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Recent Searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchHistory.map((customer) => (
              <button
                key={customer.kycId}
                onClick={() => loadCustomerFromHistory(customer)}
                className="p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{customer.name}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(customer.kycStatus)}`}>
                    {getStatusIcon(customer.kycStatus)}
                    {getStatusLabel(customer.kycStatus)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{customer.kycId}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details */}
      {customerDetails && (
        <>
          <div className="mb-8 p-8 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Customer Details</h2>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${getStatusColor(customerDetails.kycStatus)}`}>
                {getStatusIcon(customerDetails.kycStatus)}
                {getStatusLabel(customerDetails.kycStatus)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm mb-1 block">Full Name</Label>
                <div className="text-xl font-semibold">{customerDetails.name}</div>
              </div>
              
              <div className="p-5 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm mb-1 block">KYC ID</Label>
                <div className="text-xl font-semibold font-mono">{customerDetails.kycId}</div>
              </div>
              
              <div className="p-5 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm mb-1 block">PAN Number</Label>
                <div className="text-xl font-semibold font-mono">{customerDetails.pan}</div>
              </div>
              
              <div className="p-5 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm mb-1 block">Verification Status</Label>
                <div className="text-xl font-semibold">{getStatusLabel(customerDetails.kycStatus)}</div>
              </div>
            </div>
          </div>

          {/* Blockchain Verification */}
          <div className="mb-8 p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Blockchain Verification</h3>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">Verification Hash (VC Hash)</Label>
              <div className="font-mono text-sm break-all bg-muted p-4 rounded">
                {customerDetails.vcHash}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This hash is stored on the Ethereum Sepolia blockchain, ensuring data integrity and immutability.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="default" 
              className="gap-2"
              onClick={() => router.push('/bank/requests')}
            >
              <FileText className="w-4 h-4" />
              View My Requests
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => router.push('/bank')}
            >
              Update KYC Status
            </Button>
          </div>
        </>
      )}

      {/* No Data State */}
      {!customerDetails && (
        <div className="mb-8 p-12 rounded-lg bg-card border border-border text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Customer Selected</h3>
          <p className="text-muted-foreground mb-4">
            Search for a customer by their KYC ID to view their details
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Customer Access</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You can only view customers you have requested access to</li>
              <li>• Customer details are retrieved directly from the blockchain</li>
              <li>• All data is encrypted and secured on the Sepolia testnet</li>
              <li>• Update KYC status from the main dashboard after review</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
