"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ReviewRequestsPage() {
  const { isConnected, userRole, isCorrectNetwork, contract, isCheckingRole } = useWeb3();
  const router = useRouter();

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
        <h1 className="text-4xl font-bold mb-2">Review KYC Requests</h1>
        <p className="text-muted-foreground">Monitor and review KYC verification requests from banks</p>
      </div>

      {/* Info Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Request Management</h2>
            <p className="text-muted-foreground mb-4">
              As an admin, you can monitor all KYC requests submitted by banks. Banks are responsible 
              for reviewing and updating KYC statuses directly on the blockchain.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Clock className="w-5 h-5 text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-orange-600">-</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-sm text-muted-foreground">Approved Requests</div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="w-5 h-5 text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-600">-</div>
                <div className="text-sm text-muted-foreground">Rejected Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="p-12 text-center rounded-lg bg-muted/30 border border-dashed border-border">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Request Monitoring</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This page provides oversight of the KYC request workflow. Banks submit requests and update 
          statuses independently. You can view customer statuses in the "Manage Customers" section.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={() => router.push('/admin/customers')} variant="outline">
            View Customers
          </Button>
          <Button onClick={() => router.push('/admin/banks')} variant="outline">
            View Banks
          </Button>
        </div>
      </div>
    </div>
  );
}
