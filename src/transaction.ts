import { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaTSSWallet } from "./wallet";

export async function createAndSignTransaction(
	wallet: SolanaTSSWallet,
	connection: Connection,
	toPublicKey: PublicKey,
	amount: number
): Promise<string> {
	const fromPubkey = wallet.getPublicKey();

	let transaction = new Transaction().add(
		SystemProgram.transfer({
			fromPubkey,
			toPubkey: toPublicKey,
			lamports: amount * LAMPORTS_PER_SOL,
		})
	);

	// Get a recent blockhash to include in the transaction
	let { blockhash } = await connection.getRecentBlockhash();
	transaction.recentBlockhash = blockhash;
	transaction.feePayer = fromPubkey;

	// Sign the transaction
	const message = transaction.serializeMessage();
	const signature = await wallet.sign(message);
	transaction.addSignature(fromPubkey, signature);

	// Verify the transaction
	const isVerified = transaction.verifySignatures();
	if (!isVerified) {
		throw new Error("Transaction signature verification failed");
	}

	// Send the transaction
	const rawTransaction = transaction.serialize();
	const txid = await connection.sendRawTransaction(rawTransaction);

	return txid;
}
