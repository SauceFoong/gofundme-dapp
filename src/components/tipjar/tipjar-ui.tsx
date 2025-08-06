'use client'

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useTipJar, useTipJarProgram } from './tipjar-data-access';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Gift, Wallet, TrendingUp, MessageCircle, Download, Trash2, DollarSign } from 'lucide-react';
import { useCluster } from '../cluster/cluster-data-access';
import { useQueryClient } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react'; 
import { Transaction, SystemProgram } from '@solana/web3.js';

export function TipJarCard({ authority }: { authority: PublicKey }) {
  const { accountQuery, sendTip, withdrawTip, deleteTipJar } = useTipJar(authority);
  const { publicKey } = useWallet();
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSendTip = async () => {
    if (!tipAmount || !accountQuery.data) return;
    
    try {
      await sendTip.mutateAsync({
        amount: parseFloat(tipAmount),
        message: tipMessage,
      });
      
      toast.success('Tip sent successfully! 🎉');
      setIsTipDialogOpen(false);
      setTipAmount('');
      setTipMessage('');
    } catch (error) {
      toast.error('Failed to send tip');
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !accountQuery.data) return;
    
    try {
      await withdrawTip.mutateAsync({
        amount: parseFloat(withdrawAmount),
      });
      
      toast.success('Withdrawal successful! 💰');
      setWithdrawAmount('');
    } catch (error) {
      toast.error('Failed to withdraw');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!accountQuery.data) return;
    
    try {
      await deleteTipJar.mutateAsync();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (accountQuery.isLoading) {
    return (
      <Card className="w-full min-h-48">
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!accountQuery.data) {
    return (
      <Card className="w-full min-h-48">
        <CardContent className="text-center flex flex-col items-center justify-center h-48">
          <Gift className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Tip jar not found</p>
        </CardContent>
      </Card>
    );
  }

  const tipJar = accountQuery.data;
  const isOwner = publicKey && publicKey.equals(authority);

  return (
    <Card className="w-full min-h-48 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-4 w-4" />
          {tipJar.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">{tipJar.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary">
              {(Number(tipJar.totalTips) / 1e9).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">SOL</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary">
              {Number(tipJar.tipCount)}
            </div>
            <div className="text-xs text-muted-foreground">Tips</div>
          </div>
        </div>
        
        <Dialog open={isTipDialogOpen} onOpenChange={setIsTipDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Gift className="h-3 w-3 mr-1" />
              Send Tip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Send Tip to {tipJar.name}
              </DialogTitle>
              <DialogDescription>
                Support this creator with a SOL tip!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tip-amount">Amount (SOL)</Label>
                <Input
                  id="tip-amount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="0.1"
                />
              </div>
              <div>
                <Label htmlFor="tip-message">Message (optional)</Label>
                <Input
                  id="tip-message"
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  placeholder="Great content!"
                />
              </div>
              <Button 
                onClick={handleSendTip} 
                disabled={!tipAmount || sendTip.isPending}
                className="w-full"
              >
                {sendTip.isPending ? 'Sending...' : 'Send Tip'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isOwner && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Owner Actions:</div>
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-xs h-8"
              />
              <Button 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || withdrawTip.isPending}
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                {withdrawTip.isPending ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
              </Button>
              <Button 
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={deleteTipJar.isPending}
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                {deleteTipJar.isPending ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Delete Tip Jar
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this tip jar? This action cannot be undone, all SOL will be transferred to the owner.
                {Number(tipJar.totalTips) > 0 && (
                  <span className="block mt-2 text-red-500">
                    ⚠️ Warning: This tip jar still has {(Number(tipJar.totalTips) / 1e9).toFixed(4)} SOL. 
                    Please withdraw all funds before deleting.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button 
                onClick={handleDelete} 
                disabled={deleteTipJar.isPending}
                variant="destructive"
                className="w-full"
              >
                {deleteTipJar.isPending ? 'Deleting...' : 'Delete Tip Jar'}
              </Button>
              <Button 
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function CreateTipJarForm() {
  const { initialize } = useTipJarProgram();
  const { publicKey, connected, wallet } = useWallet();
  const { cluster } = useCluster();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await initialize.mutateAsync({ name: name.trim(), description: description.trim() });
      
      // Invalidate the specific tip jar query for the current user
      if (publicKey) {
        await queryClient.invalidateQueries({
          queryKey: ['tipjar', 'fetch', { cluster, authority: publicKey.toString() }]
        });
      }
      
      toast.success('Tip jar created successfully! 🎉');
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create tip jar:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Create Tip Jar
        </CardTitle>
        <CardDescription>
          Create your own tip jar to receive SOL from supporters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div>Connected: {connected ? 'Yes' : 'No'}</div>
          <div>Public Key: {publicKey ? publicKey.toString().slice(0, 8) + '...' : 'None'}</div>
          <div>Wallet: {wallet?.adapter?.name || 'None'}</div>
        </div>
        <div>
          <Label htmlFor="jar-name">Name</Label>
          <Input
            id="jar-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Tip Jar"
          />
        </div>
        <div>
          <Label htmlFor="jar-description">Description</Label>
          <Input
            id="jar-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Support my work with tips!"
          />
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={!name.trim() || !description.trim() || initialize.isPending}
          className="w-full"
          size="lg"
        >
          {initialize.isPending ? 'Creating...' : 'Create Tip Jar'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function WithdrawTipsForm() {
  const { publicKey } = useWallet();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { withdrawTip } = useTipJar(publicKey!);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !publicKey) return;
    
    try {
      await withdrawTip.mutateAsync({
        amount: parseFloat(withdrawAmount),
      });
      
      toast.success('Withdrawal successful! 💰');
      setWithdrawAmount('');
    } catch (error) {
      toast.error('Failed to withdraw');
      console.error(error);
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Withdraw Tips
        </CardTitle>
        <CardDescription>
          Withdraw SOL from your tip jar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="withdraw-amount">Amount (SOL)</Label>
          <Input
            id="withdraw-amount"
            type="number"
            step="0.001"
            min="0.001"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.1"
          />
        </div>
        <Button 
          onClick={handleWithdraw} 
          disabled={!withdrawAmount || withdrawTip.isPending}
          className="w-full"
          variant="outline"
        >
          {withdrawTip.isPending ? 'Withdrawing...' : 'Withdraw'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CreateTipJarModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { initialize } = useTipJarProgram();
  const { publicKey, connected, wallet } = useWallet();
  const { cluster } = useCluster();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await initialize.mutateAsync({ name: name.trim(), description: description.trim() });
      
      // Invalidate the specific tip jar query for the current user
      if (publicKey) {
        await queryClient.invalidateQueries({
          queryKey: ['tipjar', 'fetch', { cluster, authority: publicKey.toString() }]
        });
      }
      
      toast.success('Tip jar created successfully! 🎉');
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create tip jar:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Create New Tip Jar
          </DialogTitle>
          <DialogDescription>
            Create your own tip jar to receive SOL from supporters
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div>Connected: {connected ? 'Yes' : 'No'}</div>
            <div>Public Key: {publicKey ? publicKey.toString().slice(0, 8) + '...' : 'None'}</div>
            <div>Wallet: {wallet?.adapter?.name || 'None'}</div>
          </div>
          
          <div>
            <Label htmlFor="modal-jar-name">Tip Jar Name</Label>
            <Input
              id="modal-jar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Tip Jar"
            />
          </div>
          
          <div>
            <Label htmlFor="modal-jar-description">Description</Label>
            <Input
              id="modal-jar-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Support my work with tips!"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleCreate} 
              disabled={!name.trim() || !description.trim() || initialize.isPending}
              className="flex-1"
            >
              {initialize.isPending ? 'Creating...' : 'Create Tip Jar'}
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              disabled={initialize.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}