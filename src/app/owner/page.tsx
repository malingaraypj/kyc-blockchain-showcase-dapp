"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OwnerDashboard() {
  const { isConnected, userRole, isCorrectNetwork, isCheckingRole } = useWeb3();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while role is being checked
    if (isCheckingRole) {
      return;
    }

    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    // Redirect owner to admin dashboard only once when role is determined
    if (userRole === 'owner' && !hasRedirected) {
      setHasRedirected(true);
      router.push('/admin');
    } else if (userRole && userRole !== 'owner' && !hasRedirected) {
      setHasRedirected(true);
      router.push('/');
    }
  }, [isConnected, isCorrectNetwork, userRole, isCheckingRole, router, hasRedirected]);

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}