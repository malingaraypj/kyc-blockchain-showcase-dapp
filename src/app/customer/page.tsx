"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Building2, FileCheck, AlertCircle, CheckCircle, Clock, Search, Loader2, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerDetails {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
}

export default function CustomerDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [searchKycId, setSearchKycId] = useState('');
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    if (isCheckingRole) {
      return;
    }

    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    if (userRole && userRole !== 'customer') {
      router.push('/');
      return;
    }
  }, [isConnected, isCorrectNetwork, userRole, isCheckingRole, router]);

  const handleSearchKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !searchKycId) return;

    setFetchingDetails(true);
    setErrorDetails(null);
    setCustomerDetails(null);
    
    try {
      // First check if customer exists
      const isRegistered = await contract.isCustomerRegistered(searchKycId);
      if (!isRegistered) {
        setErrorDetails('KYC ID not found in the system. Please verify the KYC ID is correct.');
        toast.error('KYC ID not found');
        setFetchingDetails(false);
        return;
      }

      // Try to get customer details
      const details = await contract.getCustomerDetails(searchKycId);
      setCustomerDetails({
        kycId: details[0],
        name: details[1],
        pan: details[2],
        kycStatus: Number(details[3]),
        vcHash: details[4]
      });
      setErrorDetails(null);
      toast.success('Customer details retrieved!');
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      
      // Parse the error to provide better feedback
      let errorMessage = 'Unable to retrieve customer details';
      let detailedMessage = '';
      
      if (error.message) {
        if (error.message.includes('not authorized') || error.message.includes('access denied')) {
          errorMessage = 'Access Denied';
          detailedMessage = 'As a customer, you can only view your own KYC details. Make sure you entered YOUR KYC ID that was registered with your wallet address.';
        } else if (error.message.includes('revert')) {
          errorMessage = 'Access Restricted';
          detailedMessage = 'This KYC ID exists, but you do not have permission to view it. Only the customer who owns this KYC ID can view these details.';
        } else {
          detailedMessage = `Error: ${error.message.slice(0, 200)}`;
        }
      }
      
      setErrorDetails(detailedMessage || errorMessage);
      toast.error(errorMessage);
    } finally {
      setFetchingDetails(false);
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
      case 0: return <Clock className="w-5 h-5" />;
      case 1: return <CheckCircle className="w-5 h-5" />;
      case 2: return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (!isConnected || isCheckingRole) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'customer') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Customer Dashboard</h1>
        <p className="text-muted-foreground">View your KYC status and authorized banks</p>
      </div>

      {/* Important Notice */}
      <div className="mb-8 p-6 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1 text-blue-700 dark:text-blue-400">Important: Access Control</h3>
            <p className="text-sm text-muted-foreground mb-2">
              You can only view KYC details for YOUR own account. Enter the KYC ID that was registered with your connected wallet address.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Connected Wallet:</strong> <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{account}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Search KYC Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Search Your KYC Details</h2>
        </div>
        <form onSubmit={handleSearchKYC} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="kycId" className="sr-only">KYC ID</Label>
            <Input
              id="kycId"
              value={searchKycId}
              onChange={(e) => setSearchKycId(e.target.value)}
              placeholder="Enter your KYC ID to view details"
              required
            />
          </div>
          <Button type="submit" disabled={fetchingDetails}>
            {fetchingDetails && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {fetchingDetails ? 'Searching...' : 'Search'}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-3">
          Enter your unique KYC ID to view your verification status and details
        </p>
      </div>

      {/* Error Details */}
      {errorDetails && (
        <div className="mb-8 p-6 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1 text-red-700 dark:text-red-400">Unable to Access Customer Details</h3>
              <p className="text-sm text-muted-foreground mb-3">{errorDetails}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold">Troubleshooting Steps:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verify you entered YOUR correct KYC ID (the one registered with your wallet)</li>
                  <li>Make sure your wallet address matches the one used during KYC registration</li>
                  <li>If you're unsure of your KYC ID, contact your bank or the system administrator</li>
                  <li>You cannot view other customers' KYC details for privacy protection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Details Display */}
      {customerDetails && (
        <>
          {/* KYC Status Card */}
          <div className="mb-8 p-8 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">KYC Verification Status</h2>
                <p className="text-muted-foreground">Current status of your KYC verification</p>
              </div>
            </div>
            
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg border font-semibold text-lg ${getStatusColor(customerDetails.kycStatus)}`}>
              {getStatusIcon(customerDetails.kycStatus)}
              {getStatusLabel(customerDetails.kycStatus)}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Status Explanation */}
          <div className={`mb-8 p-6 rounded-lg border ${
            customerDetails.kycStatus === 1 
              ? 'bg-green-500/5 border-green-500/20' 
              : customerDetails.kycStatus === 2
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-orange-500/5 border-orange-500/20'
          }`}>
            <div className="flex gap-3">
              {customerDetails.kycStatus === 1 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 text-green-700 dark:text-green-400">KYC Verified Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      Your KYC has been verified and approved. Banks can now access your verified information for financial services.
                    </p>
                  </div>
                </>
              ) : customerDetails.kycStatus === 2 ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 text-red-700 dark:text-red-400">KYC Rejected</h3>
                    <p className="text-sm text-muted-foreground">
                      Your KYC verification was rejected. Please contact the bank or admin for more information and to resubmit your documents.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 text-orange-700 dark:text-orange-400">Verification Pending</h3>
                    <p className="text-sm text-muted-foreground">
                      Your KYC is currently under review. Banks are verifying your documents. You will be notified once the verification is complete.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="mb-8 p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Blockchain Verification</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-sm">Verification Hash (VC Hash)</Label>
                <p className="font-mono text-sm break-all bg-muted p-3 rounded mt-1">
                  {customerDetails.vcHash}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your KYC data is secured on the Ethereum Sepolia blockchain, ensuring transparency and immutability.
              </p>
            </div>
          </div>
        </>
      )}

      {/* No Data State */}
      {!customerDetails && !errorDetails && (
        <div className="mb-8 p-12 rounded-lg bg-card border border-border text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No KYC Details Loaded</h3>
          <p className="text-muted-foreground mb-4">
            Enter your KYC ID above to view your verification status and details
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Customer Portal</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View your KYC verification status in real-time</li>
              <li>• Track which banks have requested access to your information</li>
              <li>• See your complete verification history on the blockchain</li>
              <li>• Contact administrators if you need to update your information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}