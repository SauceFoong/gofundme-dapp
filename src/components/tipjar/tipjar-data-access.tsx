'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { getTipjarProgram, TIPJAR_PROGRAM_ID } from '../../../anchor/src/tipjar-exports';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../use-transaction-toast';
import { toast } from 'sonner';

export function useTipJarProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(() => TIPJAR_PROGRAM_ID, []);
  const program = useMemo(() => getTipjarProgram(provider, programId), [provider, programId]);

  const accounts = useQuery({
    queryKey: ['tipjar', 'all', { cluster }],
    queryFn: () => program.account.tipJar.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['tipjar', 'initialize', { cluster }],
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), provider.publicKey.toBuffer()],
        program.programId
      );

      return program.methods
        .initializeTipjar(name, description)
        .accounts({
          authority: provider.publicKey,
          tipJar: tipJarPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      await accounts.refetch();
    },
    onError: (error) => {
      console.error('Failed to initialize tip jar:', error);
      toast.error('Failed to initialize tip jar');
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useTipJar(authority: PublicKey) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const { program, accounts } = useTipJarProgram();
  const queryClient = useQueryClient();

  const accountQuery = useQuery({
    queryKey: ['tipjar', 'fetch', { cluster, authority: authority.toString() }],
    queryFn: async () => {
      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), authority.toBuffer()],
        program.programId
      );
      return program.account.tipJar.fetch(tipJarPda);
    },
    enabled: !!authority,
  });

  const sendTip = useMutation({
    mutationKey: ['tipjar', 'sendTip', { cluster, authority: authority.toString() }],
    mutationFn: async ({ amount, message }: { amount: number; message: string }) => {
      if (!provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), authority.toBuffer()],
        program.programId
      );

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      return program.methods
        .sendTip(new BN(lamports), message)
        .accounts({
          tipper: provider.publicKey,
          tipJar: tipJarPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      await accountQuery.refetch();
      await accounts.refetch();
    },
    onError: (error) => {
      console.error('Failed to send tip:', error);
      toast.error('Failed to send tip');
    },
  });

  const withdrawTip = useMutation({
    mutationKey: ['tipjar', 'withdrawTip', { cluster, authority: authority.toString() }],
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), authority.toBuffer()],
        program.programId
      );

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      return program.methods
        .withdrawTip(new BN(lamports))
        .accounts({
          authority: provider.publicKey,
          tipJar: tipJarPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      await accountQuery.refetch();
      await accounts.refetch();
    },
    onError: (error) => {
      console.error('Failed to withdraw tip:', error);
      toast.error('Failed to withdraw tip');
    },
  });

  const deleteTipJar = useMutation({
    mutationKey: ['tipjar', 'deleteTipJar', { cluster, authority: authority.toString() }],
    mutationFn: async () => {
      if (!provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), authority.toBuffer()],
        program.programId
      );

      return program.methods
        .deleteTipJar()
        .accounts({
          authority: provider.publicKey,
          tipJar: tipJarPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      // Remove the account query data to indicate deletion
      queryClient.removeQueries({
        queryKey: ['tipjar', 'fetch', { cluster, authority: authority.toString() }]
      });
      await accounts.refetch();
      toast.success('Tip jar deleted successfully! 🗑️');
    },
    onError: (error) => {
      console.error('Failed to delete tip jar:', error);
      toast.error('Failed to delete tip jar: ' + (error as Error).message);
    },
  });

  return {
    accountQuery,
    sendTip,
    withdrawTip,
    deleteTipJar,
  };
}