import { Keypair, PublicKey } from "@solana/web3.js";
import { SolanaTSS, SplitResult } from "mpc-lib";
import { encryptAndStore, retrieveAndDecrypt } from "./storage";
import { sendShareToServer } from "./server";

export class SolanaTSSWallet {
	private publicKey: PublicKey;
	private keyId: string;

	constructor(publicKey: PublicKey, keyId: string) {
		this.publicKey = publicKey;
		this.keyId = keyId;
	}

	static async create(): Promise<SolanaTSSWallet> {
		const { publicKey, splitResult } = SolanaTSS.generateAndSplitKey(2, 3);
		const keyId = Keypair.generate().publicKey.toBase58(); // Generate a unique key ID

		// Send one share to the server
		await sendShareToServer(keyId, splitResult.shares[0]);

		// Encrypt and store two shares locally
		await encryptAndStore(`${keyId}_share1`, JSON.stringify(splitResult.shares[1]));
		await encryptAndStore(`${keyId}_share2`, JSON.stringify(splitResult.shares[2]));

		// Store coefficient proofs
		await encryptAndStore(`${keyId}_coeffProofs`, JSON.stringify(splitResult.coefficientProofs));

		return new SolanaTSSWallet(new PublicKey(publicKey), keyId);
	}

	getPublicKey(): PublicKey {
		return this.publicKey;
	}

	async sign(message: Buffer): Promise<Buffer> {
		const txId = Keypair.generate().publicKey.toBase58(); // Generate a unique transaction ID

		// Retrieve and decrypt shares
		const share1 = JSON.parse(await retrieveAndDecrypt(`${this.keyId}_share1`));
		const share2 = JSON.parse(await retrieveAndDecrypt(`${this.keyId}_share2`));

		// In a real implementation, you would coordinate with the server to perform the signing
		// For this example, we'll simulate it locally
		const signatures = SolanaTSS.signWithTSS(this.keyId, txId, message);

		// In practice, you'd combine partial signatures. For this example, we'll just return the first one
		return Buffer.concat([signatures[0].R, signatures[0].s]);
	}
}
