import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
import { BN } from "@project-serum/anchor";

dotenv.config();

const WALLET_PRIVATE_KEY=process.env.WALLET_PRIVATE_KEY as string;
const RPC_URL=process.env.RPC_URL as string;

const wallet = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

async function SplTokenSwap() {
    const connection = new Connection(RPC_URL, "confirmed");

}

console.log("hello");