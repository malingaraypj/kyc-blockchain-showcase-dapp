"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Users, FileCheck, ArrowRight, Check, Lock, Zap, Globe, AlertCircle, Loader2, TrendingUp, Database, FileSearch } from 'lucide-react';
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
      description: "KYC data stored on Ethereum blockchain with cryptographic verification and immutable records"
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description: "Customer data accessible only to authorized banks and admins with role-based access control"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Real-time KYC status updates and instant approval management through smart contracts"
    },
    {
      icon: Globe,
      title: "Multi-Bank Access",
      description: "Share verified KYC across multiple financial institutions without re-verification"
    },
    {
      icon: Database,
      title: "Blockchain Storage",
      description: "Permanent and transparent record of all KYC activities on Sepolia testnet"
    },
    {
      icon: FileSearch,
      title: "Easy Verification",
      description: "Simple search and retrieval of customer KYC information for authorized parties"
    }
  ];

  const roles = [
    {
      icon: Shield,
      title: "Admin",
      description: "Complete system control and oversight capabilities",
      color: "text-blue-500",
      features: [
        "Add and manage banks in the ecosystem",
        "Onboard new customers with KYC details",
        "Review and approve KYC requests from banks",
        "Add additional administrators (owner only)",
        "View system-wide statistics and activities",
        "Monitor all blockchain transactions"
      ]
    },
    {
      icon: Building2,
      title: "Bank",
      description: "Verify and manage customer KYC information",
      color: "text-green-500",
      features: [
        "Submit KYC verification requests",
        "Update customer KYC status (approve/reject)",
        "View authorized customer details",
        "Track request history and approvals",
        "Add verification remarks and timestamps",
        "Access customer PAN and Aadhaar hashes"
      ]
    },
    {
      icon: Users,
      title: "Customer",
      description: "View your KYC status and verification history",
      color: "text-purple-500",
      features: [
        "Check KYC verification status in real-time",
        "View which banks requested your information",
        "See complete verification history",
        "Access your PAN and KYC ID details",
        "Track approval/rejection timeline",
        "Verify blockchain record authenticity"
      ]
    }
  ];

  const workflow = [
    {
      step: "1",
      title: "Admin Onboards Entities",
      description: "Admin adds banks to the system and registers customers with their KYC details including PAN, Aadhaar hashes, and unique KYC IDs."
    },
    {
      step: "2",
      title: "Bank Requests KYC",
      description: "Banks submit verification requests for customers they want to onboard, initiating the KYC review process."
    },
    {
      step: "3",
      title: "Verification Process",
      description: "Banks review customer documents and update KYC status on blockchain with approval/rejection and detailed remarks."
    },
    {
      step: "4",
      title: "Customer Access",
      description: "Customers can view their verification status, see which banks have access, and track their complete KYC history."
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
              Streamline customer verification with blockchain technology. Secure, transparent, and efficient KYC management for financial institutions with smart contract automation.
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
            <div className="p-6 rounded-lg bg-card border border-border text-center hover:shadow-lg transition-shadow">
              <FileCheck className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Transparent Records</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border text-center hover:shadow-lg transition-shadow">
              <Lock className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">Secure</div>
              <div className="text-sm text-muted-foreground">Blockchain Storage</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border text-center hover:shadow-lg transition-shadow">
              <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">Instant</div>
              <div className="text-sm text-muted-foreground">Smart Contracts</div>
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
              Built with security, privacy, and efficiency at its core. Experience the future of KYC management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border hover:shadow-lg hover:border-primary/50 transition-all">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple and efficient workflow for all stakeholders in the KYC ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {workflow.map((item, index) => (
              <div key={index} className="relative">
                <div className="p-6 rounded-lg bg-card border border-border h-full">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Roles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="p-8 rounded-lg bg-card border border-border hover:border-primary transition-all">
                <role.icon className={`w-12 h-12 mb-4 ${role.color}`} />
                <h3 className="text-xl font-semibold mb-3">{role.title}</h3>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2 text-sm">
                  {role.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the advantages of blockchain-powered KYC management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reduced Processing Time</h3>
              <p className="text-muted-foreground">
                Smart contracts automate verification workflows, reducing KYC processing time from days to minutes. Instant updates and real-time status tracking.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Enhanced Security</h3>
              <p className="text-muted-foreground">
                Blockchain immutability ensures KYC records cannot be tampered with. Cryptographic hashing protects sensitive customer information.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Improved Customer Experience</h3>
              <p className="text-muted-foreground">
                One-time verification can be shared across multiple banks. Customers maintain control and visibility over their KYC status.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <FileCheck className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Regulatory Compliance</h3>
              <p className="text-muted-foreground">
                Complete audit trail of all KYC activities. Transparent record-keeping helps meet regulatory requirements and simplifies compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Connect your MetaMask wallet to access the platform. Make sure you're on the Sepolia testnet to interact with the smart contract.
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
          <p className="text-sm mt-6 opacity-75">
            Need help? Make sure MetaMask is installed and you have test ETH on Sepolia network.
          </p>
        </div>
      </section>
    </div>
  );
}