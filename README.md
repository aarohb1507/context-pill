# 💊 ContextPill — Browser Extension

Your personal context layer for any LLM.
Build your profile once. Every model knows you instantly.

## What it does

- Stores your personal context pill (who you are, goals, projects, skills, style)
- Injects it automatically into Claude, ChatGPT, Grok, Gemini, and DeepSeek when toggled ON
- Toggle OFF for a clean session anytime
- Edit or reset your pill whenever you want
- 100% local — nothing leaves your browser

## Supported sites

| Site | Method used |
|------|-------------|
| claude.ai | ProseMirror `execCommand` injection |
| chatgpt.com | React native setter + `input` event |
| grok.com | Direct textarea value + `input` event |
| gemini.google.com | Textarea / contenteditable fallback |
| deepseek.com (+ subdomains) | Textarea / contenteditable fallback |

## Project structure

- [contextpill/manifest.json](contextpill/manifest.json)
- [contextpill/popup.html](contextpill/popup.html)
- [contextpill/popup.js](contextpill/popup.js)
- [contextpill/content.js](contextpill/content.js)
- [contextpill/styles.css](contextpill/styles.css)

## Install (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the [contextpill](contextpill) folder
5. Pin the extension from the toolbar

## How to use

1. Click the 💊 extension icon
2. Fill your profile fields (who, goals, projects, skills, response style)
3. Click **Save Pill**
4. Toggle **Inject on supported sites** ON
5. Open a supported LLM site and refresh once
6. Click the prompt box — your context pill is auto-inserted

## Quick test checklist

- [ ] Save a sample pill in popup
- [ ] Turn toggle ON
- [ ] Open `https://chatgpt.com` and refresh
- [ ] Confirm prompt starts with `[ContextPill]`
- [ ] Turn toggle OFF and refresh
- [ ] Confirm no injection happens

## JS glimpse

```js
// popup.js
const STORAGE_KEY = "contextPillData";
const ENABLED_KEY = "contextPillEnabled";
const browserApi = globalThis.chrome;

async function savePill() {
  const pillData = readForm();
  await browserApi.storage.local.set({ [STORAGE_KEY]: pillData });
}
```

```js
// content.js
function getInjectorForHost(hostname) {
  if (hostname.includes("claude.ai")) return injectClaude;
  if (hostname.includes("chatgpt.com")) return injectChatGPT;
  if (hostname.includes("grok.com")) return injectGrok;
  if (hostname.includes("deepseek.com")) return injectDeepSeek;
  if (hostname.includes("gemini.google.com")) return injectGemini;
  return null;
}
```

## Roadmap

- [ ] V2: Auto-summarize conversations and update pill
- [ ] V2: Multiple profiles (work / personal / job hunt)
- [ ] V3: Cloud sync across devices
- [ ] V3: Team context sharing
