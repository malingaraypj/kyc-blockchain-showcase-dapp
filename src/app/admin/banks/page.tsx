"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Bank {
  address: string;
  name: string;
  id: number;
}

export default function ManageBanksPage() {
  const { isConnected, userRole, isCorrectNetwork, contract, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [addingBank, setAddingBank] = useState(false);

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
      fetchBanks();
    }
  }, [contract, userRole]);

  const fetchBanks = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const banksCount = await contract.getAllBanksCount();
      const count = Number(banksCount);
      
      const banksList: Bank[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const bankData = await contract.getAllBanks(i);
          banksList.push({
            id: i,
            address: bankData[0],
            name: bankData[1]
          });
        } catch (err) {
          console.error(`Error fetching bank ${i}:`, err);
        }
      }
      
      setBanks(banksList);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to fetch banks');
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
      setShowAddForm(false);
      fetchBanks();
    } catch (error: any) {
      console.error('Error adding bank:', error);
      toast.error(error?.reason || 'Failed to add bank');
    } finally {
      setAddingBank(false);
    }
  };

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
        <h1 className="text-4xl font-bold mb-2">Manage Banks</h1>
        <p className="text-muted-foreground">View and manage all banks in the KYC system</p>
      </div>

      {/* Add Bank Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Add New Bank</h2>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Bank
            </Button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleAddBank} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="bankAddress">Bank Ethereum Address</Label>
                <Input
                  id="bankAddress"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addingBank}>
                {addingBank && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {addingBank ? 'Adding Bank...' : 'Add Bank'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Banks List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">All Banks ({banks.length})</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : banks.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Banks Found</h3>
            <p className="text-muted-foreground mb-4">Add your first bank to get started</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Bank
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banks.map((bank, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{bank.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Address:</span>{' '}
                          <code className="px-2 py-1 rounded bg-muted font-mono text-xs">
                            {bank.address}
                          </code>
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Bank ID:</span> {bank.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
