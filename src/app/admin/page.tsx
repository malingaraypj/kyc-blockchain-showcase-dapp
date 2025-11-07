"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account } = useWeb3();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for wallet and role to be determined
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    // Only redirect if role is explicitly set and is NOT admin/owner
    if (userRole && userRole !== 'admin' && userRole !== 'owner') {
      router.push('/');
      return;
    }
    
    // If connected and role is admin/owner (or still loading), mark as ready
    if (userRole === 'admin' || userRole === 'owner') {
      setIsLoading(false);
    }
  }, [isConnected, isCorrectNetwork, userRole, router]);

  // Show loading state while determining role
  if (!isConnected || isLoading) {
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

  // TODO: Fetch real blockchain data
  const stats = {
    totalCustomers: 0,
    totalBanks: 0,
    pendingRequests: 0,
    verifiedCustomers: 0
  };

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
          <div className="text-3xl font-bold mb-1">{stats.totalCustomers}</div>
          <div className="text-sm text-muted-foreground">Total Customers</div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalBanks}</div>
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

      {/* Recent Banks */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Banks</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No banks registered yet</p>
            <p className="text-sm mt-2">Banks will appear here once they are added to the system</p>
          </div>
        </div>
      </div>

      {/* Recent KYC Requests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent KYC Requests</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No KYC requests yet</p>
            <p className="text-sm mt-2">Requests will appear here once banks submit them</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/banks')}
          >
            <Building2 className="w-6 h-6" />
            <span>Manage Banks</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/customers')}
          >
            <Users className="w-6 h-6" />
            <span>Manage Customers</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/admin/requests')}
          >
            <FileText className="w-6 h-6" />
            <span>Review Requests</span>
          </Button>
        </div>
      </div>
    </div>
  );
}