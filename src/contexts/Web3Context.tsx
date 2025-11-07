"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { getContract, SEPOLIA_CHAIN_ID, switchToSepolia, isContractConfigured } from '@/lib/contract';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  userRole: 'owner' | 'admin' | 'bank' | 'customer' | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  checkUserRole: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'bank' | 'customer' | null>(null);

  const isConnected = !!account;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  const checkUserRole = async () => {
    if (!contract || !account) {
      setUserRole(null);
      return;
    }

    try {
      const owner = await contract.owner();
      if (owner.toLowerCase() === account.toLowerCase()) {
        setUserRole('owner');
        return;
      }

      const isAdmin = await contract.isAdmin(account);
      if (isAdmin) {
        setUserRole('admin');
        return;
      }

      const isBank = await contract.isBank(account);
      if (isBank) {
        setUserRole('bank');
        return;
      }

      setUserRole('customer');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      
      setProvider(browserProvider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      const signerInstance = await browserProvider.getSigner();
      setSigner(signerInstance);

      // Only create contract if address is configured
      if (isContractConfigured()) {
        try {
          const contractInstance = getContract(signerInstance);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
          setContract(null);
        }
      } else {
        console.warn('Contract address not configured. Please add NEXT_PUBLIC_CONTRACT_ADDRESS to .env.local');
        setContract(null);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserRole(null);
  };

  const switchNetwork = async () => {
    await switchToSepolia();
  };

  useEffect(() => {
    if (contract && account && isCorrectNetwork) {
      checkUserRole();
    } else {
      setUserRole(null);
    }
  }, [contract, account, chainId, isCorrectNetwork]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: Web3ContextType = {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    provider,
    signer,
    contract,
    userRole,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    checkUserRole,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};