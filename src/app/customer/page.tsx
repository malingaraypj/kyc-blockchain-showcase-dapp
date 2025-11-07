"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Shield, Building2, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { dummyStats, dummyBanks, dummyKYCRequests } from '@/lib/dummyData';

export default function CustomerDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account } = useWeb3();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string>(dummyStats.customer.kycStatus);

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    if (userRole !== 'customer') {
      router.push('/');
    }
  }, [isConnected, isCorrectNetwork, userRole, router]);

  if (!isConnected || userRole !== 'customer') {
    return null;
  }

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

  // Get authorized banks (banks that have approved requests for this customer)
  const authorizedBanks = dummyBanks.filter(bank => 
    dummyKYCRequests.some(req => 
      req.bankAddress === bank.address && 
      req.status === 'Approved'
    )
  );

  // Get customer's request history
  const myRequests = dummyKYCRequests.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Dummy Data Warning Banner */}
      <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-500 mb-1">Displaying Dummy Data</h3>
            <p className="text-sm text-muted-foreground">
              This is temporary test data. Once you deploy your smart contract and add the address to .env.local, 
              real blockchain data will be displayed here.
            </p>
          </div>
        </div>
      </div>

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
            <div className="text-2xl font-bold">{dummyStats.customer.authorizedBanks}</div>
            <div className="text-sm text-muted-foreground">Authorized Banks</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{dummyStats.customer.totalRequests}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{new Date(dummyStats.customer.lastUpdated).toLocaleDateString()}</div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
          </div>
        </div>
      </div>

      {/* Authorized Banks */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authorized Banks</h2>
        {authorizedBanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorizedBanks.map((bank, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{bank.name}</h3>
                    <p className="text-sm text-muted-foreground">{bank.registrationNumber}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {bank.address.slice(0, 10)}...{bank.address.slice(-8)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-lg bg-card border border-border text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No banks have been authorized yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Banks will appear here once they are granted access to your KYC information
            </p>
          </div>
        )}
      </div>

      {/* Request History */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Request History</h2>
        <div className="space-y-4">
          {myRequests.map((request) => (
            <div key={request.id} className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{request.bankName}</h3>
                  <p className="text-sm text-muted-foreground">{request.notes}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium ${
                  request.status === 'Pending' 
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : request.status === 'Approved'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {request.status === 'Pending' && <Clock className="w-3 h-3" />}
                  {request.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Requested on {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
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