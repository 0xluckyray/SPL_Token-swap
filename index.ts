import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
import { BN } from "@project-serum/anchor";

dotenv.config();

const WALLET_PRIVATE_KEY=process.env.WALLET_PRIVATE_KEY as string;
const RPC_URL=process.env.RPC_URL as string;

const wallet = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

async function SplTokenSwap(tokenAddress: string) {
    const connection = new Connection(RPC_URL, "confirmed");
    const tokenDecimals = getTokenDecimals(connection, tokenAddress);
}

async function getTokenDecimals(connection: Connection, tokenAddress: string) {
    const mintInfo = await connection.getParsedAccountInfo(new PublicKey(tokenAddress));

    if (!mintInfo) {
        throw new Error("Token account not found");
    }

    const decimals = (mintInfo.value?.data as any).parsed.info.decimals;
    return decimals;
}

const TOKEN_ADDRESS = "4aR3jtFKWuYzkNE27WG4V7Jt6DDhwKcc2qjzN5Tkpump"
SplTokenSwap(TOKEN_ADDRESS);