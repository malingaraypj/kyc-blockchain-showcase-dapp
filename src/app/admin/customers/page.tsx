"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Users, Plus, Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  kycId: string;
  name: string;
  pan: string;
  kycStatus: number;
  vcHash: string;
}

export default function ManageCustomersPage() {
  const { isConnected, userRole, isCorrectNetwork, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    pan: '',
    kycId: '',
    ipfsAadhar: '',
    ipfsPan: '',
    vcHash: ''
  });
  const [addingCustomer, setAddingCustomer] = useState(false);

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
      fetchCustomers();
    }
  }, [contract, userRole]);

  const fetchCustomers = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const customersCount = await contract.getAllCustomersCount();
      const count = Number(customersCount);
      
      const customersList: Customer[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const customerData = await contract.getAllCustomers(i);
          customersList.push({
            kycId: customerData[0],
            name: customerData[1],
            pan: customerData[2],
            kycStatus: Number(customerData[3]),
            vcHash: customerData[4] || '0x0000000000000000000000000000000000000000000000000000000000000000'
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
      toast.success(`Customer "${customerData.name}" added successfully with documents uploaded to IPFS!`);
      setCustomerData({
        name: '',
        pan: '',
        kycId: '',
        ipfsAadhar: '',
        ipfsPan: '',
        vcHash: ''
      });
      setShowAddForm(false);
      fetchCustomers();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error?.reason || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending</span>
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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.kycId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.pan.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-4xl font-bold mb-2">Manage Customers</h1>
        <p className="text-muted-foreground">View and manage all customers in the KYC system with document uploads</p>
      </div>

      {/* Add Customer Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Add New Customer</h2>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleAddCustomer} className="space-y-6">
            {/* Basic Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custName">Customer Name *</Label>
                  <Input
                    id="custName"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pan">PAN Number *</Label>
                  <Input
                    id="pan"
                    value={customerData.pan}
                    onChange={(e) => setCustomerData({...customerData, pan: e.target.value})}
                    placeholder="ABCDE1234F"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kycId">KYC ID *</Label>
                  <Input
                    id="kycId"
                    value={customerData.kycId}
                    onChange={(e) => setCustomerData({...customerData, kycId: e.target.value})}
                    placeholder="Unique KYC ID"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                KYC Document Uploads (Stored on IPFS)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Aadhaar Card Image</Label>
                  <ImageUpload
                    value={customerData.ipfsAadhar}
                    onChange={(hash) => setCustomerData({...customerData, ipfsAadhar: hash})}
                    label="Upload Aadhaar Card"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload customer's Aadhaar card. Image will be stored on IPFS.
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">PAN Card Image</Label>
                  <ImageUpload
                    value={customerData.ipfsPan}
                    onChange={(hash) => setCustomerData({...customerData, ipfsPan: hash})}
                    label="Upload PAN Card"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload customer's PAN card. Image will be stored on IPFS.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button type="submit" disabled={addingCustomer}>
                {addingCustomer && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {addingCustomer ? 'Adding Customer...' : 'Add Customer to Blockchain'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddForm(false);
                setCustomerData({
                  name: '',
                  pan: '',
                  kycId: '',
                  ipfsAadhar: '',
                  ipfsPan: '',
                  vcHash: ''
                });
              }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Search and Stats */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, KYC ID, or PAN..."
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Customers List */}
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
            <p className="text-muted-foreground mb-4">Add your first customer to get started</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCustomers.map((customer, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{customer.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(customer.kycStatus)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}