"use client";

import React from 'react';
import { Shield, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">KYC Chain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized KYC management system on Ethereum Sepolia testnet.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground">How It Works</Link></li>
              <li><Link href="#about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://docs.soliditylang.org/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Documentation</a></li>
              <li><a href="https://sepolia.etherscan.io/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Sepolia Explorer</a></li>
              <li><a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Get Test ETH</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KYC Chain. Built on Ethereum Sepolia Testnet.</p>
        </div>
      </div>
    </footer>
  );
};
