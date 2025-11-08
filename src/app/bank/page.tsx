"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, FileText, CheckCircle, AlertCircle, Clock, XCircle, Plus, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
}

export default function BankDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedCustomers: 0,
    pendingVerifications: 0,
    rejectedRequests: 0
  });

  // Request KYC State
  const [showRequestKYC, setShowRequestKYC] = useState(false);
  const [kycIdToRequest, setKycIdToRequest] = useState('');
  const [requestingKYC, setRequestingKYC] = useState(false);

  // Update KYC State
  const [showUpdateKYC, setShowUpdateKYC] = useState(false);
  const [updateData, setUpdateData] = useState({
    kycId: '',
    bankName: '',
    remarks: '',
    verdict: '1' // 1 = approved, 2 = rejected
  });
  const [updatingKYC, setUpdatingKYC] = useState(false);

  // View Customer State
  const [showViewCustomer, setShowViewCustomer] = useState(false);
  const [searchKycId, setSearchKycId] = useState('');
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
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
      fetchStats();
    }
  }, [contract, account, userRole]);

  const fetchStats = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      // Since we don't have direct methods to get bank-specific stats,
      // we'll show basic counts
      setStats({
        totalRequests: 0,
        approvedCustomers: 0,
        pendingVerifications: 0,
        rejectedRequests: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      setShowRequestKYC(false);
      fetchStats();
    } catch (error: any) {
      console.error('Error requesting KYC:', error);
      toast.error(error?.reason || 'Failed to submit KYC request');
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
      
      // Updated function signature - removed bankName and timestamp
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
        bankName: '',
        remarks: '',
        verdict: '1'
      });
      setShowUpdateKYC(false);
      fetchStats();
    } catch (error: any) {
      console.error('Error updating KYC:', error);
      toast.error(error?.reason || 'Failed to update KYC status');
    } finally {
      setUpdatingKYC(false);
    }
  };

  const handleViewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !searchKycId) return;

    setFetchingCustomer(true);
    try {
      const details = await contract.getCustomerDetails(searchKycId);
      setCustomerDetails({
        kycId: details.kycId,
        name: details.name,
        pan: details.pan,
        kycStatus: Number(details.kycStatus),
        vcHash: details.vcHash
      });
      toast.success('Customer details retrieved!');
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error('Customer not found or access denied');
      setCustomerDetails(null);
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
      case 0: return 'text-orange-500 bg-orange-500/10';
      case 1: return 'text-green-500 bg-green-500/10';
      case 2: return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
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

  if (userRole !== 'bank') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bank Dashboard</h1>
        <p className="text-muted-foreground">Manage customer KYC requests and verifications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalRequests}</div>
          <div className="text-sm text-muted-foreground">Total Requests</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.approvedCustomers}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pendingVerifications}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.rejectedRequests}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Bank Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Request KYC */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Request KYC</h3>
          </div>
          {!showRequestKYC ? (
            <Button onClick={() => setShowRequestKYC(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              New KYC Request
            </Button>
          ) : (
            <form onSubmit={handleRequestKYC} className="space-y-4">
              <div>
                <Label htmlFor="kycIdRequest">Customer KYC ID</Label>
                <Input
                  id="kycIdRequest"
                  value={kycIdToRequest}
                  onChange={(e) => setKycIdToRequest(e.target.value)}
                  placeholder="Enter KYC ID"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={requestingKYC} className="flex-1">
                  {requestingKYC && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {requestingKYC ? 'Submitting...' : 'Submit'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestKYC(false)}>
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
            <h3 className="text-xl font-semibold">Update KYC</h3>
          </div>
          {!showUpdateKYC ? (
            <Button onClick={() => setShowUpdateKYC(true)} className="w-full gap-2" variant="secondary">
              Update Status
            </Button>
          ) : (
            <form onSubmit={handleUpdateKYC} className="space-y-3">
              <div>
                <Label htmlFor="kycIdUpdate">KYC ID</Label>
                <Input
                  id="kycIdUpdate"
                  value={updateData.kycId}
                  onChange={(e) => setUpdateData({...updateData, kycId: e.target.value})}
                  placeholder="KYC ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="verdict">Status</Label>
                <select
                  id="verdict"
                  value={updateData.verdict}
                  onChange={(e) => setUpdateData({...updateData, verdict: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">Approve</option>
                  <option value="2">Reject</option>
                </select>
              </div>
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData({...updateData, remarks: e.target.value})}
                  placeholder="Optional remarks"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updatingKYC} className="flex-1">
                  {updatingKYC && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {updatingKYC ? 'Updating...' : 'Update'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUpdateKYC(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* View Customer */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold">View Customer</h3>
          </div>
          {!showViewCustomer ? (
            <Button onClick={() => setShowViewCustomer(true)} className="w-full gap-2" variant="outline">
              <Search className="w-4 h-4" />
              Search Customer
            </Button>
          ) : (
            <form onSubmit={handleViewCustomer} className="space-y-4">
              <div>
                <Label htmlFor="searchKyc">KYC ID</Label>
                <Input
                  id="searchKyc"
                  value={searchKycId}
                  onChange={(e) => setSearchKycId(e.target.value)}
                  placeholder="Enter KYC ID"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={fetchingCustomer} className="flex-1">
                  {fetchingCustomer && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {fetchingCustomer ? 'Searching...' : 'Search'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowViewCustomer(false);
                  setCustomerDetails(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Customer Details Display */}
      {customerDetails && (
        <div className="mb-8 p-6 rounded-lg bg-card border border-border">
          <h3 className="text-xl font-semibold mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{customerDetails.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">KYC ID</Label>
              <p className="font-medium">{customerDetails.kycId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">PAN Number</Label>
              <p className="font-medium">{customerDetails.pan}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">KYC Status</Label>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md font-medium ${getStatusColor(customerDetails.kycStatus)}`}>
                {getStatusLabel(customerDetails.kycStatus)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank/customers')}
          >
            <Users className="w-6 h-6" />
            <span>View All Customers</span>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank/requests')}
          >
            <FileText className="w-6 h-6" />
            <span>My Requests</span>
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Bank Capabilities</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Submit KYC verification requests for customers</li>
              <li>• Update KYC status (approve/reject) after verification</li>
              <li>• View customer details you have access to</li>
              <li>• Track your KYC request history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}