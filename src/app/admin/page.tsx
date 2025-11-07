"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { dummyStats, dummyBanks, dummyCustomers, dummyKYCRequests } from '@/lib/dummyData';

export default function AdminDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account } = useWeb3();
  const router = useRouter();
  const [stats, setStats] = useState(dummyStats.admin);

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    if (userRole !== 'admin' && userRole !== 'owner') {
      router.push('/');
    }
  }, [isConnected, isCorrectNetwork, userRole, router]);

  if (!isConnected || (userRole !== 'admin' && userRole !== 'owner')) {
    return null;
  }

  const recentRequests = dummyKYCRequests.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Bank Name</th>
                  <th className="text-left p-4 font-semibold">Registration No.</th>
                  <th className="text-left p-4 font-semibold">Address</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyBanks.slice(0, 3).map((bank, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4 font-medium">{bank.name}</td>
                    <td className="p-4 text-muted-foreground">{bank.registrationNumber}</td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">
                      {bank.address.slice(0, 6)}...{bank.address.slice(-4)}
                    </td>
                    <td className="p-4">
                      {bank.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent KYC Requests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent KYC Requests</h2>
        <div className="space-y-4">
          {recentRequests.map((request) => (
            <div key={request.id} className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{request.customerName}</h3>
                  <p className="text-sm text-muted-foreground">Requested by {request.bankName}</p>
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
                  {request.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{request.notes}</p>
              <p className="text-xs text-muted-foreground">
                Requested on {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
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