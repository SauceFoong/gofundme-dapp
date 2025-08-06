// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TipjarIDL from '../target/idl/tipjar.json'
import type { Tipjar } from '../target/types/tipjar'

// Re-export the generated IDL and type
export { Tipjar, TipjarIDL }

// The programId is imported from the program IDL.
export const TIPJAR_PROGRAM_ID = new PublicKey(TipjarIDL.address)

// This is a helper function to get the Tipjar Anchor program.
export function getTipjarProgram(provider: AnchorProvider, address?: PublicKey): Program<Tipjar> {
  return new Program({ ...TipjarIDL, address: address ? address.toBase58() : TipjarIDL.address } as Tipjar, provider)
}

// This is a helper function to get the program ID for the Tipjar program depending on the cluster.
export function getTipjarProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tipjar program on devnet and testnet.
      return new PublicKey('8bfHPDePiZfE8WmqXgxzEbswtZKWyNwViWXHHM3953WY')
    case 'mainnet-beta':
    default:
      return TIPJAR_PROGRAM_ID
  }
} 