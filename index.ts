import { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, NATIVE_MINT } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
import { Wallet, BN } from "@project-serum/anchor";
import { getSwapInfo, getSwapTransaction } from "./jupiterService";

dotenv.config();

const WALLET_PRIVATE_KEY=process.env.WALLET_PRIVATE_KEY as string;
const RPC_URL=process.env.RPC_URL as string;

const anchorWallet = new Wallet(Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY)));

async function SplTokenSwap(tokenAddress: string, amount: number) {
    const connection = new Connection(RPC_URL, "confirmed");
    const tokenDecimals = getTokenDecimals(connection, tokenAddress);
    const slippageBps = parseInt(process.env.SLIPPAGEBPS || "") || 50;
    
    const swapInfo = await getSwapInfo(NATIVE_MINT.toBase58(), tokenAddress, amount * LAMPORTS_PER_SOL, slippageBps);
    const swapTransaction = await getSwapTransaction(swapInfo, anchorWallet);
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const latestBlockHash = await connection.getLatestBlockhash();
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.message.recentBlockhash = latestBlockHash.blockhash;
    transaction.sign([anchorWallet.payer]);

    console.log("Swap Quote Info:", transaction);
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
const amount = 0.001;
SplTokenSwap(TOKEN_ADDRESS, amount);