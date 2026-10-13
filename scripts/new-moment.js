import fs from "fs"
import path from "path"

const TZ = "Asia/Shanghai"

function getShanghaiDateTimeISO(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  )

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`
}

const args = process.argv.slice(2)
const isSecret = args.includes("--secret")
const positional = args.filter((arg) => arg !== "--secret")

if (positional.length === 0) {
  console.error(`Error: No filename argument provided
Usage: pnpm new-moment <name> [--secret]
  --secret  创建私密碎碎念到 private/moments/，需运行 pnpm encrypt-moments 加密后发布`)
  process.exit(1)
}

let inputName = positional[0].replace(/\\/g, "/").replace(/\/$/, "")

// 支持显式传 index：2026-07-03-moment/index
if (inputName.endsWith("/index")) {
  inputName = inputName.slice(0, -"/index".length)
}

// 去掉 .md / .mdx 后缀，统一用目录名
inputName = inputName.replace(/\.(md|mdx)$/i, "")

const targetDir = isSecret ? "./private/moments/" : "./src/content/moments/"
const momentDir = path.join(targetDir, inputName)
const fullPath = path.join(momentDir, "index.md")
const legacyPath = path.join(targetDir, `${inputName}.md`)

if (fs.existsSync(momentDir) || fs.existsSync(fullPath)) {
  console.error(`Error: Moment directory already exists: ${momentDir}`)
  process.exit(1)
}

if (fs.existsSync(legacyPath)) {
  console.error(`Error: Legacy moment file already exists: ${legacyPath}
Please move it to ${fullPath} or choose another name.`)
  process.exit(1)
}

fs.mkdirSync(momentDir, { recursive: true })

const dateTime = getShanghaiDateTimeISO()

const content = `---
published: ${dateTime}
images: []
draft: false
---

在这里写你的碎碎念。

`

fs.writeFileSync(fullPath, content)

console.log(`Moment ${fullPath} created`)
if (isSecret) {
  console.log(`This is a secret moment. Write your plaintext here, then run \`pnpm encrypt-moments\` to publish it encrypted.`)
}
