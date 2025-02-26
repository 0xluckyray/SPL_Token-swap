import { Wallet } from "@project-serum/anchor";
import axios from "axios";

// const JUP_API = "https://quote-api.jup.ag/v6";  // Old
const JUP_API = "https://api.jup.ag/swap/v1";  // New

export const getResponse = async (tokenA: string, tokenB: string, amount: number, slippageBps: number) => {
  const response = await axios.get(`${JUP_API}/quote?inputMint=${tokenA}&outputMint=${tokenB}&amount=${amount}&slippageBps=${slippageBps}`);
  const quoteResponse = response.data;
  return quoteResponse;
  // Get the serialized transactions to perform the swap
};


export const getSwapInfo = async (tokenA: string, tokenB: string, amount: number, slippageBps: number) => {
  const res = await axios.get(`${JUP_API}/quote?inputMint=${tokenA}&outputMint=${tokenB}&amount=${amount}&slippageBps=${slippageBps}`);
  const swapinfo = res.data;
  return swapinfo;
  // Get the serialized transactions to perform the swap
};

export const getSwapTransaction = async (quoteResponse: any, anchorWallet: Wallet) => {
  const swapResponse = await axios.post(`${JUP_API}/swap`, {
    // quoteResponse from /quote api
    quoteResponse,
    // user public key to be used for the swap
    userPublicKey: anchorWallet.publicKey.toString(),
    // auto wrap and unwrap SOL. default is true
    wrapAndUnwrapSol: true,
    // dynamicComputeUnitLimit: true, // allow dynamic compute limit instead of max 1,400,000
    prioritizationFeeLamports: 200000, // or custom lamports: 1000
    // dynamicSlippage: { maxBps: 300 },
    // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
    // feeAccount: "fee_account_public_key"
  });
  return swapResponse.data.swapTransaction;
  // console.log("quoteResponse", quoteResponse);
  // Get the serialized transactions to perform the swap
};
