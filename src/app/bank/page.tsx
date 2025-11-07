"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { dummyStats, dummyCustomers, dummyKYCRequests } from '@/lib/dummyData';

export default function BankDashboard() {
  const { isConnected, userRole, isCorrectNetwork, account } = useWeb3();
  const router = useRouter();
  const [stats, setStats] = useState(dummyStats.bank);

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    if (userRole !== 'bank') {
      router.push('/');
    }
  }, [isConnected, isCorrectNetwork, userRole, router]);

  if (!isConnected || userRole !== 'bank') {
    return null;
  }

  const myRequests = dummyKYCRequests.slice(0, 4);

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
        <div className="space-y-4">
          {myRequests.map((request) => (
            <div key={request.id} className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{request.customerName}</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {request.customerAddress.slice(0, 10)}...{request.customerAddress.slice(-8)}
                  </p>
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
                Requested on {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Customers */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Verified Customers</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Customer Name</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">KYC Status</th>
                  <th className="text-left p-4 font-semibold">Authorized Banks</th>
                </tr>
              </thead>
              <tbody>
                {dummyCustomers.filter(c => c.kycStatus === 'Verified').slice(0, 3).map((customer, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4 text-muted-foreground">{customer.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{customer.authorizedBanks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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