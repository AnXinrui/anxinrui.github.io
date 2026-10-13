// 加密碎碎念脚本：读取 private/moments/ 下的明文，用 AES-256-GCM 加密后
// 写入 src/content/moments/，密文与明文格式需与前端 src/utils/secret-moment.ts 保持一致。
//
// 密文格式：v1.<base64(salt[16] + iv[12] + ciphertext + tag[16])>
// 密钥派生：PBKDF2-SHA256，310000 次迭代，所有条目共用同一个 salt，
// 因此前端解锁一次即可派生出可解密全部条目的密钥。
//
// 密码来源（优先级从高到低）：
//   1. 环境变量 MOMENT_PASSWORD
//   2. 项目根目录 .env 文件中的 MOMENT_PASSWORD=xxx（.env 已被 gitignore）
//
// 注意：修改密码后需要删除 src/content/moments/ 下所有 secret 条目再重跑本脚本，
// 否则旧密文将无法用新密码解开。
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CIPHER_VERSION = "v1";
const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

const PRIVATE_DIR = path.join("private", "moments");
const PUBLIC_DIR = path.join("src", "content", "moments");

const MIME_BY_EXT = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".avif": "image/avif",
	".svg": "image/svg+xml",
};

// 从 .env 文件中读取 MOMENT_PASSWORD
function readPasswordFromEnvFile() {
	const envPath = path.join(process.cwd(), ".env");
	if (!fs.existsSync(envPath)) {
		return null;
	}
	for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
		const match = line.match(/^\s*MOMENT_PASSWORD\s*=\s*(.*)\s*$/);
		if (match) {
			return match[1].replace(/^["']|["']$/g, "");
		}
	}
	return null;
}

// 解析碎碎念文件，返回 frontmatter 字段与正文
function parseMomentFile(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) {
		return null;
	}
	const meta = { published: "", images: [], draft: "false" };
	for (const line of match[1].split(/\r?\n/)) {
		const kv = line.match(/^([\w-]+):\s*(.*)$/);
		if (!kv) {
			continue;
		}
		const [, key, value] = kv;
		if (key === "published") {
			meta.published = value.trim();
		} else if (key === "draft") {
			meta.draft = value.trim();
		} else if (key === "images") {
			// 支持两种写法：images: [] 与 images: ["./a.webp", "b.jpg"]
			const items = value.match(/\[([^\]]*)\]/);
			meta.images =
				items && items[1].trim()
					? items[1]
							.split(",")
							.map((s) => s.trim().replace(/^["']|["']$/g, ""))
							.filter(Boolean)
					: [];
		}
	}
	return { meta, body: match[2] };
}

// 从公开目录现有密文中提取共用 salt，保证重跑脚本后旧条目仍可解密
function findExistingSalt() {
	if (!fs.existsSync(PUBLIC_DIR)) {
		return null;
	}
	for (const name of fs.readdirSync(PUBLIC_DIR)) {
		const file = path.join(PUBLIC_DIR, name, "index.md");
		if (!fs.existsSync(file)) {
			continue;
		}
		const raw = fs.readFileSync(file, "utf-8");
		if (!/^secret:\s*true\s*$/m.test(raw)) {
			continue;
		}
		const match = raw.match(/^v1\.([A-Za-z0-9+/=]+)\s*$/m);
		if (!match) {
			continue;
		}
		const bytes = Buffer.from(match[1], "base64");
		if (bytes.length <= SALT_LENGTH) {
			continue;
		}
		return bytes.subarray(0, SALT_LENGTH);
	}
	return null;
}

// 加密明文，返回带版本前缀的密文字符串
function encryptPlaintext(plaintext, password, salt) {
	const key = crypto.pbkdf2Sync(
		password,
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([
		cipher.update(plaintext, "utf-8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();
	const payload = Buffer.concat([salt, iv, ciphertext, tag]);
	return `${CIPHER_VERSION}.${payload.toString("base64")}`;
}

// 将明文引用的图片转成 base64 data URI 拼进正文，让图片随内容一起加密
function inlineImages(body, images, baseDir) {
	const parts = [body.trimEnd()];
	for (const src of images) {
		const filePath = path.resolve(baseDir, src);
		if (!fs.existsSync(filePath)) {
			console.warn(`Warning: 图片不存在，已跳过: ${filePath}`);
			continue;
		}
		const mime =
			MIME_BY_EXT[path.extname(filePath).toLowerCase()] || "application/octet-stream";
		const dataUri = `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
		parts.push(`\n\n![](${dataUri})`);
	}
	return parts.join("");
}

function main() {
	const password = process.env.MOMENT_PASSWORD || readPasswordFromEnvFile();
	if (!password) {
		console.error(`Error: 未找到加密密码。
请在项目根目录创建 .env 文件并写入一行（.env 已被 gitignore，不会入库）：
  MOMENT_PASSWORD=你的密码
或通过环境变量运行：
  MOMENT_PASSWORD=你的密码 pnpm encrypt-moments`);
		process.exit(1);
	}

	if (!fs.existsSync(PRIVATE_DIR)) {
		console.error(`Error: 明文目录不存在: ${PRIVATE_DIR}
使用 pnpm new-moment <name> --secret 创建私密碎碎念。`);
		process.exit(1);
	}

	const names = fs.readdirSync(PRIVATE_DIR).filter((name) => {
		return fs.existsSync(path.join(PRIVATE_DIR, name, "index.md"));
	});
	if (names.length === 0) {
		console.log("private/moments/ 下没有需要加密的碎碎念。");
		return;
	}

	const salt = findExistingSalt() || crypto.randomBytes(SALT_LENGTH);

	for (const name of names) {
		const srcPath = path.join(PRIVATE_DIR, name, "index.md");
		const parsed = parseMomentFile(fs.readFileSync(srcPath, "utf-8"));
		if (!parsed || !parsed.meta.published) {
			console.warn(`Warning: 无法解析 frontmatter，已跳过: ${srcPath}`);
			continue;
		}
		const plaintext = inlineImages(
			parsed.body,
			parsed.meta.images,
			path.dirname(srcPath),
		);
		const encoded = encryptPlaintext(plaintext, password, salt);

		const outDir = path.join(PUBLIC_DIR, name);
		fs.mkdirSync(outDir, { recursive: true });
		const output = [
			"---",
			`published: ${parsed.meta.published}`,
			"images: []",
			`draft: ${parsed.meta.draft}`,
			"secret: true",
			"---",
			"",
			encoded,
			"",
		].join("\n");
		fs.writeFileSync(path.join(outDir, "index.md"), output);
		console.log(`Encrypted: ${srcPath} -> ${path.join(outDir, "index.md")}`);
	}
}

main();
