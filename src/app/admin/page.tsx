"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Users, Building2, FileText, AlertCircle, CheckCircle, XCircle, Clock, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Bank {
  address: string;
  name: string;
  id: number;
}

interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
}

export default function AdminDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalBanks: 0,
    pendingRequests: 0,
    verifiedCustomers: 0
  });

  // Add Bank State
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [addingBank, setAddingBank] = useState(false);

  // Add Customer State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    pan: '',
    kycId: '',
    ipfsAadhar: '',
    ipfsPan: '',
    vcHash: ''
  });
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Add Admin State
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    if (isCheckingRole) {
      return;
    }

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
    if (contract && account && (userRole === 'admin' || userRole === 'owner')) {
      fetchStats();
    }
  }, [contract, account, userRole]);

  const fetchStats = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const [banksCount, customersCount] = await Promise.all([
        contract.getAllBanksCount(),
        contract.getAllCustomersCount()
      ]);
      
      setStats({
        totalBanks: Number(banksCount),
        totalCustomers: Number(customersCount),
        pendingRequests: 0,
        verifiedCustomers: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !bankName || !bankAddress) return;

    setAddingBank(true);
    try {
      const tx = await contract.addBank(bankName, bankAddress);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success(`Bank "${bankName}" added successfully!`);
      setBankName('');
      setBankAddress('');
      setShowAddBank(false);
      fetchStats();
    } catch (error: any) {
      console.error('Error adding bank:', error);
      toast.error(error?.reason || 'Failed to add bank');
    } finally {
      setAddingBank(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !customerData.name || !customerData.pan || !customerData.kycId) return;

    setAddingCustomer(true);
    try {
      const vcHash = customerData.vcHash || '0x0000000000000000000000000000000000000000000000000000000000000000';
      const tx = await contract.addCustomer(
        customerData.name,
        customerData.pan,
        customerData.kycId,
        customerData.ipfsAadhar || '',
        customerData.ipfsPan || '',
        vcHash
      );
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success(`Customer "${customerData.name}" added successfully!`);
      setCustomerData({
        name: '',
        pan: '',
        kycId: '',
        ipfsAadhar: '',
        ipfsPan: '',
        vcHash: ''
      });
      setShowAddCustomer(false);
      fetchStats();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error?.reason || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !adminAddress) return;

    setAddingAdmin(true);
    try {
      const tx = await contract.addAdmin(adminAddress);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success('Admin added successfully!');
      setAdminAddress('');
      setShowAddAdmin(false);
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error(error?.reason || 'Failed to add admin');
    } finally {
      setAddingAdmin(false);
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

  if (userRole !== 'admin' && userRole !== 'owner') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the KYC system, banks, and customers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.totalCustomers}</div>
          <div className="text-sm text-muted-foreground">Total Customers</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.totalBanks}</div>
          <div className="text-sm text-muted-foreground">Active Banks</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pendingRequests}</div>
          <div className="text-sm text-muted-foreground">Pending Requests</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.verifiedCustomers}</div>
          <div className="text-sm text-muted-foreground">Verified Customers</div>
        </div>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Add Bank */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Add Bank</h3>
          </div>
          {!showAddBank ? (
            <Button onClick={() => setShowAddBank(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add New Bank
            </Button>
          ) : (
            <form onSubmit={handleAddBank} className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., State Bank of India"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Input
                  id="bankAddress"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addingBank} className="flex-1">
                  {addingBank && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {addingBank ? 'Adding...' : 'Add Bank'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddBank(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Add Customer */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Add Customer</h3>
          </div>
          {!showAddCustomer ? (
            <Button onClick={() => setShowAddCustomer(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add New Customer
            </Button>
          ) : (
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <Label htmlFor="custName">Name</Label>
                <Input
                  id="custName"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  value={customerData.pan}
                  onChange={(e) => setCustomerData({...customerData, pan: e.target.value})}
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
              <div>
                <Label htmlFor="kycId">KYC ID</Label>
                <Input
                  id="kycId"
                  value={customerData.kycId}
                  onChange={(e) => setCustomerData({...customerData, kycId: e.target.value})}
                  placeholder="Unique KYC ID"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addingCustomer} className="flex-1">
                  {addingCustomer && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {addingCustomer ? 'Adding...' : 'Add'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Add Admin */}
        {userRole === 'owner' && (
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold">Add Admin</h3>
            </div>
            {!showAddAdmin ? (
              <Button onClick={() => setShowAddAdmin(true)} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add New Admin
              </Button>
            ) : (
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="adminAddress">Admin Address</Label>
                  <Input
                    id="adminAddress"
                    value={adminAddress}
                    onChange={(e) => setAdminAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingAdmin} className="flex-1">
                    {addingAdmin && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {addingAdmin ? 'Adding...' : 'Add Admin'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/banks')}
          >
            <Building2 className="w-6 h-6" />
            <span>Manage Banks</span>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/customers')}
          >
            <Users className="w-6 h-6" />
            <span>Manage Customers</span>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/requests')}
          >
            <FileText className="w-6 h-6" />
            <span>Review Requests</span>
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Admin Capabilities</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Add and manage banks in the system</li>
              <li>• Onboard new customers with KYC information</li>
              <li>• Approve or reject KYC requests from banks</li>
              <li>• View system-wide statistics and activities</li>
              {userRole === 'owner' && <li>• Add new admins to help manage the system</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}