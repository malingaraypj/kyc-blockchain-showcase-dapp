"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowLeft, Plus, Loader2, CheckCircle, Clock, XCircle, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Request {
  kycId: string;
  timestamp: string;
  status?: number;
}

interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
}

export default function BankRequestsPage() {
  const { isConnected, userRole, isCorrectNetwork, account, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  
  // Request KYC State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [kycIdToRequest, setKycIdToRequest] = useState('');
  const [requestingKYC, setRequestingKYC] = useState(false);

  // Update KYC State
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateData, setUpdateData] = useState({
    kycId: '',
    remarks: '',
    verdict: '1' // 1 = approved, 2 = rejected
  });
  const [updatingKYC, setUpdatingKYC] = useState(false);

  // View Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);

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

  useEffect(() => {
    if (contract && account && userRole === 'bank') {
      fetchRequests();
    }
  }, [contract, account, userRole]);

  const fetchRequests = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      // Since we don't have a direct method to get all requests,
      // we'll show a placeholder
      setRequests([]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !kycIdToRequest) return;

    setRequestingKYC(true);
    try {
      const tx = await contract.addRequest(kycIdToRequest);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success('KYC request submitted successfully!');
      setKycIdToRequest('');
      setShowRequestForm(false);
      fetchRequests();
    } catch (error: any) {
      console.error('Error requesting KYC:', error);
      toast.error(error?.reason || 'Failed to submit KYC request. Make sure the customer exists.');
    } finally {
      setRequestingKYC(false);
    }
  };

  const handleUpdateKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !updateData.kycId) return;

    setUpdatingKYC(true);
    try {
      const vcHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
      
      const tx = await contract.updateKycStatus(
        updateData.kycId,
        updateData.remarks,
        Number(updateData.verdict),
        vcHash
      );
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success('KYC status updated successfully!');
      setUpdateData({
        kycId: '',
        remarks: '',
        verdict: '1'
      });
      setShowUpdateForm(false);
      setSelectedCustomer(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error updating KYC:', error);
      toast.error(error?.reason || 'Failed to update KYC status. Make sure you have access to this customer.');
    } finally {
      setUpdatingKYC(false);
    }
  };

  const handleViewCustomer = async (kycId: string) => {
    if (!contract) return;

    setFetchingCustomer(true);
    try {
      const details = await contract.getCustomerDetails(kycId);
      setSelectedCustomer({
        kycId: details.kycId,
        name: details.name,
        pan: details.pan,
        kycStatus: Number(details.kycStatus),
        vcHash: details.vcHash
      });
      toast.success('Customer details loaded!');
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error('Unable to fetch customer details');
      setSelectedCustomer(null);
    } finally {
      setFetchingCustomer(false);
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
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
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">KYC Requests</h1>
        </div>
        <p className="text-muted-foreground">Manage your KYC requests and update verification statuses</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Request New KYC */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Request New KYC</h2>
          </div>
          {!showRequestForm ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Submit a new KYC verification request for a customer
              </p>
              <Button onClick={() => setShowRequestForm(true)} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create New Request
              </Button>
            </>
          ) : (
            <form onSubmit={handleRequestKYC} className="space-y-4">
              <div>
                <Label htmlFor="kycIdRequest">Customer KYC ID</Label>
                <Input
                  id="kycIdRequest"
                  value={kycIdToRequest}
                  onChange={(e) => setKycIdToRequest(e.target.value)}
                  placeholder="Enter customer KYC ID"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The customer must be registered in the system by an admin
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={requestingKYC} className="flex-1">
                  {requestingKYC && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {requestingKYC ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowRequestForm(false);
                    setKycIdToRequest('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Update KYC Status */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Update KYC Status</h2>
          </div>
          {!showUpdateForm ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Review and update the verification status for a customer
              </p>
              <Button onClick={() => setShowUpdateForm(true)} className="w-full gap-2" variant="secondary">
                <FileText className="w-4 h-4" />
                Update Status
              </Button>
            </>
          ) : (
            <form onSubmit={handleUpdateKYC} className="space-y-4">
              <div>
                <Label htmlFor="kycIdUpdate">Customer KYC ID</Label>
                <Input
                  id="kycIdUpdate"
                  value={updateData.kycId}
                  onChange={(e) => setUpdateData({...updateData, kycId: e.target.value})}
                  placeholder="Enter KYC ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="verdict">Verification Decision</Label>
                <select
                  id="verdict"
                  value={updateData.verdict}
                  onChange={(e) => setUpdateData({...updateData, verdict: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">✓ Approve KYC</option>
                  <option value="2">✗ Reject KYC</option>
                </select>
              </div>
              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData({...updateData, remarks: e.target.value})}
                  placeholder="Add verification notes or reasons for decision..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updatingKYC} className="flex-1">
                  {updatingKYC && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {updatingKYC ? 'Updating...' : 'Update Status'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowUpdateForm(false);
                    setUpdateData({
                      kycId: '',
                      remarks: '',
                      verdict: '1'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <div className="mb-8 p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Customer Details</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedCustomer(null)}
            >
              Close
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm mb-1 block">Full Name</Label>
              <p className="font-semibold">{selectedCustomer.name}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm mb-1 block">KYC ID</Label>
              <p className="font-semibold font-mono">{selectedCustomer.kycId}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm mb-1 block">PAN Number</Label>
              <p className="font-semibold font-mono">{selectedCustomer.pan}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm mb-1 block">Current Status</Label>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded font-medium ${getStatusColor(selectedCustomer.kycStatus)}`}>
                {getStatusIcon(selectedCustomer.kycStatus)}
                {getStatusLabel(selectedCustomer.kycStatus)}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={() => {
                setUpdateData({ ...updateData, kycId: selectedCustomer.kycId });
                setShowUpdateForm(true);
                setSelectedCustomer(null);
              }}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Update This Customer's Status
            </Button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
        {loading ? (
          <div className="p-12 rounded-lg bg-card border border-border text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 rounded-lg bg-card border border-border text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Requests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Submit your first KYC request to get started
            </p>
            <Button onClick={() => setShowRequestForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Request
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request, index) => (
              <div key={index} className="p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold font-mono">{request.kycId}</p>
                    <p className="text-sm text-muted-foreground">Requested: {request.timestamp}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCustomer(request.kycId)}
                    disabled={fetchingCustomer}
                  >
                    {fetchingCustomer ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank/customers')}
          >
            <Search className="w-6 h-6" />
            <span>Search Customers</span>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank')}
          >
            <FileText className="w-6 h-6" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Request Management</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Submit KYC requests for customers registered by admins</li>
              <li>• Review customer information before updating status</li>
              <li>• Approve or reject KYC verification after document review</li>
              <li>• All actions are recorded on the blockchain for transparency</li>
              <li>• Add remarks to provide context for your verification decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
