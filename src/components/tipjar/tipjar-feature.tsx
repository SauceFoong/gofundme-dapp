'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { TipJarCard, CreateTipJarForm, WithdrawTipsForm } from './tipjar-ui';
import { Gift, Wallet, TrendingUp } from 'lucide-react';

export function TipJarFeature() {
  const { publicKey } = useWallet();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-bold">GoFundMe</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A place to help you fund your ideas.
        </p>
      </div>

      {!publicKey ? (
        <div className="text-center space-y-4">
          <div className="bg-muted rounded-lg p-8 max-w-md mx-auto">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Please connect your Phantom wallet to start using the tip jar
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CreateTipJarForm />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Your Tip Jar</h2>
            </div>
            <TipJarCard authority={publicKey} />
          </div>
        </div>
      )}
    </div>
  );
} 