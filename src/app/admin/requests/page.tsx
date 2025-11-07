"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageViewer } from '@/components/ui/image-upload';
import { FileText, Loader2, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Users, Search, Eye, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerWithDocs {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
  ipfsAadhar: string;
  ipfsPan: string;
}

export default function ReviewRequestsPage() {
  const { isConnected, userRole, isCorrectNetwork, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerWithDocs[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDocs | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isCheckingRole) return;
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    if (userRole && userRole !== 'admin' && userRole !== 'owner') {
      router.push('/');
      return;
    }
  }, [isConnected, isCorrectNetwork, userRole, isCheckingRole, router]);

  useEffect(() => {
    if (contract && (userRole === 'admin' || userRole === 'owner')) {
      fetchCustomersWithDocuments();
    }
  }, [contract, userRole]);

  const fetchCustomersWithDocuments = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const customersCount = await contract.getAllCustomersCount();
      const count = Number(customersCount);
      
      const customersList: CustomerWithDocs[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const customerData = await contract.getAllCustomers(i);
          const kycId = customerData[0];
          
          // Try to fetch IPFS hashes if available
          let ipfsAadhar = '';
          let ipfsPan = '';
          try {
            const ipfsData = await contract.getCustomerIPFSHashes(kycId);
            ipfsAadhar = ipfsData[0] || ipfsData.ipfsAadhar || '';
            ipfsPan = ipfsData[1] || ipfsData.ipfsPan || '';
          } catch (err) {
            console.log(`IPFS hashes not available for ${kycId}`);
          }
          
          customersList.push({
            kycId,
            name: customerData[1],
            pan: customerData[2],
            kycStatus: Number(customerData[3]),
            vcHash: customerData[4] || '0x0000000000000000000000000000000000000000000000000000000000000000',
            ipfsAadhar,
            ipfsPan
          });
        } catch (err) {
          console.error(`Error fetching customer ${i}:`, err);
        }
      }
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
        );
      case 1:
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Verified</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusStats = () => {
    const pending = customers.filter(c => c.kycStatus === 0).length;
    const approved = customers.filter(c => c.kycStatus === 1).length;
    const rejected = customers.filter(c => c.kycStatus === 2).length;
    return { pending, approved, rejected };
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.kycId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.pan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = getStatusStats();

  if (!isConnected || isCheckingRole) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'owner') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">Review KYC Requests & Documents</h1>
        <p className="text-muted-foreground">Monitor KYC verification requests and review customer documents stored on IPFS</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Clock className="w-8 h-8 text-orange-600 mb-3" />
          <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending Review</div>
        </div>
        <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20">
          <XCircle className="w-8 h-8 text-red-600 mb-3" />
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, KYC ID, or PAN..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
            <p className="text-muted-foreground">No customers match your search criteria</p>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => (
            <div key={index} className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{customer.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium">KYC ID:</span>{' '}
                        <code className="px-2 py-1 rounded bg-muted font-mono text-xs">
                          {customer.kycId}
                        </code>
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">PAN:</span>{' '}
                        <code className="px-2 py-1 rounded bg-muted font-mono text-xs">
                          {customer.pan}
                        </code>
                      </p>
                      <div>
                        {(customer.ipfsAadhar || customer.ipfsPan) && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-xs font-medium">Documents Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(customer.kycStatus)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowDetails(true);
                    }}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Details Modal/Panel */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Review Customer Documents</h2>
                <p className="text-muted-foreground">{selectedCustomer.name}</p>
              </div>
              <Button variant="ghost" onClick={() => {
                setShowDetails(false);
                setSelectedCustomer(null);
              }}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">KYC ID</p>
                  <p className="font-mono font-semibold">{selectedCustomer.kycId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">PAN Number</p>
                  <p className="font-mono font-semibold">{selectedCustomer.pan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                  {getStatusBadge(selectedCustomer.kycStatus)}
                </div>
              </div>

              {/* Document Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Uploaded Documents (IPFS)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Aadhaar Card</p>
                    <ImageViewer ipfsHash={selectedCustomer.ipfsAadhar} alt="Aadhaar Card" />
                    {selectedCustomer.ipfsAadhar && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                        IPFS: {selectedCustomer.ipfsAadhar}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">PAN Card</p>
                    <ImageViewer ipfsHash={selectedCustomer.ipfsPan} alt="PAN Card" />
                    {selectedCustomer.ipfsPan && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                        IPFS: {selectedCustomer.ipfsPan}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold mb-2">Blockchain Verification</h3>
                <p className="text-xs text-muted-foreground mb-1">VC Hash:</p>
                <p className="font-mono text-xs break-all">{selectedCustomer.vcHash}</p>
              </div>

              {/* Action Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Admin Monitoring</p>
                    <p className="text-muted-foreground">
                      Banks are responsible for updating KYC status. As an admin, you can monitor all documents and verification activities. Documents are permanently stored on IPFS for transparency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Document Review System</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All customer documents are stored on IPFS (InterPlanetary File System)</li>
              <li>• Banks submit requests and update KYC status after reviewing documents</li>
              <li>• Admins can monitor all documents and verification activities</li>
              <li>• Documents remain permanently accessible and tamper-proof on the blockchain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}