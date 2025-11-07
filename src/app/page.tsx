"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Users, FileCheck, ArrowRight, Check, Lock, Zap, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isContractConfigured } from '@/lib/contract';

export default function Home() {
  const { isConnected, userRole, connectWallet, isCorrectNetwork, isCheckingRole } = useWeb3();
  const router = useRouter();
  const contractConfigured = isContractConfigured();

  const handleDashboardNavigation = () => {
    if (userRole) {
      router.push(`/${userRole}`);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure & Decentralized",
      description: "KYC data stored on blockchain with cryptographic verification"
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description: "Customer data accessible only to authorized banks and admins"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Real-time KYC status updates and approval management"
    },
    {
      icon: Globe,
      title: "Multi-Bank Access",
      description: "Share verified KYC across multiple financial institutions"
    }
  ];

  const roles = [
    {
      icon: Shield,
      title: "Admin",
      description: "Manage banks, customers, and KYC requests",
      color: "text-blue-500"
    },
    {
      icon: Building2,
      title: "Bank",
      description: "Request and verify customer KYC information",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Customer",
      description: "View your KYC status and authorized banks",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contract Not Configured Warning */}
      {!contractConfigured && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 py-3 px-4">
          <div className="container mx-auto max-w-6xl flex items-center gap-3 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              <strong>Contract not configured:</strong> Please deploy your smart contract on Sepolia testnet and add the address to <code className="px-1.5 py-0.5 rounded bg-orange-500/20 font-mono text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code className="px-1.5 py-0.5 rounded bg-orange-500/20 font-mono text-xs">.env.local</code>
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              Powered by Ethereum Sepolia Testnet
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Decentralized KYC
              <br />
              <span className="text-primary">Management System</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline customer verification with blockchain technology. Secure, transparent, and efficient KYC management for financial institutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {!isConnected ? (
                <Button onClick={connectWallet} size="lg" className="gap-2 text-lg px-8">
                  Connect Wallet
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : isCheckingRole ? (
                <Button size="lg" className="gap-2 text-lg px-8" disabled>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking Role...
                </Button>
              ) : (
                <Button onClick={handleDashboardNavigation} size="lg" className="gap-2 text-lg px-8" disabled={!userRole}>
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card border border-border text-center">
              <FileCheck className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Transparent</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border text-center">
              <Lock className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">Secure</div>
              <div className="text-sm text-muted-foreground">On-Chain Storage</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">Instant</div>
              <div className="text-sm text-muted-foreground">Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with security, privacy, and efficiency at its core
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple workflow for all stakeholders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="p-8 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                <role.icon className={`w-12 h-12 mb-4 ${role.color}`} />
                <h3 className="text-xl font-semibold mb-3">{role.title}</h3>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2 text-sm">
                  {role.title === 'Admin' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Add and manage banks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Onboard customers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Approve KYC requests</span>
                      </li>
                    </>
                  )}
                  {role.title === 'Bank' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Submit KYC requests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Update KYC status</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>View customer records</span>
                      </li>
                    </>
                  )}
                  {role.title === 'Customer' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>View KYC status</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Track bank requests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Access verification history</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Connect your wallet to access the platform. Make sure you're on the Sepolia testnet.
          </p>
          {!isConnected ? (
            <Button onClick={connectWallet} size="lg" variant="secondary" className="gap-2 text-lg px-8">
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : isCheckingRole ? (
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8" disabled>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking Role...
            </Button>
          ) : (
            <Button onClick={handleDashboardNavigation} size="lg" variant="secondary" className="gap-2 text-lg px-8" disabled={!userRole}>
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}