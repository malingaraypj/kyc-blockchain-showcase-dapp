"use client";

import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Building2, User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { account, isConnected, userRole, connectWallet, disconnectWallet, isCorrectNetwork, switchNetwork } = useWeb3();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'owner':
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'bank':
        return <Building2 className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleName = () => {
    if (!userRole) return 'Not Registered';
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">KYC Chain</span>
            </Link>
            
            {isConnected && isCorrectNetwork && userRole && (
              <div className="hidden md:flex items-center gap-4">
                <Link href={`/${userRole}`}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                {(userRole === 'admin' || userRole === 'owner') && (
                  <>
                    <Link href="/admin/customers">
                      <Button variant="ghost">Customers</Button>
                    </Link>
                    <Link href="/admin/banks">
                      <Button variant="ghost">Banks</Button>
                    </Link>
                    <Link href="/admin/requests">
                      <Button variant="ghost">Requests</Button>
                    </Link>
                  </>
                )}
                {userRole === 'bank' && (
                  <>
                    <Link href="/bank/customers">
                      <Button variant="ghost">Customers</Button>
                    </Link>
                    <Link href="/bank/requests">
                      <Button variant="ghost">My Requests</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                {!isCorrectNetwork && (
                  <Button onClick={switchNetwork} variant="destructive" size="sm">
                    Switch to Sepolia
                  </Button>
                )}
                
                {isCorrectNetwork && userRole && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground">
                    {getRoleIcon()}
                    <span className="text-sm font-medium">{getRoleName()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-mono">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                
                <Button onClick={disconnectWallet} variant="ghost" size="icon">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={connectWallet} className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
