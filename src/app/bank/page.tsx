"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

export default function BankDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account } = useWeb3();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for wallet and role to be determined
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    // Only redirect if role is explicitly set and is NOT bank
    if (userRole && userRole !== 'bank') {
      router.push('/');
      return;
    }
    
    // If connected and role is bank (or still loading), mark as ready
    if (userRole === 'bank') {
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

  if (userRole !== 'bank') {
    return null;
  }

  // TODO: Fetch real blockchain data
  const stats = {
    totalRequests: 0,
    approvedCustomers: 0,
    pendingVerifications: 0,
    rejectedRequests: 0
  };

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

      {/* My Recent Requests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Recent Requests</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No requests submitted yet</p>
            <p className="text-sm mt-2">Your KYC requests will appear here</p>
          </div>
        </div>
      </div>

      {/* Verified Customers */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Verified Customers</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No verified customers yet</p>
            <p className="text-sm mt-2">Verified customers will appear here</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank/customers')}
          >
            <Users className="w-6 h-6" />
            <span>View All Customers</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push('/bank/requests')}
          >
            <FileText className="w-6 h-6" />
            <span>My Requests</span>
          </Button>
        </div>
      </div>
    </div>
  );
}