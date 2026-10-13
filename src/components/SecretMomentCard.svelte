<script lang="ts">
import { onMount } from "svelte";
import MarkdownIt from "markdown-it";
import Icon from "@iconify/svelte";
import {
	base64ToKey,
	decryptMoment,
	deriveKey,
	keyToBase64,
	MOMENT_KEY_STORAGE,
	MOMENT_LOCK_EVENT,
	MOMENT_UNLOCK_EVENT,
	parseCiphertext,
} from "@utils/secret-moment.ts";

let { ciphertext }: { ciphertext: string } = $props();

let unlocked: boolean = $state(false);
let html: string = $state("");
let password: string = $state("");
let error: string = $state("");
let busy: boolean = $state(false);

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

// 用给定密钥解密本条内容，成功则渲染并返回 true
async function renderWithKey(key: CryptoKey): Promise<boolean> {
	const text = await decryptMoment(ciphertext, key);
	if (text === null) {
		return false;
	}
	html = md.render(text);
	unlocked = true;
	return true;
}

// 解锁：派生密钥、解密本条，成功后持久化密钥并广播给其他加密卡片
async function unlock() {
	error = "";
	const parts = parseCiphertext(ciphertext);
	if (!parts) {
		error = "密文格式不正确";
		return;
	}
	busy = true;
	const key = await deriveKey(password, parts.salt);
	const ok = await renderWithKey(key);
	busy = false;
	if (!ok) {
		error = "密码不正确";
		return;
	}
	password = "";
	const keyB64 = await keyToBase64(key);
	localStorage.setItem(MOMENT_KEY_STORAGE, keyB64);
	document.dispatchEvent(new CustomEvent(MOMENT_UNLOCK_EVENT, { detail: keyB64 }));
}

// 重新锁定：清除本机保存的密钥并广播给其他加密卡片
function lock() {
	unlocked = false;
	html = "";
	password = "";
	error = "";
	localStorage.removeItem(MOMENT_KEY_STORAGE);
	document.dispatchEvent(new CustomEvent(MOMENT_LOCK_EVENT));
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Enter" && !busy && password.length > 0) {
		unlock();
	}
}

onMount(() => {
	// 页面加载时尝试用本机保存的密钥直接解锁
	const stored = localStorage.getItem(MOMENT_KEY_STORAGE);
	if (stored) {
		base64ToKey(stored).then((key) => {
			if (key) {
				renderWithKey(key);
			}
		});
	}

	// 其他加密卡片解锁或锁定时同步自身状态
	const onUnlock = (event: Event) => {
		const keyB64 = (event as CustomEvent<string>).detail;
		if (keyB64) {
			base64ToKey(keyB64).then((key) => {
				if (key) {
					renderWithKey(key);
				}
			});
		}
	};
	const onLock = () => {
		unlocked = false;
		html = "";
		password = "";
		error = "";
	};
	document.addEventListener(MOMENT_UNLOCK_EVENT, onUnlock);
	document.addEventListener(MOMENT_LOCK_EVENT, onLock);
	return () => {
		document.removeEventListener(MOMENT_UNLOCK_EVENT, onUnlock);
		document.removeEventListener(MOMENT_LOCK_EVENT, onLock);
	};
});
</script>

{#if unlocked}
	<div class="relative">
		<div class="prose dark:prose-invert prose-base !max-w-none custom-md markdown-content mb-4">
			<!-- biome-ignore lint/security/noDangerouslySetInnerHtml: 内容为本人加密的碎碎念，markdown-it 已开启 html 转义 -->
			{@html html}
		</div>
		<button
			class="absolute -top-2 -right-2 btn-plain scale-animation rounded-lg h-9 w-9 active:scale-90"
			onclick={lock}
			title="重新锁定"
			aria-label="重新锁定"
		>
			<Icon icon="material-symbols:lock-reset-outline-rounded" class="text-[1.1rem]" />
		</button>
	</div>
{:else}
	<div class="flex flex-col items-center gap-3 py-4" data-pagefind-ignore>
		<Icon icon="material-symbols:lock-outline-rounded" class="text-[1.75rem] text-50" />
		<p class="text-50 text-sm">这条碎碎念已加密，输入密码即可查看</p>
		<div class="flex gap-2 w-full max-w-xs">
			<input
				type="password"
				bind:value={password}
				onkeydown={onKeydown}
				placeholder="密码"
				autocomplete="current-password"
				class="transition-all flex-1 min-w-0 px-3 h-9 text-sm rounded-lg outline-0
					bg-[var(--btn-regular-bg)] hover:bg-[var(--btn-regular-bg-hover)]
					text-black/75 dark:text-white/75"
			/>
			<button
				class="btn-regular rounded-lg px-4 h-9 text-sm font-medium active:scale-95 shrink-0"
				onclick={unlock}
				disabled={busy || password.length === 0}
			>
				{busy ? "解密中…" : "解锁"}
			</button>
		</div>
		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}
	</div>
{/if}
