const STORAGE_KEY = "contextPillData";
const ENABLED_KEY = "contextPillEnabled";
const browserApi = globalThis.chrome;

const fields = ["who", "goals", "projects", "skills", "style"];

const statusEl = document.getElementById("status");
const toggleEl = document.getElementById("enabledToggle");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

function setStatus(message) {
  statusEl.textContent = message;
}

function readForm() {
  return fields.reduce((acc, fieldId) => {
    const element = document.getElementById(fieldId);
    acc[fieldId] = element.value.trim();
    return acc;
  }, {});
}

function writeForm(data = {}) {
  fields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    element.value = data[fieldId] || "";
  });
}

async function loadState() {
  const stored = await browserApi.storage.local.get([STORAGE_KEY, ENABLED_KEY]);
  writeForm(stored[STORAGE_KEY] || {});
  toggleEl.checked = Boolean(stored[ENABLED_KEY]);
}

async function savePill() {
  const pillData = readForm();
  await browserApi.storage.local.set({ [STORAGE_KEY]: pillData });
  setStatus("Pill saved locally.");
}

async function resetPill() {
  writeForm({});
  toggleEl.checked = false;
  await browserApi.storage.local.remove(STORAGE_KEY);
  await browserApi.storage.local.set({ [ENABLED_KEY]: false });
  setStatus("Pill reset.");
}

async function setEnabled(enabled) {
  await browserApi.storage.local.set({ [ENABLED_KEY]: enabled });
  setStatus(enabled ? "Injection ON." : "Injection OFF.");
}

saveBtn.addEventListener("click", savePill);
resetBtn.addEventListener("click", resetPill);
toggleEl.addEventListener("change", () => setEnabled(toggleEl.checked));

loadState().catch(() => setStatus("Unable to load saved pill."));
