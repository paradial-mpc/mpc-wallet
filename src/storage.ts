import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-secret-encryption-key";

export async function encryptAndStore(key: string, value: string): Promise<void> {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(value, "utf8", "hex");
	encrypted += cipher.final("hex");
	const data = JSON.stringify({ iv: iv.toString("hex"), encryptedData: encrypted });
	localStorage.setItem(key, data);
}

export async function retrieveAndDecrypt(key: string): Promise<string> {
	const data = JSON.parse(localStorage.getItem(key) || "");
	const iv = Buffer.from(data.iv, "hex");
	const encryptedText = Buffer.from(data.encryptedData, "hex");
	const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}
