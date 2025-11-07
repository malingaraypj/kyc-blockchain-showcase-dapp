"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OwnerDashboard() {
  const { isConnected, userRole, isCorrectNetwork } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork) {
      router.push('/');
      return;
    }
    
    // Redirect owner to admin dashboard (they have same permissions)
    if (userRole === 'owner') {
      router.push('/admin');
    } else if (userRole !== 'owner') {
      router.push('/');
    }
  }, [isConnected, isCorrectNetwork, userRole, router]);

  return null;
}
