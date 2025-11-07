"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Shield, Building2, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function CustomerDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account, isCheckingRole } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while role is being checked
    if (isCheckingRole) {
      return;
    }

    // Redirect if not connected or wrong network
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    // Only redirect if role is determined and is NOT customer
    if (userRole && userRole !== 'customer') {
      router.push('/');
      return;
    }
  }, [isConnected, isCorrectNetwork, userRole, isCheckingRole, router]);

  // Show loading state while determining role
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

  // TODO: Fetch real blockchain data
  const kycStatus = 'Not Verified';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Pending':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Customer Dashboard</h1>
        <p className="text-muted-foreground">View your KYC status and authorized banks</p>
      </div>

      {/* KYC Status Card */}
      <div className="mb-8 p-8 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">KYC Status</h2>
            <p className="text-muted-foreground">Current verification status</p>
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border font-medium ${getStatusColor(kycStatus)}`}>
          <CheckCircle className="w-4 h-4" />
          {kycStatus}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Authorized Banks</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">Today</div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
          </div>
        </div>
      </div>

      {/* Authorized Banks */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authorized Banks</h2>
        <div className="p-8 rounded-lg bg-card border border-border text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No banks have been authorized yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Banks will appear here once they are granted access to your KYC information
          </p>
        </div>
      </div>

      {/* Request History */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Request History</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No request history available</p>
            <p className="text-sm mt-2">Your KYC request history will appear here</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Customer Access</h3>
            <p className="text-sm text-muted-foreground">
              You can view your KYC verification status, track which banks have requested access, 
              and see your verification history. Contact an administrator to update your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}