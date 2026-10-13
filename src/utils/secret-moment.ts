// 私密碎碎念的前端解密工具。
// 密文格式与 scripts/encrypt-moment.js 保持一致：
//   v1.<base64(salt[16] + iv[12] + ciphertext + tag[16])>
// 密钥派生：PBKDF2-SHA256 310000 次迭代，AES-256-GCM 解密。
// 所有条目共用 salt，因此派生一次密钥即可解密全部加密碎碎念。

const CIPHER_VERSION = "v1";
const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// localStorage 中保存解锁密钥的键名
export const MOMENT_KEY_STORAGE = "moment-unlock-key";
// 解锁成功后在 document 上广播的事件名，detail 为 base64 密钥
export const MOMENT_UNLOCK_EVENT = "moment-secret-unlock";
// 重新锁定时在 document 上广播的事件名
export const MOMENT_LOCK_EVENT = "moment-secret-lock";

type CipherParts = {
	salt: Uint8Array<ArrayBuffer>;
	iv: Uint8Array<ArrayBuffer>;
	data: Uint8Array<ArrayBuffer>;
};

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

// 解析密文字符串，格式非法时返回 null
export function parseCiphertext(encoded: string): CipherParts | null {
	const trimmed = encoded.trim();
	if (!trimmed.startsWith(`${CIPHER_VERSION}.`)) {
		return null;
	}
	try {
		const raw = base64ToBytes(trimmed.slice(CIPHER_VERSION.length + 1));
		if (raw.length <= SALT_LENGTH + IV_LENGTH) {
			return null;
		}
		return {
			salt: raw.slice(0, SALT_LENGTH),
			iv: raw.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH),
			data: raw.slice(SALT_LENGTH + IV_LENGTH),
		};
	} catch {
		return null;
	}
}

// 由密码与 salt 派生 AES-GCM 密钥
export async function deriveKey(
	password: string,
	salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
	const material = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		material,
		{ name: "AES-GCM", length: 256 },
		// 需要 extractable 才能导出密钥存入 localStorage，实现解锁一次永久可见
		true,
		["decrypt"],
	);
}

// 用密钥解密一条碎碎念，密码错误或密文损坏时返回 null
export async function decryptMoment(
	encoded: string,
	key: CryptoKey,
): Promise<string | null> {
	const parts = parseCiphertext(encoded);
	if (!parts) {
		return null;
	}
	try {
		const plain = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: parts.iv },
			key,
			parts.data,
		);
		return new TextDecoder().decode(plain);
	} catch {
		// AES-GCM 认证失败说明密码不对
		return null;
	}
}

// 导出密钥为 base64 字符串，用于存入 localStorage
export async function keyToBase64(key: CryptoKey): Promise<string> {
	const raw = await crypto.subtle.exportKey("raw", key);
	return bytesToBase64(new Uint8Array(raw));
}

// 从 base64 字符串恢复密钥，格式非法时返回 null
export async function base64ToKey(b64: string): Promise<CryptoKey | null> {
	try {
		return await crypto.subtle.importKey(
			"raw",
			base64ToBytes(b64),
			"AES-GCM",
			false,
			["decrypt"],
		);
	} catch {
		return null;
	}
}
