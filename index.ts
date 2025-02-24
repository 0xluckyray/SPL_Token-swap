import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
import { Wallet } from "@project-serum/anchor";
import { getSwapInfo, getSwapTransaction } from "./jupiterService";
import { sendBundle } from "./jitoService";

dotenv.config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY as string;
const RPC_URL = process.env.RPC_URL as string;

const wallet = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));
const anchorWallet = new Wallet(wallet);

async function SplTokenSwap(
  tokenAddress: string,
  amount: number,
  isBuySell: string
) {
  const connection = new Connection(RPC_URL, "confirmed");
  const tokenDecimals = await getTokenDecimals(connection, tokenAddress);
  const slippageBps = parseInt(process.env.SLIPPAGEBPS || "") || 50;
  let swapInfo: any;
  if (isBuySell == "buy") {
    swapInfo = await getSwapInfo(
      NATIVE_MINT.toBase58(),
      tokenAddress,
      amount * LAMPORTS_PER_SOL,
      slippageBps
    );
  } else {
    // sell
    swapInfo = await getSwapInfo(
      tokenAddress,
      NATIVE_MINT.toBase58(),
      amount * Math.pow(10, tokenDecimals),
      slippageBps
    );
  }
  const swapTransaction = await getSwapTransaction(swapInfo, anchorWallet);
  const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
  const latestBlockHash = await connection.getLatestBlockhash();
  const versionedTransaction =
    VersionedTransaction.deserialize(swapTransactionBuf);
  versionedTransaction.message.recentBlockhash = latestBlockHash.blockhash;
  versionedTransaction.sign([anchorWallet.payer]);

  const bundleResult = await sendBundle(
    connection,
    wallet,
    versionedTransaction
  );
//   console.log(
//     "Jito Bundle: ",
//     `https://explorer.jito.wtf/bundle/${bundleResult}`
//   );
  console.log(
    "Transaction Signature: ",
    `https://solscan.io/tx/${bundleResult}`
  );

  // #############  Without Bundle  #############
  //   try {
  //     const transactionSignature = await connection.sendTransaction(
  //       versionedTransaction,
  //       { maxRetries: 20 }
  //     );
  //     const confirmation = await connection.confirmTransaction(
  //       {
  //         signature: transactionSignature,
  //         blockhash: latestBlockHash.blockhash,
  //         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //       },
  //       "confirmed"
  //     );

  //     if (confirmation.value.err) {
  //       throw new Error("Transaction not confirmed");
  //     }

  //     console.log(
  //       "Transaction Signature: ",
  //       `https://solscan.io/tx/${transactionSignature}`
  //     );
  //   } catch (error) {
  //     console.error("Error occurred during swap:", error);
  //   }
}

async function getTokenDecimals(connection: Connection, tokenAddress: string) {
  const mintInfo = await connection.getParsedAccountInfo(
    new PublicKey(tokenAddress)
  );

  if (!mintInfo) {
    throw new Error("Token account not found");
  }

  const decimals = (mintInfo.value?.data as any).parsed.info.decimals;
  return decimals;
}

const TOKEN_ADDRESS = "4aR3jtFKWuYzkNE27WG4V7Jt6DDhwKcc2qjzN5Tkpump";
let amount: number;

amount = 0.001;
SplTokenSwap(TOKEN_ADDRESS, amount, "buy"); // Buy token

amount = 1000;
SplTokenSwap(TOKEN_ADDRESS, amount, "sell"); // Sell token
