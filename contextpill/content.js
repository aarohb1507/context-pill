const STORAGE_KEY = "contextPillData";
const ENABLED_KEY = "contextPillEnabled";
const MARKER = "[ContextPill]";
const browserApi = globalThis.chrome;

let injectedForPath = new Set();

function buildPillText(data) {
  const sections = [
    ["Who I am", data.who],
    ["Goals", data.goals],
    ["Projects", data.projects],
    ["Skills", data.skills],
    ["Response style", data.style]
  ].filter(([, value]) => value && value.trim());

  if (!sections.length) {
    return "";
  }

  const body = sections.map(([label, value]) => `${label}: ${value.trim()}`).join("\n");
  return `${MARKER}\n${body}\n\n`;
}

function setTextareaWithReactNativeSetter(textarea, value) {
  const prototype = Object.getPrototypeOf(textarea);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(textarea, value);
  } else {
    textarea.value = value;
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function injectClaude(text) {
  const editor = document.querySelector('[data-prosemirror-editor]') || document.querySelector('.ProseMirror[contenteditable="true"]') || document.querySelector('[contenteditable="true"]');
  if (!editor) {
    return false;
  }

  editor.focus();
  const existing = editor.textContent?.trim() || "";
  if (existing.includes(MARKER)) {
    return true;
  }

  const finalText = existing ? `${text}${existing}` : text;
  const ok = document.execCommand("insertText", false, finalText);

  if (!ok) {
    editor.textContent = finalText;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return true;
}

function injectChatGPT(text) {
  const textarea = document.querySelector('#prompt-textarea, textarea[data-id="root"], textarea');
  if (!textarea) {
    return false;
  }

  const current = textarea.value || "";
  if (current.includes(MARKER)) {
    return true;
  }

  const next = current ? `${text}${current}` : text;
  setTextareaWithReactNativeSetter(textarea, next);
  return true;
}

function injectGrok(text) {
  const textarea = document.querySelector("textarea");
  if (!textarea) {
    return false;
  }

  const current = textarea.value || "";
  if (current.includes(MARKER)) {
    return true;
  }

  textarea.value = current ? `${text}${current}` : text;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function injectDeepSeek(text) {
  const textarea = document.querySelector('textarea[placeholder*="Message" i], textarea[placeholder*="Ask" i], textarea');
  if (textarea) {
    const current = textarea.value || "";
    if (!current.includes(MARKER)) {
      const next = current ? `${text}${current}` : text;
      setTextareaWithReactNativeSetter(textarea, next);
    }
    return true;
  }

  const editable =
    document.querySelector('div[contenteditable="true"][role="textbox"]') ||
    document.querySelector('.ProseMirror[contenteditable="true"]') ||
    document.querySelector('[contenteditable="true"]');
  if (!editable) {
    return false;
  }

  const current = editable.innerText || editable.textContent || "";
  if (current.includes(MARKER)) {
    return true;
  }

  const next = current ? `${text}${current}` : text;
  editable.focus();
  const inserted = document.execCommand("insertText", false, next);
  if (!inserted) {
    editable.textContent = next;
    editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: next }));
    editable.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return true;
}

function getInjectorForHost(hostname) {
  if (hostname.includes("claude.ai")) return injectClaude;
  if (hostname.includes("chatgpt.com")) return injectChatGPT;
  if (hostname.includes("grok.com")) return injectGrok;
  if (hostname.includes("deepseek.com")) return injectDeepSeek;
  return null;
}

async function tryInjectNow() {
  const pathKey = `${location.hostname}${location.pathname}`;
  if (injectedForPath.has(pathKey)) {
    return;
  }

  const { [ENABLED_KEY]: enabled, [STORAGE_KEY]: pillData } = await browserApi.storage.local.get([ENABLED_KEY, STORAGE_KEY]);
  if (!enabled) {
    return;
  }

  const pillText = buildPillText(pillData || {});
  if (!pillText) {
    return;
  }

  const injector = getInjectorForHost(location.hostname);
  if (!injector) {
    return;
  }

  const injected = injector(pillText);
  if (injected) {
    injectedForPath.add(pathKey);
  }
}

const observer = new MutationObserver(() => {
  tryInjectNow();
});

observer.observe(document.documentElement, { childList: true, subtree: true });

browserApi.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes[ENABLED_KEY] || changes[STORAGE_KEY]) {
    injectedForPath = new Set();
    tryInjectNow();
  }
});

tryInjectNow();
