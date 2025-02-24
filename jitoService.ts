import { PublicKey, Connection, Keypair, VersionedTransaction, SystemProgram, TransactionMessage } from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";

const TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
].map((pubkey) => new PublicKey(pubkey));

const BLOCK_ENGINE_URL = "https://frankfurt.mainnet.block-engine.jito.wtf";

export async function sendBundle(
  connection: Connection,
  jitoFeeWallet: Keypair,
  signedTransaction: VersionedTransaction
) {
  try {
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    const tipAccount =
      TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];

    const instruction1 = SystemProgram.transfer({
      fromPubkey: jitoFeeWallet.publicKey,
      toPubkey: tipAccount,
      lamports: 100000,
    });

    const messageV0 = new TransactionMessage({
      payerKey: jitoFeeWallet.publicKey,
      instructions: [instruction1],
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const vTxn = new VersionedTransaction(messageV0);
    const signatures = [signedTransaction, vTxn].map((signedTx) => {
      return bs58.encode(signedTx.signatures[0]);
    });
    // console.log("bundle signatures", signatures);🚩
    vTxn.sign([jitoFeeWallet]);

    const encodedTx = [signedTransaction, vTxn].map((tx) =>
      bs58.encode(tx.serialize())
    );

    // const encodedTx = txn.map((tx) => bs58.default.encode(txn1.serialize()));
    const jitoURL = `${BLOCK_ENGINE_URL}/api/v1/bundles`; // ?uuid=${JITO_UUID}
    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      // params: [[bs58.default.encode(vTxn.serialize())]],
      params: [encodedTx],
    };
    // console.log('payload', payload)🚩
    try {
      const response = await axios.post(jitoURL, payload, {
        headers: { "Content-Type": "application/json" },
        // httpsAgent: httpsAgent
      });
    //   return response.data.result;
      return signatures[0];
    } catch (error) {
      console.error("cannot send!:", error);
      return null;
    }
  } catch (error: any) {
    const err = error;
    console.error("Error sending bundle:", err.message);

    if (err?.message?.includes("Bundle Dropped, no connected leader up soon")) {
      console.error(
        "Error sending bundle: Bundle Dropped, no connected leader up soon."
      );
    } else {
      console.error("An unexpected error occurred:", err.message);
    }
  }
}
