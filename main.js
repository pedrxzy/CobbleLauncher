"use strict";

const { app, BrowserWindow, ipcMain, safeStorage, shell, dialog } = require("electron");
const path = require("node:path");
const nbt = require("prismarine-nbt");
const fs = require("node:fs");
const crypto = require("node:crypto");

const { MicrosoftAuth, Launcher, Skin } = require("eml-lib");
const AdmZip = require("adm-zip");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let currentAccount = null;
let currentLanguage = "pt-BR";

ipcMain.handle("get-language", () => currentLanguage);

ipcMain.on("set-language", (_event, language) => {
  const supportedLanguages = ["pt-BR", "en-US", "es-ES"];

  if (supportedLanguages.includes(language)) {
    currentLanguage = language;
  }
});

ipcMain.handle("check-for-updates", async () => {
  try {
    if (!app.isPackaged) {
      return {
        success: false,
        error: "As atualizações só funcionam na versão instalada."
      };
    }

    const result = await autoUpdater.checkForUpdates();

    return {
      success: true,
      updateAvailable: Boolean(result?.isUpdateAvailable),
      currentVersion: app.getVersion(),
      latestVersion: result?.updateInfo?.version || app.getVersion()
    };
  } catch (error) {
    console.error("[Updates] Erro ao verificar:", error);

    return {
      success: false,
      error: "Não foi possível verificar atualizações."
    };
  }
});

ipcMain.handle("download-update", async () => {
  try {
    if (!app.isPackaged) {
      throw new Error("As atualizações só funcionam na versão instalada.");
    }

    await autoUpdater.downloadUpdate();

    return { success: true };
  } catch (error) {
    console.error("[Updates] Erro ao baixar:", error);

    return {
      success: false,
      error: "Não foi possível baixar a atualização."
    };
  }
});

ipcMain.handle("install-update", () => {
  if (!app.isPackaged) {
    return { success: false };
  }

  autoUpdater.quitAndInstall();
  return { success: true };
});

ipcMain.handle("open-update-page", async () => {
  await shell.openExternal(
    "https://github.com/pedrxzy/CobbleLauncher/releases/latest"
  );

  return { success: true };
});

let isLaunching = false;

const ROOT_NAME = "cobblelauncher";
function getGameRoot() {
  const baseDirectory =
    process.platform === "linux"
      ? app.getPath("home")
      : app.getPath("appData");

  return path.join(baseDirectory, `.${ROOT_NAME}`);
}
const LOADERS = ["vanilla", "fabric", "forge", "neoforge", "quilt"];
const MIN_RAM = 512;
const DEFAULT_RAM = 4096;
const MAX_RAM_LIMIT = 65536;
const MINECRAFT_VERSION_MANIFEST =
  "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

let minecraftVersionsCache = null;

async function getMinecraftVersions() {
  if (minecraftVersionsCache) {
    return minecraftVersionsCache;
  }

  const response = await fetch(MINECRAFT_VERSION_MANIFEST);

  if (!response.ok) {
    throw new Error("Não foi possível consultar as versões do Minecraft.");
  }

  const manifest = await response.json();

  if (!Array.isArray(manifest.versions)) {
    throw new Error("O catálogo de versões recebido é inválido.");
  }

  minecraftVersionsCache = manifest.versions
    .filter((version) =>
      typeof version.id === "string" &&
      ["release", "snapshot", "old_beta", "old_alpha"].includes(version.type)
    )
    .map((version) => ({
      id: version.id,
      type: version.type
    }));

  return minecraftVersionsCache;
}

async function isMinecraftVersionAvailable(versionId) {
  if (typeof versionId !== "string") {
    return false;
  }

  const versions = await getMinecraftVersions();

  return versions.some((version) => version.id === versionId);
}

// ==================================================
// CAMINHOS E CONTAS
// ==================================================

function getAccountPath() {
  return path.join(app.getPath("userData"), "account.dat");
}

function getSettingsPath() {
  return path.join(app.getPath("userData"), "launcher-settings.json");
}

function saveAccount(account) {
  if (!account || !safeStorage.isEncryptionAvailable()) {
    console.warn("Não foi possível salvar a sessão com segurança.");
    return;
  }

  try {
    const encrypted = safeStorage.encryptString(JSON.stringify(account));
    fs.writeFileSync(getAccountPath(), encrypted);
  } catch (error) {
    console.error("Erro ao salvar a sessão:", error.message);
  }
}

function loadAccount() {
  if (!safeStorage.isEncryptionAvailable()) return null;

  try {
    const file = getAccountPath();

    if (!fs.existsSync(file)) return null;

    const encrypted = fs.readFileSync(file);
    return JSON.parse(safeStorage.decryptString(encrypted));
  } catch (error) {
    console.error("Não foi possível ler a sessão salva:", error.message);
    return null;
  }
}

function getAccountInfo(account) {
  const name = account.name || account.username;

  if (!name) {
    throw new Error("Não foi possível obter o nome do jogador.");
  }

  return {
    name,
    uuid: account.uuid || null
  };
}

// ==================================================
// PERFIS
// ==================================================

function makeSlug(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "perfil";
}

async function normalizeProfile(input, existingProfiles = []) {
  if (!input || typeof input !== "object") {
    throw new Error("Dados do perfil inválidos.");
  }

  const name = String(input.name || "").trim();

  if (!name || name.length > 60) {
    throw new Error("O nome do perfil deve ter entre 1 e 60 caracteres.");
  }

 const minecraftVersion = String(input.minecraftVersion || "");

if (!(await isMinecraftVersionAvailable(minecraftVersion))) {
  throw new Error(
    "A versão do Minecraft selecionada não existe no catálogo oficial."
  );
}

  const loader = String(input.loader || "vanilla").toLowerCase();

  if (!LOADERS.includes(loader)) {
    throw new Error("Loader inválido.");
  }

  const loaderVersion = String(input.loaderVersion || "").trim();

  if (loader !== "vanilla" && !loaderVersion) {
    throw new Error("Informa a versão do loader selecionado.");
  }

  if (loaderVersion.length > 50) {
    throw new Error("A versão do loader é muito longa.");
  }

  const maxRam = Number(input.maxRam ?? DEFAULT_RAM);

  if (
    !Number.isInteger(maxRam) ||
    maxRam < 1024 ||
    maxRam > MAX_RAM_LIMIT
  ) {
    throw new Error("A RAM máxima deve ficar entre 1 e 64 GB, em MB.");
  }

  const javaMode = input.javaMode === "manual" ? "manual" : "auto";
  const javaPath = String(input.javaPath || "").trim();

  if (javaMode === "manual" && !path.isAbsolute(javaPath)) {
    throw new Error("Seleciona o caminho absoluto do Java.");
  }

  const requestedId = String(input.id || "");

  const existing = existingProfiles.find(
    (profile) => profile.id === requestedId
  );

  const id = existing ? existing.id : crypto.randomUUID();

  let slug = existing ? existing.slug : makeSlug(name);

  const usedSlugs = new Set(
    existingProfiles
      .filter((profile) => profile.id !== id)
      .map((profile) => profile.slug)
  );

  if (!existing || usedSlugs.has(slug)) {
    const baseSlug = slug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
  }

  return {
    id,
    name,
    slug,
    minecraftVersion,
    loader,
    loaderVersion: loader === "vanilla" ? "" : loaderVersion,
    maxRam,
    javaMode,
    javaPath,
    modpack: existing?.modpack || null
  };
}

function loadSettings() {
  try {
    const file = getSettingsPath();

    if (!fs.existsSync(file)) {
      return { profiles: [] };
    }

    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    return {
      profiles: Array.isArray(data.profiles) ? data.profiles : []
    };
  } catch (error) {
    console.error("Erro ao carregar configurações:", error.message);
    return { profiles: [] };
  }
}

function saveSettings(settings) {
  const file = getSettingsPath();
  const tempFile = `${file}.tmp`;

  fs.writeFileSync(tempFile, JSON.stringify(settings, null, 2), "utf8");
  fs.renameSync(tempFile, file);
}

// ==================================================
// PROGRESSO DA INICIALIZAÇÃO
// ==================================================

function sendProgress(stage, message, extra = {}) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.webContents.send("launch-progress", {
    stage,
    message,
    ...extra
  });
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatBytes(bytes) {
  const value = Math.max(0, Number(bytes) || 0);

  if (value < 1024) {
    return `${Math.round(value)} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Estado de uma única sessão de download.
 *
 * launch_download fornece o total global.
 * download_progress fornece o progresso do grupo atual.
 * download_end informa que o grupo atual terminou.
 *
 * Como a biblioteca reinicia seus contadores entre grupos,
 * somamos os grupos concluídos ao progresso do grupo atual.
 */
function createDownloadTracker() {
  return {
    active: false,
    totalBytes: 0,
    totalFiles: 0,
    completedBytes: 0,
    completedFiles: 0,
    currentBatchBytes: 0,
    currentBatchFiles: 0,
    lastPercent: 0,
    completedBatches: 0,
    expectedBatches: 7
  };
}

function getTrackedProgress(tracker, data = {}) {
  const currentBytes = Math.max(
    tracker.currentBatchBytes,
    Number(data.downloaded?.size) || 0
  );

  const currentFiles = Math.max(
    tracker.currentBatchFiles,
    Number(data.downloaded?.amount) || 0
  );

  tracker.currentBatchBytes = currentBytes;
  tracker.currentBatchFiles = currentFiles;

  const downloadedBytes = Math.min(
    tracker.totalBytes || Number.MAX_SAFE_INTEGER,
    tracker.completedBytes + currentBytes
  );

  const downloadedFiles = Math.min(
    tracker.totalFiles || Number.MAX_SAFE_INTEGER,
    tracker.completedFiles + currentFiles
  );

  let percent = 0;

  if (tracker.totalBytes > 0) {
    percent = (downloadedBytes / tracker.totalBytes) * 100;
  } else if (tracker.totalFiles > 0) {
    percent = (downloadedFiles / tracker.totalFiles) * 100;
  }

  // Evita que a barra volte para trás entre grupos de arquivos.
  percent = clampPercent(percent);
  percent = Math.max(tracker.lastPercent, percent);

  // Enquanto ainda há downloads, reservamos 100% para a conclusão.
  if (tracker.completedBatches < tracker.expectedBatches) {
    percent = Math.min(percent, 99);
  }

  tracker.lastPercent = percent;

  return {
    percent,
    downloaded: downloadedBytes,
    total: tracker.totalBytes,
    downloadedFiles,
    totalFiles: tracker.totalFiles,
    speed: Math.max(0, Number(data.speed) || 0),
    type: typeof data.type === "string" ? data.type : "",
    downloadedText: formatBytes(downloadedBytes),
    totalText: formatBytes(tracker.totalBytes)
  };
}

function finishDownloadBatch(tracker, data = {}) {
  if (!tracker.active) return null;

  const batchBytes = Math.max(
    tracker.currentBatchBytes,
    Number(data.downloaded?.size) || 0
  );

  const batchFiles = Math.max(
    tracker.currentBatchFiles,
    Number(data.downloaded?.amount) || 0
  );

  tracker.completedBytes += batchBytes;
  tracker.completedFiles += batchFiles;
  tracker.completedBatches += 1;

  tracker.currentBatchBytes = 0;
  tracker.currentBatchFiles = 0;

  const allBatchesFinished =
    tracker.completedBatches >= tracker.expectedBatches;

  if (allBatchesFinished) {
    tracker.lastPercent = 100;

    return {
      percent: 100,
      downloaded: tracker.totalBytes || tracker.completedBytes,
      total: tracker.totalBytes || tracker.completedBytes,
      downloadedFiles: tracker.totalFiles || tracker.completedFiles,
      totalFiles: tracker.totalFiles || tracker.completedFiles,
      speed: 0,
      type: "",
      downloadedText: formatBytes(
        tracker.totalBytes || tracker.completedBytes
      ),
      totalText: formatBytes(
        tracker.totalBytes || tracker.completedBytes
      )
    };
  }

  return getTrackedProgress(tracker);
}

// ==================================================
// JANELA
// ==================================================

function createWindow() {
  console.log(
    "[Diagnóstico] preload existe:",
    fs.existsSync(path.join(__dirname, "preload.js"))
  );
  console.log("[Diagnóstico] Electron:", process.versions.electron);
  console.log("[Diagnóstico] Node:", process.versions.node);

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 850,
    minHeight: 600,
    title: "CobbleLauncher",
    backgroundColor: "#101510",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.webContents.on(
    "preload-error",
    (_event, preloadPath, error) => {
      console.error("[Preload] Falha ao carregar:", preloadPath, error);
    }
  );

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error("[Página] Falha ao carregar:", errorCode, errorDescription);
    }
  );

  console.log("[Preload] Caminho esperado:", path.join(__dirname, "preload.js"));

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ==================================================
// LOGIN MICROSOFT
// ==================================================

ipcMain.handle("get-account-skin", async () => {
  if (!currentAccount) {
    throw new Error("Entre na sua conta Microsoft primeiro.");
  }

  const skinManager = new Skin(currentAccount);
  const skins = await skinManager.getSkins(true);

  return skins;
});


ipcMain.handle("update-account-skin", async (_event, input) => {
  if (!currentAccount) {
    throw new Error("Entre na sua conta Microsoft primeiro.");
  }

  if (!input || typeof input.name !== "string") {
    throw new Error("Dados da skin inválidos.");
  }

  const model = input.model === "alex" ? "slim" : "classic";
  let resolvedPath;

  if (input.isDefault === true) {
    if (input.model !== "steve" && input.model !== "alex") {
      throw new Error("Skin padrão inválida.");
    }

    resolvedPath = path.join(
      __dirname,
      "assets",
      "skins",
      `${input.model}.png`
    );
  } else {
    if (!/^[\w -]+\.png$/i.test(input.name)) {
      throw new Error("Nome de arquivo de skin inválido.");
    }

    const skinsDirectory = path.resolve(
      app.getPath("userData"),
      "skins"
    );

    resolvedPath = path.resolve(skinsDirectory, input.name);

    if (!resolvedPath.startsWith(skinsDirectory + path.sep)) {
      throw new Error("Caminho de skin inválido.");
    }
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error("O arquivo da skin não foi encontrado.");
  }

  const skinManager = new Skin(currentAccount);

  try {
    const skinBuffer = fs.readFileSync(resolvedPath);
    const skinBlob = new Blob([skinBuffer], {
      type: "image/png"
    });

    await skinManager.updateSkin(skinBlob, model);

return {
  success: true,
  messageKey: "skinUpdatedSuccess",
  skinData: `data:image/png;base64,${skinBuffer.toString("base64")}`,
  model
};

  } catch (error) {
    console.error("[Skin] Falha ao atualizar:", error);
    console.error("[Skin] Causa original:", error.cause);

    throw new Error(
      error.cause?.message ||
      error.message ||
      "Não foi possível atualizar a skin."
    );
  }
});

ipcMain.handle("get-account-capes", async () => {
  if (!currentAccount) {
    throw new Error("Entre na sua conta Microsoft primeiro.");
  }

  try {
    const skinManager = new Skin(currentAccount);
    const capes = await skinManager.getCapes();

return {
  capes,
  count: Array.isArray(capes) ? capes.length : 0
};
  } catch (error) {
    console.error("[Capas] Falha ao consultar:", error);

    throw new Error(
      error.message || "Não foi possível carregar suas capas."
    );
  }
});

ipcMain.handle("switch-account-cape", async (_event, capeId) => {
  if (!currentAccount) {
    throw new Error("Entre na sua conta Microsoft primeiro.");
  }

  if (typeof capeId !== "string" || !capeId.trim()) {
    throw new Error("Identificador da capa inválido.");
  }

  try {
    const skinManager = new Skin(currentAccount);

    await skinManager.switchCape(capeId);

    return {
      success: true,
      message: "Capa atualizada na sua conta Minecraft."
    };
  } catch (error) {
    console.error("[Capas] Falha ao trocar:", error);

    throw new Error(
      error.message || "Não foi possível trocar a capa."
    );
  }
});

ipcMain.handle("hide-account-cape", async () => {
  if (!currentAccount) {
    throw new Error("Entre na sua conta Microsoft primeiro.");
  }

  try {
    const skinManager = new Skin(currentAccount);

    await skinManager.hideCape();

    return {
      success: true,
      message: "Capa ocultada na sua conta Minecraft."
    };
  } catch (error) {
    console.error("[Capas] Falha ao ocultar:", error);

    throw new Error(
      error.message || "Não foi possível ocultar a capa."
    );
  }
});

ipcMain.handle("login-microsoft", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    throw new Error("A janela do launcher não está aberta.");
  }

  try {
    const auth = new MicrosoftAuth(mainWindow);
    const account = await auth.auth();

    if (!account) {
      throw new Error("A autenticação não retornou uma conta.");
    }

    const accountInfo = getAccountInfo(account);

    currentAccount = account;
    saveAccount(currentAccount);

    return accountInfo;
  } catch (error) {
    console.error("[Login] Erro:", error.message);
    currentAccount = null;

    throw new Error(error.message || "Falha no login Microsoft.");
  }
});

ipcMain.handle("restore-session", async () => {
  const savedAccount = loadAccount();

  if (!savedAccount || !mainWindow || mainWindow.isDestroyed()) {
    currentAccount = null;
    return null;
  }

  try {
    const auth = new MicrosoftAuth(mainWindow);
    const isValid = await auth.validate(savedAccount);

    if (isValid) {
      currentAccount = savedAccount;
    } else if (typeof auth.refresh === "function") {
      currentAccount = await auth.refresh(savedAccount);
    } else {
      currentAccount = null;
    }

    if (!currentAccount) return null;

    saveAccount(currentAccount);
    return getAccountInfo(currentAccount);
  } catch (error) {
    currentAccount = null;
    console.error("Erro ao restaurar sessão:", error.message);
    return null;
  }
});

ipcMain.handle("logout-microsoft", async () => {
  try {
    const file = getAccountPath();

    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    currentAccount = null;
    return { success: true };
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error.message);
    throw new Error("Não foi possível apagar a sessão salva.");
  }
});

// ==================================================
// CONSULTA DAS VERSÕES DOS LOADERS
// ==================================================

async function fetchJson(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: { "User-Agent": "CobbleLauncher/1.0" }
  });

  if (!response.ok) {
    throw new Error(
      `A fonte de versões respondeu com HTTP ${response.status}.`
    );
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: { "User-Agent": "CobbleLauncher/1.0" }
  });

  if (!response.ok) {
    throw new Error(
      `A fonte de versões respondeu com HTTP ${response.status}.`
    );
  }

  return response.text();
}

ipcMain.handle("get-loader-versions", async (_event, input) => {
  const minecraftVersion = String(input?.minecraftVersion || "");
  const loader = String(input?.loader || "").toLowerCase();

  if (!(await isMinecraftVersionAvailable(minecraftVersion))) {
  throw new Error(
    "A versão selecionada não existe no catálogo oficial do Minecraft."
  );
}

  if (!LOADERS.includes(loader) || loader === "vanilla") {
    return [];
  }

  try {
    let versions = [];

    if (loader === "fabric") {
      const data = await fetchJson(
        `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(minecraftVersion)}`
      );

      versions = data
        .filter((item) => item.loader?.stable)
        .map((item) => item.loader.version);
    } else if (loader === "quilt") {
      const data = await fetchJson(
        `https://meta.quiltmc.org/v3/versions/loader/${encodeURIComponent(minecraftVersion)}`
      );

      versions = data
        .filter((item) => item.loader?.stable !== false)
        .map((item) => item.loader?.version)
        .filter(Boolean);
    } else if (loader === "forge") {
      const xml = await fetchText(
        "https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml"
      );

      versions = [...xml.matchAll(/<version>([^<]+)<\/version>/g)]
        .map((match) => match[1])
        .filter((version) => version.startsWith(`${minecraftVersion}-`))
        .map((version) => version.slice(minecraftVersion.length + 1))
        .reverse();
    } else if (loader === "neoforge") {
      const xml = await fetchText(
        "https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml"
      );

      const parts = minecraftVersion.split(".");
      const neoPrefix = `${parts[1]}.${parts[2] || "0"}.`;

      versions = [...xml.matchAll(/<version>([^<]+)<\/version>/g)]
        .map((match) => match[1])
        .filter((version) => version.startsWith(neoPrefix))
        .reverse();
    }

    return [...new Set(versions)].slice(0, 100);
  } catch (error) {
    console.error("[Versões do loader] Erro:", error);

    throw new Error(
      `Não foi possível carregar as versões de ${loader}. Verifica a conexão e tenta novamente.`
    );
  }
});


const MODRINTH_API = "https://api.modrinth.com/v2";

const COBBLELAUNCHER_API =
  "https://cobblelauncher-api.pedrxz.workers.dev";

const MODRINTH_LOADERS = [
  "fabric",
  "forge",
  "neoforge",
  "quilt"
];

ipcMain.handle("curseforge-search", async (_event, input = {}) => {
  try {
    const query = String(input.query || "").trim();

    if (query.length < 2 || query.length > 100) {
      return {
        success: false,
        error: "A pesquisa deve ter entre 2 e 100 caracteres."
      };
    }

    const category = String(input.category || "mod");
    console.log("[CurseForge] Categoria recebida:", category);
const allowedCategories = [
  "mod",
  "resourcepack",
  "datapack",
  "modpack",
  "shader"
];

if (!allowedCategories.includes(category)) {
  return {
    success: false,
    error: "Categoria inválida."
  };
}

const params = new URLSearchParams();

params.set("query", query);
params.set("category", category);

   if (category === "mod" && input.loader) {
  params.set(
    "loader",
    String(input.loader).toLowerCase()
  );
}

if (input.gameVersion) {
  params.set(
    "gameVersion",
    String(input.gameVersion)
  );
}

    if (input.index !== undefined) {
      params.set("index", String(input.index));
    }

    const response = await fetch(
      `${COBBLELAUNCHER_API}/curseforge/search?${params.toString()}`,
      {
        headers: {
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    const result = await response.json();

    console.log("[CurseForge] Resposta da API:", {
  status: response.status,
  quantidade: result.data?.length,
  erro: result.error
});

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Não foi possível pesquisar no CurseForge."
      };
    }

    return {
      success: true,
      data: result.data || [],
      pagination: result.pagination || null
    };
  } catch (error) {
    console.error("[CobbleLauncher] Erro na pesquisa CurseForge:", error);

    return {
      success: false,
      error: "Não foi possível conectar ao serviço do CurseForge."
    };
  }
});

ipcMain.handle("curseforge-files", async (_event, input = {}) => {
  try {
    const modId = Number(input.modId);
    const gameVersion = String(input.gameVersion || "").trim();
    const loader = String(input.loader || "").toLowerCase();

    if (!Number.isSafeInteger(modId) || modId <= 0) {
      return { success: false, error: "ID do mod inválido." };
    }

    const params = new URLSearchParams({
      modId: String(modId),
      gameVersion,
      loader
    });

    const response = await fetch(
      `${COBBLELAUNCHER_API}/curseforge/files?${params}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Não foi possível buscar os arquivos."
      };
    }

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("[CobbleLauncher] Erro ao buscar arquivos CurseForge:", error);
    return {
      success: false,
      error: "Não foi possível conectar ao serviço do CurseForge."
    };
  }
});

ipcMain.handle("modrinth-search", async (_event, input) => {
  const query = String(input?.query || "").trim();
  const minecraftVersion = String(input?.minecraftVersion || "");
  const loader = String(input?.loader || "").toLowerCase();
  const category = String(input?.category || "mod").toLowerCase();

  const offset = Math.max(
    0,
    Math.min(100000, Math.floor(Number(input?.offset) || 0))
  );

  const allowedCategories = [
    "mod",
    "resourcepack",
    "datapack",
    "modpack",
    "shader"
  ];

  if (!allowedCategories.includes(category)) {
    throw new Error("Categoria de conteúdo inválida.");
  }

  if (!(await isMinecraftVersionAvailable(minecraftVersion))) {
  throw new Error(
    "A versão selecionada não existe no catálogo oficial do Minecraft."
  );
}

  if (query.length === 1 || query.length > 100) {
  throw new Error(
    "Escreve pelo menos 2 caracteres ou deixa a pesquisa vazia."
  );
}

  const facets = [
    [`project_type:${category}`]
  ];

  if (category === "mod") {
    if (!MODRINTH_LOADERS.includes(loader)) {
      throw new Error("Seleciona um mod loader compatível.");
    }

    facets.push([`versions:${minecraftVersion}`]);
    facets.push([`categories:${loader}`]);
  } else {
    facets.push([`versions:${minecraftVersion}`]);
  }

const params = new URLSearchParams({
  limit: "20",
  offset: String(offset),
  index: "relevance",
  facets: JSON.stringify(facets)
});

if (query) {
  params.set("query", query);
}

  const data = await fetchJson(
    `${MODRINTH_API}/search?${params.toString()}`
  );

  return {
    totalHits: Number(data.total_hits) || 0,
    offset: Number(data.offset) || offset,
    limit: Number(data.limit) || 20,
    hits: (Array.isArray(data.hits) ? data.hits : []).map((project) => ({
      id: project.project_id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      author: project.author,
      downloads: project.downloads,
      iconUrl: project.icon_url,
      projectType: project.project_type
    }))
  };
});

ipcMain.handle("toggle-installed-content", (_event, input) => {
  if (isLaunching) {
    throw new Error("Feche o Minecraft primeiro.");
  }

  const profile = getContentProfile(input?.profileId);

  const category = input.category;
  const filename = input.filename;

  validateContentFilename(filename, category);

  const directory = getContentDirectory(
    profile,
    category,
    input.worldId
  );

  const disabledDirectory = `${directory}-disabled`;

  const enabled = input.enabled === true;

  const sourceDirectory = enabled
    ? disabledDirectory
    : directory;

  const destinationDirectory = enabled
    ? directory
    : disabledDirectory;

  const source = path.join(sourceDirectory, filename);
  const destination = path.join(destinationDirectory, filename);

  if (!fs.existsSync(source)) {
    throw new Error("Arquivo não encontrado.");
  }

  if (
    !fs.lstatSync(source).isFile() ||
    fs.lstatSync(sourceDirectory).isSymbolicLink()
  ) {
    throw new Error("Arquivo inválido.");
  }

  if (fs.existsSync(destination)) {
    throw new Error("Já existe um arquivo no destino.");
  }

  fs.mkdirSync(destinationDirectory, {
    recursive: true
  });

  if (fs.lstatSync(destinationDirectory).isSymbolicLink()) {
    throw new Error("Diretório inválido.");
  }

  fs.renameSync(source, destination);

  return {
    success: true,
    enabled
  };
});

ipcMain.handle("remove-installed-content", (_event, input) => {
  if (isLaunching) {
    throw new Error("Feche o Minecraft primeiro.");
  }

  const profile = getContentProfile(input?.profileId);

  const category = input.category;
  const filename = input.filename;

  validateContentFilename(filename, category);

  const directory = getContentDirectory(
    profile,
    category,
    input.worldId
  );

  const sourceDirectory = input.enabled === false
    ? `${directory}-disabled`
    : directory;

  const file = path.join(sourceDirectory, filename);

  if (
    !fs.existsSync(file) ||
    !fs.lstatSync(file).isFile() ||
    fs.lstatSync(sourceDirectory).isSymbolicLink()
  ) {
    throw new Error("Arquivo não encontrado ou inválido.");
  }

  fs.unlinkSync(file);

  const stillExists =
    fs.existsSync(path.join(directory, filename)) ||
    fs.existsSync(path.join(`${directory}-disabled`, filename));

  const metadataPath = path.join(
    directory,
    ".cobble-mods.json"
  );

  if (!stillExists && fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );

    for (const [id, data] of Object.entries(metadata)) {
      if (data.filename === filename) {
        delete metadata[id];
      }
    }

    const temporaryPath = `${metadataPath}.tmp`;

    fs.writeFileSync(
      temporaryPath,
      JSON.stringify(metadata, null, 2),
      "utf8"
    );

    fs.renameSync(temporaryPath, metadataPath);
  }

  return { success: true };
});

ipcMain.handle("modrinth-versions", async (_event, input) => {
  const projectId = String(input?.projectId || "");
  const minecraftVersion = String(input?.minecraftVersion || "");
  const loader = String(input?.loader || "").toLowerCase();

  if (!/^[a-zA-Z0-9]{1,64}$/.test(projectId)) {
    throw new Error("Identificador de mod inválido.");
  }

  if (!(await isMinecraftVersionAvailable(minecraftVersion))) {
  throw new Error(
    "A versão selecionada não existe no catálogo oficial do Minecraft."
  );
}

  if (!MODRINTH_LOADERS.includes(loader)) {
    throw new Error("Seleciona um mod loader compatível.");
  }

  const params = new URLSearchParams({
    game_versions: JSON.stringify([minecraftVersion]),
    loaders: JSON.stringify([loader])
  });

  const versions = await fetchJson(
    `${MODRINTH_API}/project/${encodeURIComponent(projectId)}/version?${params.toString()}`
  );

  return (Array.isArray(versions) ? versions : []).map((version) => ({
    id: version.id,
    name: version.name,
    versionNumber: version.version_number,
    gameVersions: version.game_versions,
    loaders: version.loaders,
    files: (version.files || []).map((file) => ({
      filename: file.filename,
      url: file.url,
      primary: file.primary,
      size: file.size
    })),
    dependencies: version.dependencies || []
  }));
});


// ==================================================
// INSTALAÇÃO DE MODS E MODPACKS DO MODRINTH
// ==================================================

function getInstanceDirectory(profile) {
  return path.join(
    getGameRoot(),
    profile.slug
  );
}

function resolveInside(baseDirectory, relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");

  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.split("/").some((part) => part === "..")
  ) {
    throw new Error("O pacote contém um caminho de arquivo inválido.");
  }

  const base = path.resolve(baseDirectory);
  const target = path.resolve(base, normalized);
  const relative = path.relative(base, target);

  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error("O arquivo tenta sair da pasta da instalação.");
  }

  return target;
}

function isAllowedDownloadUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();

    const allowedHosts = [
      "cdn.modrinth.com",
      "github.com",
      "raw.githubusercontent.com",
      "gitlab.com",
      "edge.forgecdn.net",
      "media.forgecdn.net"
    ];

    return allowedHosts.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

async function downloadVerifiedFile(url, destination, hashes = {}) {
  if (!isAllowedDownloadUrl(url)) {
    throw new Error("A fonte de download não é permitida.");
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(120000),
    headers: { "User-Agent": "CobbleLauncher/1.0" }
  });

  if (!response.ok) {
    throw new Error(`Falha no download: HTTP ${response.status}.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (hashes.sha1) {
    const actual = crypto.createHash("sha1").update(buffer).digest("hex");

    if (actual.toLowerCase() !== hashes.sha1.toLowerCase()) {
      throw new Error("Um arquivo baixado não passou na verificação SHA-1.");
    }
  }

  if (hashes.sha512) {
    const actual = crypto.createHash("sha512").update(buffer).digest("hex");

    if (actual.toLowerCase() !== hashes.sha512.toLowerCase()) {
      throw new Error("Um arquivo baixado não passou na verificação SHA-512.");
    }
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, buffer);

  return buffer;
}

function copyMrpackOverrides(zip, prefix, instanceDirectory) {
  const normalizedPrefix = `${prefix}/`;

  for (const entry of zip.getEntries()) {
    const entryName = entry.entryName.replace(/\\/g, "/");

    if (entry.isDirectory || !entryName.startsWith(normalizedPrefix)) {
      continue;
    }

    const relativePath = entryName.slice(normalizedPrefix.length);
    if (!relativePath) continue;

    const destination = resolveInside(instanceDirectory, relativePath);

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, entry.getData());
  }
}

async function identifyInstalledContent(directory, category) {
  const extension = category === "mod" ? ".jar" : ".zip";

  const registered = readInstalledContent(directory);

  const registeredFiles = new Set(
    registered.map((item) => item.filename)
  );

  const locations = [
    directory,
    `${directory}-disabled`
  ];

  for (const location of locations) {
    if (!fs.existsSync(location)) continue;

    const entries = fs.readdirSync(location, {
      withFileTypes: true
    });

    for (const entry of entries) {
      if (
        !entry.isFile() ||
        !entry.name.toLowerCase().endsWith(extension) ||
        registeredFiles.has(entry.name) &&
registered.some((item) =>
  item.filename === entry.name &&
  !item.projectId.startsWith("curseforge-")
)
      ) {
        continue;
      }

      try {
        const filePath = path.join(
          location,
          entry.name
        );

        const buffer = await fs.promises.readFile(filePath);

        const sha1 = crypto
          .createHash("sha1")
          .update(buffer)
          .digest("hex");

        const sha512 = crypto
          .createHash("sha512")
          .update(buffer)
          .digest("hex");

        const response = await fetch(
          `${MODRINTH_API}/version_file/${sha1}?algorithm=sha1`,
          {
            headers: {
              "User-Agent": "CobbleLauncher/1.1.1"
            },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (!response.ok) continue;

        const version = await response.json();

        if (!version.project_id) continue;

        const project = await fetchJson(
          `${MODRINTH_API}/project/${encodeURIComponent(version.project_id)}`
        );

        fs.mkdirSync(directory, {
          recursive: true
        });

        registerInstalledContent(
          directory,
          version.project_id,
          {
            category,
            filename: entry.name,
            name: project.title || entry.name,
            description: project.description || "",
            iconUrl: project.icon_url || "",
            source: "modrinth",
            slug: project.slug || "",
            sha1,
            sha512
          }
        );

        registeredFiles.add(entry.name);

        console.log(
          "[Conteúdo identificado]",
          entry.name,
          project.title,
          version.project_id
        );

      } catch (error) {
        console.warn(
          "[Identificação de conteúdo]",
          entry.name,
          error.message
        );
      }
    }
  }
}

function readInstalledContent(directory) {
  const metadataPath = path.join(
    directory,
    ".cobble-mods.json"
  );

  let metadata = {};

  try {
    metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );
  } catch {
    return [];
  }

  return Object.entries(metadata)
    .filter(([projectId, data]) => {
      if (
        !data?.filename ||
        path.basename(data.filename) !== data.filename ||
        /[\\/]/.test(data.filename)
      ) {
        return false;
      }

      return (
        fs.existsSync(
          path.join(directory, data.filename)
        ) ||
        fs.existsSync(
          path.join(`${directory}-disabled`, data.filename)
        )
      );
    })
    .map(([projectId, data]) => ({
      ...data,
      projectId
    }));
}

ipcMain.handle("get-installed-content", async (_event, input) => {
  const profile = getContentProfile(input?.profileId);

  const category = input.category;

  if (category === "modpack") {
    return loadSettings().profiles
      .filter((item) => item.id === profile.id && item.modpack)
      .map((item) => ({
        ...item.modpack,
        profileId: item.id,
        name: item.name,
        enabled: true
      }));
  }

  const directory = getContentDirectory(
    profile,
    category,
    input.worldId
  );

  await identifyInstalledContent(directory, category);

  return listManagedContent(directory, category);
});

const CONTENT_DIRECTORIES = {
  mod: "mods",
  resourcepack: "resourcepacks",
  shader: "shaderpacks",
  datapack: "datapacks"
};

function getContentDirectory(profile, category, worldId) {
  if (!Object.hasOwn(CONTENT_DIRECTORIES, category)) {
    throw new Error("Categoria inválida.");
  }

  if (category === "datapack") {
    return selectDatapackDirectory(profile, worldId);
  }

  return path.join(
    getInstanceDirectory(profile),
    CONTENT_DIRECTORIES[category]
  );
}

function getContentProfile(profileId) {
  const profile = loadSettings().profiles.find(
    (item) => item.id === profileId
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  return profile;
}

function listManagedContent(directory, category) {
  const metadata = readInstalledContent(directory);
  const result = [];

  const locations = [
    { directory, enabled: true },
    {
      directory: `${directory}-disabled`,
      enabled: false
    }
  ];

  for (const location of locations) {
    if (!fs.existsSync(location.directory)) continue;

    if (fs.lstatSync(location.directory).isSymbolicLink()) {
      throw new Error("Diretório inválido.");
    }

    const entries = fs.readdirSync(
      location.directory,
      { withFileTypes: true }
    );

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const extension = category === "mod" ? ".jar" : ".zip";

      if (!entry.name.toLowerCase().endsWith(extension)) {
        continue;
      }

      const matches = metadata.filter((item) => item.filename === entry.name);
      const registered = matches.find(item => !item.projectId.startsWith("curseforge-")) || matches[0];

      result.push({
        ...registered,
        projectId: registered?.projectId || null,
        projectIds: matches.map(item => item.projectId),
        category,
        filename: entry.name,
        name: registered?.name ||
          entry.name.replace(/\.(jar|zip)$/i, ""),
        description: registered?.description || "",
        iconUrl: registered?.iconUrl || "",
        enabled: location.enabled
      });
    }
  }

  return result.sort(
    (a, b) => a.name.localeCompare(b.name)
  );
}

function validateContentFilename(filename, category) {
  const extension = category === "mod" ? ".jar" : ".zip";

  if (
    typeof filename !== "string" ||
    path.basename(filename) !== filename ||
    /[\\/]/.test(filename) ||
    !filename.toLowerCase().endsWith(extension)
  ) {
    throw new Error("Nome de arquivo inválido.");
  }
}

function registerInstalledContent(directory, projectId, data) {
  const metadataPath = path.join(
    directory,
    ".cobble-mods.json"
  );

  let metadata = {};

  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );
  }

  metadata[projectId] = {
    ...data,
    installedAt: new Date().toISOString()
  };

  const temporaryPath = `${metadataPath}.tmp`;

  fs.writeFileSync(
    temporaryPath,
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  fs.renameSync(temporaryPath, metadataPath);
}

function checkDuplicateMod(
  modsDirectory,
  modId,
  filename,
  modName,
  hashes = {}
) {
  const metadataPath = path.join(
    modsDirectory,
    ".cobble-mods.json"
  );

  let installedMods = {};

  try {
    installedMods = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );
  } catch {
    installedMods = {};
  }

  const normalizedFilename = String(filename || "")
    .trim()
    .toLowerCase();

  const incomingSha1 = String(hashes.sha1 || "").toLowerCase();
  const incomingSha512 = String(hashes.sha512 || "").toLowerCase();

  const duplicateEntry = Object.entries(installedMods).find(
    ([id, mod]) => {
      const activeFile = path.join(
  modsDirectory,
  mod.filename
);

const disabledFile = path.join(
  `${modsDirectory}-disabled`,
  mod.filename
);

if (
  !fs.existsSync(activeFile) &&
  !fs.existsSync(disabledFile)
) {
  return false;
}
      if (id === String(modId)) return true;

      const sameFile =
        String(mod.filename || "").trim().toLowerCase() ===
        normalizedFilename;

      const sameSha1 =
        incomingSha1 &&
        String(mod.sha1 || "").toLowerCase() === incomingSha1;

      const sameSha512 =
        incomingSha512 &&
        String(mod.sha512 || "").toLowerCase() === incomingSha512;

      return sameFile || sameSha1 || sameSha512;
    }
  );

  if (duplicateEntry) {
    throw new Error(
      `"${modName}" parece já estar instalado neste perfil. Verifique os conteúdos instalados antes de tentar novamente.`
    );
  }

  const destination = path.join(modsDirectory, filename);

  if (
  fs.existsSync(destination) ||
  fs.existsSync(
    path.join(`${modsDirectory}-disabled`, filename)
  )
) {
    throw new Error(
      `Já existe um arquivo chamado "${filename}" na pasta de conteúdo.`
    );
  }
}

async function installModrinthMod(input) {
  const settings = loadSettings();
  const profile = settings.profiles.find(
    (item) => item.id === input.profileId
  );

  if (!profile) {
    throw new Error("Seleciona uma instalação válida.");
  }

  if (profile.loader === "vanilla") {
    throw new Error("Mods exigem Fabric, Forge, NeoForge ou Quilt.");
  }

  const projectId = String(input.projectId || "");

  if (!/^[a-zA-Z0-9]{1,64}$/.test(projectId)) {
    throw new Error("Identificador do mod inválido.");
  }

  const project = await fetchJson(
  `${MODRINTH_API}/project/${encodeURIComponent(projectId)}`
);

  const params = new URLSearchParams({
    game_versions: JSON.stringify([profile.minecraftVersion]),
    loaders: JSON.stringify([profile.loader])
  });

  const versions = await fetchJson(
    `${MODRINTH_API}/project/${encodeURIComponent(projectId)}/version?${params}`
  );

  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error("Não há versão deste mod compatível com o perfil.");
  }

  const version = versions[0];
  const file =
    version.files?.find((item) => item.primary) ||
    version.files?.[0];

  if (!file?.url || !file.filename) {
    throw new Error("O Modrinth não forneceu um arquivo instalável.");
  }

  if (path.basename(file.filename) !== file.filename) {
    throw new Error("O nome do arquivo do mod é inválido.");
  }

  const modsDirectory = path.join(
    getInstanceDirectory(profile),
    "mods"
  );

checkDuplicateMod(
  modsDirectory,
  projectId,
  file.filename,
  project.title,
  file.hashes || {}
);

const destination = resolveInside(modsDirectory, file.filename);

await downloadVerifiedFile(file.url, destination, file.hashes || {});

// Registra qual projeto foi instalado neste perfil.
const metadataPath = path.join(
  modsDirectory,
  ".cobble-mods.json"
);

let installedMods = {};

try {
  installedMods = JSON.parse(
    fs.readFileSync(metadataPath, "utf8")
  );
} catch {
  installedMods = {};
}

installedMods[projectId] = {
  filename: file.filename,
  name: project.title || "Mod sem nome",
  description: project.description || "",
  iconUrl: project.icon_url || "",
  sha1: file.hashes?.sha1 || "",
  sha512: file.hashes?.sha512 || "",
  installedAt: new Date().toISOString()
};

fs.writeFileSync(
  metadataPath,
  JSON.stringify(installedMods, null, 2),
  "utf8"
);

  return {
    success: true,
    profileName: profile.name,
    filename: file.filename
  };
}

const pendingManualDownloads = new Map();

async function importCurseForgeDependency(file, destination) {
  const expectedSha1 = String(
    file.hashes?.sha1 || ""
  ).toLowerCase();

  if (!/^[a-f0-9]{40}$/.test(expectedSha1)) {
    throw new Error("Hash do arquivo indisponível.");
  }

  const requestId = crypto.randomUUID();

  let websiteUrl = null;

  try {
    const url = new URL(file.websiteUrl);

    if (
      url.protocol === "https:" &&
      ["www.curseforge.com", "curseforge.com"]
        .includes(url.hostname) &&
      Number.isSafeInteger(file.id)
    ) {
      url.pathname =
        url.pathname.replace(/\/+$/, "") +
        `/files/${file.id}`;

      url.search = "";
      url.hash = "";

      websiteUrl = url.toString();
    }
  } catch {
    websiteUrl = null;
  }

  return new Promise((resolve, reject) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      reject(new Error("Janela indisponível."));
      return;
    }

    const window = mainWindow;

const timeout = setTimeout(() => {
  const request = pendingManualDownloads.get(requestId);

  if (request) {
    request.reject(
      new Error("Tempo limite do download manual atingido.")
    );
  }
}, 30 * 60 * 1000);

    const cleanup = () => {
  clearTimeout(timeout);
  pendingManualDownloads.delete(requestId);
  window.removeListener("closed", onClosed);
};

    const onClosed = () => {
      cleanup();
      reject(new Error("Instalação cancelada."));
    };

    pendingManualDownloads.set(requestId, {
      file,
      destination,
      expectedSha1,
      websiteUrl,
      busy: false,

      resolve: () => {
        cleanup();
        resolve();
      },

      reject: (error) => {
        cleanup();
        reject(error);
      }
    });

    window.once("closed", onClosed);

    window.webContents.send("manual-download-required", {
      requestId,
      name: file.projectName || file.displayName,
      filename: file.fileName,
      iconUrl: file.iconUrl || "",
      canOpenWebsite: Boolean(websiteUrl)
    });
  });
}

ipcMain.handle("manual-download-open", async (_event, requestId) => {
  const request = pendingManualDownloads.get(requestId);

  if (!request?.websiteUrl) {
    return { success: false };
  }

  await shell.openExternal(request.websiteUrl);

  return { success: true };
});

ipcMain.handle("manual-download-select", async (_event, requestId) => {
  const request = pendingManualDownloads.get(requestId);

  if (!request || request.busy) {
    return { success: false };
  }

  request.busy = true;

  try {
    const extension = path.extname(request.file.fileName)
      .slice(1)
      .toLowerCase();

    const selected = await dialog.showOpenDialog(
      mainWindow,
      {
        defaultPath: app.getPath("downloads"),
        properties: ["openFile"],
        filters: [
          {
            name: "Minecraft content",
            extensions: [extension]
          }
        ]
      }
    );

    if (selected.canceled || !selected.filePaths.length) {
      return { success: false, canceled: true };
    }

    const buffer = await fs.promises.readFile(
      selected.filePaths[0]
    );

    const actualSha1 = crypto
      .createHash("sha1")
      .update(buffer)
      .digest("hex");

    if (actualSha1 !== request.expectedSha1) {
      return {
        success: false,
        error: "invalidHash"
      };
    }

    if (!pendingManualDownloads.has(requestId)) {
      return { success: false, canceled: true };
    }

    fs.mkdirSync(
      path.dirname(request.destination),
      { recursive: true }
    );

    fs.writeFileSync(request.destination, buffer, {
      flag: "wx"
    });

    console.log(
      "[CurseForge] Arquivo manual verificado:",
      request.file.fileName
    );

    request.resolve();

    return { success: true };

  } catch (error) {
    console.error("[Manual download]", error);

    return {
      success: false,
      error: "importFailed"
    };

  } finally {
    request.busy = false;
  }
});

ipcMain.handle("manual-download-cancel", (_event, requestId) => {
  const request = pendingManualDownloads.get(requestId);

  if (!request || request.busy) {
    return { success: false };
  }

  request.reject(
    new Error("Instalação cancelada pelo usuário.")
  );

  return { success: true };
});

async function installCurseForgeModpack(input) {
  const settings = loadSettings();

  const sourceProfile = getContentProfile(
    input.profileId
  );

  const modId = Number(input.modId);

  if (!Number.isSafeInteger(modId) || modId <= 0) {
    throw new Error("Modpack inválido.");
  }

  const params = new URLSearchParams({
    modId: String(modId),
    category: "modpack",
    gameVersion: sourceProfile.minecraftVersion
  });

  const result = await fetchJson(
    `${COBBLELAUNCHER_API}/curseforge/files?${params}`
  );

  let packFile = result.data?.find((file) =>
  /\.zip$/i.test(file.fileName || "") &&
  Array.isArray(file.gameVersions) &&
  file.gameVersions.includes(
    sourceProfile.minecraftVersion
  )
);

if (packFile && !packFile.downloadUrl) {
  const details = await fetchJson(
    `${COBBLELAUNCHER_API}/curseforge/file?modId=${modId}&fileId=${packFile.id}`
  );

  if (!details.data) {
    throw new Error(
      "Não foi possível consultar o modpack."
    );
  }

  packFile = {
    ...packFile,
    ...details.data
  };
}

  if (!packFile) {
    throw new Error("Nenhum modpack compatível disponível.");
  }

  const tempDirectory = fs.mkdtempSync(
    path.join(app.getPath("temp"), "cobble-cursepack-")
  );

  let instanceDirectory = null;
  let completed = false;

  try {
    const archivePath = path.join(
      tempDirectory,
      "modpack.zip"
    );

    if (
  packFile.downloadUrl &&
  packFile.allowModDistribution !== false
) {
  await downloadVerifiedFile(
    packFile.downloadUrl,
    archivePath,
    packFile.hashes || {}
  );
} else {
  await importCurseForgeDependency(
    packFile,
    archivePath
  );
}

    const zip = new AdmZip(archivePath);

    const entry = zip.getEntry("manifest.json");

    if (!entry) {
      throw new Error("Manifesto do modpack não encontrado.");
    }

    const manifest = JSON.parse(
      entry.getData().toString("utf8")
    );

    if (
      manifest.manifestType !== "minecraftModpack" ||
      !manifest.minecraft?.version ||
      !Array.isArray(manifest.files)
    ) {
      throw new Error("Manifesto inválido.");
    }

    const loaders = manifest.minecraft.modLoaders || [];

    const primaryLoader =
      loaders.find((loader) => loader.primary) ||
      loaders[0];

    let loader = "vanilla";
    let loaderVersion = "";

    if (primaryLoader) {
      const match = String(primaryLoader.id).match(
        /^(forge|fabric|neoforge|quilt)-(.+)$/
      );

      if (!match) {
        throw new Error("Loader do modpack não suportado.");
      }

      loader = match[1];
      loaderVersion = match[2];
    }

    const profile = await normalizeProfile({
      name: String(manifest.name || "CurseForge Modpack")
        .trim()
        .slice(0, 60),
      minecraftVersion: manifest.minecraft.version,
      loader,
      loaderVersion,
      maxRam: sourceProfile.maxRam,
      javaMode: sourceProfile.javaMode,
      javaPath: sourceProfile.javaPath
    }, settings.profiles);

    const originalSlug = profile.slug;

let suffix = 2;

while (fs.existsSync(getInstanceDirectory(profile))) {
  profile.slug = `${originalSlug}-${suffix++}`;
}

const destination = getInstanceDirectory(profile);

    // Não reutiliza uma pasta existente.
    fs.mkdirSync(path.dirname(destination), {
      recursive: true
    });

    fs.mkdirSync(destination);

    instanceDirectory = destination;

    let installedFiles = 0;

    for (const dependency of manifest.files) {
      if (dependency.required === false) continue;

      const projectId = Number(dependency.projectID);
      const fileId = Number(dependency.fileID);

      if (
        !Number.isSafeInteger(projectId) ||
        !Number.isSafeInteger(fileId) ||
        projectId <= 0 ||
        fileId <= 0
      ) {
        throw new Error("Dependência inválida.");
      }

      const data = await fetchJson(
        `${COBBLELAUNCHER_API}/curseforge/file?modId=${projectId}&fileId=${fileId}`
      );

      const file = data.data;
      console.log("[CurseForge Modpack] Dependência:", {
        projectId,
  fileId,
  projectName: file?.projectName,
  fileName: file?.fileName,
  classId: file?.classId,
  downloadUrl: file?.downloadUrl,
  allowModDistribution: file?.allowModDistribution,
  websiteUrl: file?.websiteUrl,
  hashes: file?.hashes
});
      if (!file) {
  throw new Error(
    `Não foi possível consultar o arquivo ${fileId}.`
  );
}

      if (
        !file.fileName ||
        path.basename(file.fileName) !== file.fileName ||
        /[\\/]/.test(file.fileName)
      ) {
        throw new Error("Nome de arquivo inválido.");
      }

      let folder;

      if (/\.jar$/i.test(file.fileName)) {
        folder = "mods";
      } else if (
        /\.zip$/i.test(file.fileName) &&
        file.classId === 12
      ) {
        folder = "resourcepacks";
      } else if (
        /\.zip$/i.test(file.fileName) &&
        file.classId === 6552
      ) {
        folder = "shaderpacks";
      } else {
        throw new Error(
          `Tipo de dependência não suportado: ${file.fileName}`
        );
      }

      const targetDirectory = path.join(
        instanceDirectory,
        folder
      );

      const target = resolveInside(
        targetDirectory,
        file.fileName
      );

      if (fs.existsSync(target)) {
        throw new Error("Arquivo duplicado no modpack.");
      }

      if (
  file.downloadUrl &&
  file.allowModDistribution !== false
) {
  await downloadVerifiedFile(
    file.downloadUrl,
    target,
    file.hashes || {}
  );
} else {
  await importCurseForgeDependency(
    file,
    target
  );
}
      registerInstalledContent(
        targetDirectory,
        `curseforge-${projectId}`,
        {
          filename: file.fileName,
          name: file.displayName || file.fileName,
          source: "curseforge",
          sha1: file.hashes?.sha1 || ""
        }
      );

      installedFiles++;

      sendProgress(
        "installing",
        `Instalando modpack: ${installedFiles} arquivos...`,
        {
          percent: Math.round(
            installedFiles /
            Math.max(1, manifest.files.length) * 100
          )
        }
      );
    }

    const overrides = String(
      manifest.overrides || "overrides"
    );

    copyMrpackOverrides(
      zip,
      overrides,
      instanceDirectory
    );

    profile.modpack = {
      projectId: `curseforge-${modId}`,
      source: "curseforge",
      category: "modpack",
      name: profile.name,
      versionId: packFile.id
    };

    const latestSettings = loadSettings();

    latestSettings.profiles.push(profile);

    saveSettings(latestSettings);

    completed = true;

    return {
      success: true,
      profile,
      installedFiles
    };

  } finally {
    fs.rmSync(tempDirectory, {
      recursive: true,
      force: true
    });

    if (!completed && instanceDirectory) {
      fs.rmSync(instanceDirectory, {
        recursive: true,
        force: true
      });
    }
  }
}

async function installCurseForgeMod(input) {
  const settings = loadSettings();
  const profile = settings.profiles.find(
    (item) => item.id === input.profileId
  );

  if (!profile) {
    throw new Error("Seleciona uma instalação válida.");
  }

  const category = String(input.category || "mod");
    if (category === "modpack") {
  return installCurseForgeModpack(input);
}

const contentDirectories = {
  mod: "mods",
  resourcepack: "resourcepacks",
  shader: "shaderpacks",
  datapack: "datapacks"
};

if (!Object.hasOwn(contentDirectories, category)) {
  throw new Error("A instalação desta categoria ainda não está implementada.");
}

if (category === "mod" && profile.loader === "vanilla") {
  throw new Error("Mods exigem Fabric, Forge, NeoForge ou Quilt.");
}

  const modId = Number(input.modId);

  if (!Number.isSafeInteger(modId) || modId <= 0) {
    throw new Error("Identificador do mod inválido.");
  }

  const params = new URLSearchParams({
  modId: String(modId),
  gameVersion: profile.minecraftVersion,
  category
});

if (category === "mod") {
  params.set("loader", profile.loader);
}
  const response = await fetch(
    `${COBBLELAUNCHER_API}/curseforge/files?${params}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000)
    }
  );

  const result = await response.json();

  if (!response.ok || !Array.isArray(result.data)) {
    throw new Error(
      result.error || "Não foi possível buscar os arquivos do CurseForge."
    );
  }

console.log(
  "[CurseForge] Arquivos recebidos:",
  result.data.map((item) => ({
    fileName: item.fileName,
    gameVersions: item.gameVersions,
    hasDownloadUrl: Boolean(item.downloadUrl)
  }))
);

const compatibleFiles = result.data.filter(
  (item) =>
    item.fileName &&
    path.basename(item.fileName) === item.fileName &&
    !/[\\/]/.test(item.fileName) &&
    item.fileName.toLowerCase().endsWith(
      category === "mod" ? ".jar" : ".zip"
    ) &&
    Array.isArray(item.gameVersions) &&
    item.gameVersions.includes(profile.minecraftVersion)
);

let file = compatibleFiles[0];

if (file && !file.downloadUrl) {
  const details = await fetchJson(
    `${COBBLELAUNCHER_API}/curseforge/file?modId=${modId}&fileId=${file.id}`
  );

  if (!details.data) {
    throw new Error(
      "Não foi possível consultar os detalhes do conteúdo."
    );
  }

  file = {
    ...file,
    ...details.data
  };
}

  if (!file) {
    throw new Error(
      "Não foi encontrado um arquivo compatível com esta instalação."
    );
  }

  const modsDirectory =
  category === "datapack"
    ? selectDatapackDirectory(profile, input.worldId)
    : path.join(
        getInstanceDirectory(profile),
        contentDirectories[category]
      );

if (!modsDirectory) {
  return { success: false, canceled: true };
}

checkDuplicateMod(
  modsDirectory,
  `curseforge-${modId}`,
  file.fileName,
  file.displayName,
  file.hashes || {}
);

fs.mkdirSync(modsDirectory, { recursive: true });

if (category !== "mod") {
  if (
    !file.fileName.toLowerCase().endsWith(".zip") ||
    /[\\/]/.test(file.fileName)
  ) {
    throw new Error("Formato de arquivo inválido.");
  }

  const destination = resolveInside(
    modsDirectory,
    file.fileName
  );

  if (fs.existsSync(destination)) {
    throw new Error("Este conteúdo já está instalado neste perfil.");
  }

  if (
  file.downloadUrl &&
  file.allowModDistribution !== false
) {
  await downloadVerifiedFile(
    file.downloadUrl,
    destination,
    file.hashes || {}
  );
} else {
  await importCurseForgeDependency(
    file,
    destination
  );
}

  registerInstalledContent(
  modsDirectory,
  `curseforge-${modId}`,
  {
    category,
    filename: file.fileName,
    name: file.displayName || file.fileName,
    description: "",
    iconUrl: "",
    source: "curseforge",
    sha1: file.hashes?.sha1 || "",
    sha512: file.hashes?.sha512 || ""
  }
);

  return {
    success: true,
    profileName: profile.name,
    filename: file.fileName
  };
}

const destination = resolveInside(modsDirectory, file.fileName);

if (
  file.downloadUrl &&
  file.allowModDistribution !== false
) {
  await downloadVerifiedFile(
    file.downloadUrl,
    destination,
    file.hashes || {}
  );
} else {
  await importCurseForgeDependency(
    file,
    destination
  );
}

  const metadataPath = path.join(modsDirectory, ".cobble-mods.json");

  let installedMods = {};

  try {
    installedMods = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch {
    installedMods = {};
  }

installedMods[`curseforge-${modId}`] = {
  filename: file.fileName,
  name: file.displayName || file.fileName,
  description: "",
  iconUrl: "",
  source: "curseforge",
  sha1: file.hashes?.sha1 || "",
  sha512: file.hashes?.sha512 || "",
  installedAt: new Date().toISOString()
};

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(installedMods, null, 2),
    "utf8"
  );

  return {
    success: true,
    profileName: profile.name,
    filename: file.fileName
  };
}

async function installModrinthModpack(input) {
  const settings = loadSettings();
  const sourceProfile = settings.profiles.find(
    (item) => item.id === input.profileId
  );

if (!sourceProfile) {
    throw new Error("Seleciona uma instalação para escolher a versão do Minecraft.");
  }

  const projectId = String(input.projectId || "");

  if (!/^[a-zA-Z0-9]{1,64}$/.test(projectId)) {
    throw new Error("Identificador do modpack inválido.");
  }

  const params = new URLSearchParams({
    game_versions: JSON.stringify([sourceProfile.minecraftVersion])
  });

  const versions = await fetchJson(
    `${MODRINTH_API}/project/${encodeURIComponent(projectId)}/version?${params}`
  );

  const version = (Array.isArray(versions) ? versions : []).find((item) =>
    (item.files || []).some((file) =>
      /\.mrpack$/i.test(file.filename || "")
    )
  );

  if (!version) {
    throw new Error(
      `Não encontrei um arquivo .mrpack compatível com Minecraft ${sourceProfile.minecraftVersion}.`
    );
  }

  const packFile =
    version.files.find((file) => file.primary && /\.mrpack$/i.test(file.filename)) ||
    version.files.find((file) => /\.mrpack$/i.test(file.filename));

  if (!packFile?.url) {
    throw new Error("O modpack não tem um arquivo .mrpack disponível.");
  }

  const tempDirectory = fs.mkdtempSync(
    path.join(app.getPath("temp"), "cobblelauncher-mrpack-")
  );

  try {
    const archivePath = path.join(tempDirectory, "modpack.mrpack");

    await downloadVerifiedFile(
      packFile.url,
      archivePath,
      packFile.hashes || {}
    );

    const zip = new AdmZip(archivePath);
    const indexEntry = zip.getEntry("modrinth.index.json");

    if (!indexEntry) {
      throw new Error("Este arquivo não contém modrinth.index.json.");
    }

    const manifest = JSON.parse(indexEntry.getData().toString("utf8"));

    if (
      manifest.game !== "minecraft" ||
      !Array.isArray(manifest.files) ||
      !manifest.dependencies ||
      typeof manifest.dependencies !== "object"
    ) {
      throw new Error("O manifesto do modpack é inválido.");
    }

    const dependencies = manifest.dependencies;
    const minecraftVersion = String(dependencies.minecraft || "");

    if (!(await isMinecraftVersionAvailable(minecraftVersion))) {
  throw new Error(
    `Este modpack exige Minecraft ${minecraftVersion || "desconhecido"}, que não foi encontrado no catálogo oficial.`
  );
}

    const loaderDependencies = [
      ["fabric-loader", "fabric"],
      ["forge", "forge"],
      ["neoforge", "neoforge"],
      ["quilt-loader", "quilt"]
    ].filter(([key]) => dependencies[key]);

    if (loaderDependencies.length > 1) {
      throw new Error("O modpack declara mais de um mod loader.");
    }

    const [loaderKey, loader] = loaderDependencies[0] || ["", "vanilla"];
    const loaderVersion = loaderKey
      ? String(dependencies[loaderKey])
      : "";

    const profileName = String(manifest.name || version.name || "Modpack").trim();

    if (!profileName || profileName.length > 60) {
      throw new Error("O nome do modpack é inválido.");
    }

    const profile = await normalizeProfile({
      name: profileName,
      minecraftVersion,
      loader,
      loaderVersion,
      maxRam: sourceProfile.maxRam,
      javaMode: sourceProfile.javaMode,
      javaPath: sourceProfile.javaPath
    }, settings.profiles);

    const instanceDirectory = getInstanceDirectory(profile);
    fs.mkdirSync(instanceDirectory, { recursive: true });

    let installedFiles = 0;

    for (const file of manifest.files) {
      // Arquivos exclusivos de servidor não são instalados no cliente.
      if (file.env?.client === "unsupported") continue;

      if (
        !file.path ||
        !Array.isArray(file.downloads) ||
        !file.hashes ||
        (!file.hashes.sha1 && !file.hashes.sha512)
      ) {
        throw new Error("O manifesto contém um arquivo sem dados válidos.");
      }

      const destination = resolveInside(instanceDirectory, file.path);
      const downloadUrl = file.downloads.find(isAllowedDownloadUrl);

      if (!downloadUrl) {
        throw new Error(
          `Não há uma fonte HTTPS permitida para ${file.path}.`
        );
      }

      await downloadVerifiedFile(
        downloadUrl,
        destination,
        file.hashes
      );

      installedFiles++;
      sendProgress(
        "installing",
        `Instalando modpack: ${installedFiles}/${manifest.files.length} arquivos...`,
        {
          percent: Math.round(
            (installedFiles / Math.max(1, manifest.files.length)) * 100
          )
        }
      );
    }

    // Configurações e arquivos adicionais do pacote.
    copyMrpackOverrides(zip, "overrides", instanceDirectory);
    copyMrpackOverrides(zip, "client-overrides", instanceDirectory);

    profile.modpack = {
  projectId,
  source: "modrinth",
  category: "modpack",
  name: profile.name,
  versionId: version.id
};

    // Só registra o perfil depois de terminar a instalação.
    settings.profiles.push(profile);
    saveSettings(settings);

    return {
      success: true,
      profile,
      installedFiles
    };
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

function getWorldIconData(worldDirectory) {
  const iconPath = path.join(worldDirectory, "icon.png");

  if (!fs.existsSync(iconPath)) {
    return null;
  }

  try {
    const buffer = fs.readFileSync(iconPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

async function getWorldName(worldDirectory) {
  try {
    const levelPath = path.join(
      worldDirectory,
      "level.dat"
    );

    const buffer = await fs.promises.readFile(levelPath);

    const { parsed } = await nbt.parse(buffer);
    const data = nbt.simplify(parsed);

    return data.Data?.LevelName ||
      path.basename(worldDirectory);

  } catch (error) {
    console.warn(
      "[Mundos] Não foi possível ler o level.dat:",
      error.message
    );

    return path.basename(worldDirectory);
  }
}

function getProfileWorlds(profile) {
  const savesDirectory = path.join(
    getInstanceDirectory(profile),
    "saves"
  );

  if (!fs.existsSync(savesDirectory)) {
    return [];
  }

  return fs.readdirSync(savesDirectory, {
    withFileTypes: true
  })
    .filter((entry) => entry.isDirectory())
    .filter((entry) =>
      fs.existsSync(
        path.join(savesDirectory, entry.name, "level.dat")
      )
    )
    .map((entry) => {
  const worldDirectory = path.join(savesDirectory, entry.name);

  return {
    id: entry.name,
    name: entry.name,
    icon: getWorldIconData(worldDirectory)
  };
})
    .sort((a, b) => a.name.localeCompare(b.name));
}

ipcMain.handle("get-profile-worlds", async (_event, profileId) => {
  const settings = loadSettings();

  const profile = settings.profiles.find(
    (item) => item.id === profileId
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  const worlds = getProfileWorlds(profile);

  const result = await Promise.all(
    worlds.map(async (world) => {
      const worldDirectory = path.join(
        getInstanceDirectory(profile),
        "saves",
        world.id
      );

      return {
        ...world,
        name: await getWorldName(worldDirectory)
      };
    })
  );

  return result.sort(
    (a, b) => a.name.localeCompare(b.name)
  );
});

function selectDatapackDirectory(profile, worldId) {
  const worlds = getProfileWorlds(profile);

  const world = worlds.find(
    (item) => item.id === worldId
  );

  if (!world) {
    throw new Error("Mundo inválido ou não encontrado.");
  }

  const savesDirectory = path.join(
    getInstanceDirectory(profile),
    "saves"
  );

  const savesRoot = fs.realpathSync(savesDirectory);

  const worldDirectory = fs.realpathSync(
    path.join(savesRoot, world.id)
  );

  if (path.dirname(worldDirectory) !== savesRoot) {
    throw new Error("Caminho do mundo inválido.");
  }

  const datapacksDirectory = path.join(
    worldDirectory,
    "datapacks"
  );

  fs.mkdirSync(datapacksDirectory, {
    recursive: true
  });

  if (
    fs.realpathSync(datapacksDirectory) !== datapacksDirectory
  ) {
    throw new Error("Pasta de Datapacks inválida.");
  }

  return datapacksDirectory;
}

async function installModrinthPack(input) {
  const settings = loadSettings();

  const profile = settings.profiles.find(
    (item) => item.id === input.profileId
  );

  if (!profile) {
    throw new Error("Seleciona uma instalação válida.");
  }

  const directories = {
  shader: "shaderpacks",
  resourcepack: "resourcepacks",
  datapack: "datapacks"
};

  const directory = directories[input.category];

  if (!directory) {
    throw new Error("Categoria inválida.");
  }

  const projectId = String(input.projectId || "");

  if (!/^[a-zA-Z0-9]{1,64}$/.test(projectId)) {
    throw new Error("Identificador de projeto inválido.");
  }

  const project = await fetchJson(
    `${MODRINTH_API}/project/${encodeURIComponent(projectId)}`
  );

  if (
  input.category !== "datapack" &&
  project.project_type !== input.category
) {
  throw new Error("O tipo de conteúdo é inválido.");
}

  const params = new URLSearchParams({
    game_versions: JSON.stringify([
      profile.minecraftVersion
    ])
  });

  if (input.category === "datapack") {
  params.set(
    "loaders",
    JSON.stringify(["datapack"])
  );
}

  const versions = await fetchJson(
    `${MODRINTH_API}/project/${encodeURIComponent(projectId)}/version?${params}`
  );

  if (!Array.isArray(versions) || !versions.length) {
    throw new Error(
      "Nenhuma versão compatível foi encontrada."
    );
  }

  const version = versions.find((item) => {
  if (
    input.category === "datapack" &&
    !item.loaders?.includes("datapack")
  ) {
    return false;
  }

  return item.files?.some((file) =>
    /\.zip$/i.test(file.filename || "")
  );
});

if (!version) {
  throw new Error("Nenhum arquivo ZIP compatível encontrado.");
}

const file =
  version.files.find((item) =>
    item.primary && /\.zip$/i.test(item.filename || "")
  ) ||
  version.files.find((item) =>
    /\.zip$/i.test(item.filename || "")
  );

  if (!file?.url || !file.filename) {
    throw new Error("Arquivo instalável não encontrado.");
  }

  if (
    path.basename(file.filename) !== file.filename ||
    !file.filename.toLowerCase().endsWith(".zip")
  ) {
    throw new Error("Nome ou formato de arquivo inválido.");
  }

  const targetDirectory =
  input.category === "datapack"
    ? selectDatapackDirectory(profile, input.worldId)
    : path.join(
        getInstanceDirectory(profile),
        directory
      );

if (!targetDirectory) {
  return { success: false, canceled: true };
}

  const destination = resolveInside(
    targetDirectory,
    file.filename
  );

  if (fs.existsSync(destination)) {
    throw new Error(
      "Este conteúdo já está instalado neste perfil."
    );
  }

checkDuplicateMod(
  targetDirectory,
  projectId,
  file.filename,
  project.title,
  file.hashes || {}
);
await downloadVerifiedFile(
  file.url,
  destination,
  file.hashes || {}
);
registerInstalledContent(
  targetDirectory,
  projectId,
  {
    category: input.category,
    filename: file.filename,
    name: project.title || file.filename,
    description: project.description || "",
    iconUrl: project.icon_url || "",
    source: "modrinth",
    slug: project.slug || "",
    sha1: file.hashes?.sha1 || "",
    sha512: file.hashes?.sha512 || ""
  }
);


  return {
    success: true,
    profileName: profile.name,
    filename: file.filename
  };
}

ipcMain.handle("install-modrinth-content", async (_event, input) => {
  if (!input || typeof input !== "object") {
    throw new Error("Dados de instalação inválidos.");
  }

  const category = String(input.category || "");

  if (category === "mod") {
    return installModrinthMod(input);
  }

  if (category === "modpack") {
    return installModrinthModpack(input);
  }

  if (
  category === "shader" ||
  category === "resourcepack" ||
  category === "datapack"
) {
  return installModrinthPack(input);
}

  throw new Error(
    "A instalação desta categoria ainda não está implementada."
  );
});

ipcMain.handle("install-curseforge-mod", async (_event, input) => {
  if (!input || typeof input !== "object") {
    throw new Error("Dados de instalação inválidos.");
  }

  return installCurseForgeMod(input);
});


// ==================================================
// OPERAÇÕES DOS PERFIS
// ==================================================

ipcMain.handle("get-profiles", () => {
  return loadSettings().profiles;
});

ipcMain.handle("get-installed-mods", async (_event, profileId) => {
  const settings = loadSettings();

  const profile = settings.profiles.find(
    (item) => item.id === profileId
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  const instanceDirectory = getInstanceDirectory(profile);
  const modsDirectory = path.join(instanceDirectory, "mods");
  const disabledDirectory = path.join(instanceDirectory, "mods-disabled");

  const metadataPath = path.join(
    modsDirectory,
    ".cobble-mods.json"
  );

  let metadata = {};

  try {
    metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );
  } catch {
    metadata = {};
  }

  const mods = [];
  const seen = new Set();
  const metadataUpdates = {};

  async function readMods(directory, enabled) {
    if (!fs.existsSync(directory)) {
      return;
    }

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true
    })) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".jar")) {
        continue;
      }

      const filename = entry.name;

      if (seen.has(filename)) {
        continue;
      }

      seen.add(filename);

      const metadataEntry = Object.entries(metadata).find(
  ([, data]) => data.filename === filename
);

const projectId = metadataEntry?.[0] || null;
let data = metadataEntry?.[1] || {};

if (
  projectId &&
  data.source !== "curseforge" &&
  !projectId.startsWith("curseforge-") &&
  (!data.name || !data.description || !data.iconUrl)
) {
  try {
    const project = await fetchJson(
      `${MODRINTH_API}/project/${encodeURIComponent(projectId)}`
    );

    data = {
      ...data,
      name: data.name || project.title || "",
      description: data.description || project.description || "",
      iconUrl: data.iconUrl || project.icon_url || ""
    };

    metadataUpdates[projectId] = {
      ...data,
      filename
    };
  } catch (error) {
    console.warn(
      `[CobbleLauncher] Não foi possível recuperar os dados de ${filename}:`,
      error.message
    );
  }
}

      mods.push({
        projectId,
        filename,
        name: data.name || filename.replace(/\.jar$/i, ""),
        description: data.description || "",
        iconUrl: data.iconUrl || "",
        enabled
      });
    }
  }

  await readMods(modsDirectory, true);
await readMods(disabledDirectory, false);

if (Object.keys(metadataUpdates).length > 0) {
  Object.assign(metadata, metadataUpdates);

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(metadata, null, 2),
    "utf8"
  );
}

return mods;
});

ipcMain.handle("toggle-installed-mod", (_event, input) => {
  const settings = loadSettings();
  const profile = settings.profiles.find(
    (item) => item.id === input?.profileId
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  const filename = String(input?.filename || "");

  if (
    path.basename(filename) !== filename ||
    !filename.toLowerCase().endsWith(".jar")
  ) {
    throw new Error("Nome de arquivo inválido.");
  }

  const instanceDirectory = getInstanceDirectory(profile);
  const modsDirectory = path.join(instanceDirectory, "mods");
  const disabledDirectory = path.join(
    instanceDirectory,
    "mods-disabled"
  );

  const enabled = input.enabled === true;
  const sourceDirectory = enabled ? disabledDirectory : modsDirectory;
  const destinationDirectory = enabled ? modsDirectory : disabledDirectory;

  const source = path.join(sourceDirectory, filename);
  const destination = path.join(destinationDirectory, filename);

  if (!fs.existsSync(source)) {
    throw new Error("O arquivo do mod não foi encontrado.");
  }

  if (fs.existsSync(destination)) {
    throw new Error("Já existe um arquivo com esse nome no destino.");
  }

  fs.mkdirSync(destinationDirectory, { recursive: true });
  fs.renameSync(source, destination);

  return { success: true, enabled };
});

ipcMain.handle("remove-installed-mod", (_event, input) => {
  const settings = loadSettings();
  const profile = settings.profiles.find(
    (item) => item.id === input?.profileId
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  const filename = String(input?.filename || "");

  if (
    path.basename(filename) !== filename ||
    !filename.toLowerCase().endsWith(".jar")
  ) {
    throw new Error("Nome de arquivo inválido.");
  }

  const instanceDirectory = getInstanceDirectory(profile);
  const modsDirectory = path.join(instanceDirectory, "mods");
  const disabledDirectory = path.join(
    instanceDirectory,
    "mods-disabled"
  );

  const locations = [
    path.join(modsDirectory, filename),
    path.join(disabledDirectory, filename)
  ];

  const existingFiles = locations.filter((file) =>
    fs.existsSync(file)
  );

  if (existingFiles.length === 0) {
    throw new Error("O arquivo do mod não foi encontrado.");
  }

  for (const file of existingFiles) {
    if (!fs.statSync(file).isFile()) {
      throw new Error("O caminho do mod não é um arquivo válido.");
    }
  }

  for (const file of existingFiles) {
    fs.unlinkSync(file);
  }

  const metadataPath = path.join(
    modsDirectory,
    ".cobble-mods.json"
  );

  try {
    const metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );

    for (const [projectId, data] of Object.entries(metadata)) {
      if (data.filename === filename) {
        delete metadata[projectId];
      }
    }

    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("[Remover mod] Não foi possível atualizar os metadados:", error);
  }

  return { success: true };
});

ipcMain.handle("get-minecraft-versions", async () => {
  return await getMinecraftVersions();
});

ipcMain.handle("save-profile", async (_event, input) => {
  const settings = loadSettings();
  const profile = await normalizeProfile(input, settings.profiles);

  const index = settings.profiles.findIndex(
    (item) => item.id === profile.id
  );

  if (index >= 0) {
    settings.profiles[index] = profile;
  } else {
    settings.profiles.push(profile);
  }

  saveSettings(settings);
  return profile;
});


ipcMain.handle("save-skin", async (_event, input) => {
  if (!input || typeof input !== "object") {
    throw new Error("Dados da skin inválidos.");
  }

  const { name, data, model = "steve" } = input;

if (
  typeof name !== "string" ||
  !/^[\w -]+\.png$/i.test(name) ||
  typeof data !== "string" ||
  !data.startsWith("data:image/png;base64,") ||
  typeof model !== "string" ||
  !["steve", "alex"].includes(model)
) {
  throw new Error("Arquivo de skin inválido.");
}

  const base64 = data.slice("data:image/png;base64,".length);

  if (
    !base64 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64) ||
    base64.length % 4 !== 0
  ) {
    throw new Error("Conteúdo PNG inválido.");
  }

  const buffer = Buffer.from(base64, "base64");

  if (
    buffer.length < 8 ||
    buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
  ) {
    throw new Error("O arquivo selecionado não é um PNG válido.");
  }

  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error("A skin deve ter no máximo 2 MB.");
  }

  const skinsDirectory = path.join(app.getPath("userData"), "skins");
  await fs.promises.mkdir(skinsDirectory, { recursive: true });

  const filePath = path.join(skinsDirectory, name);
  await fs.promises.writeFile(filePath, buffer, { flag: "w" });

  return { success: true, name };
});


ipcMain.handle("rename-skin", async (_event, input) => {
  if (!input || typeof input !== "object") {
    throw new Error("Dados para renomear a skin inválidos.");
  }

  const { oldName, newName } = input;

  const validName = (name) =>
    typeof name === "string" &&
    /^[\w -]+\.png$/i.test(name) &&
    name.length <= 100;

  if (!validName(oldName) || !validName(newName)) {
    throw new Error("Nome da skin inválido.");
  }

  if (oldName === newName) {
    return { success: true, name: newName };
  }

  const skinsDirectory = path.join(app.getPath("userData"), "skins");
  const metadataPath = path.join(skinsDirectory, "skins.json");
  const oldPath = path.join(skinsDirectory, oldName);
  const newPath = path.join(skinsDirectory, newName);

  try {
    await fs.promises.access(oldPath);
  } catch {
    throw new Error("A skin original não foi encontrada.");
  }

  try {
    await fs.promises.access(newPath);
    throw new Error("Já existe uma skin com esse nome.");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  let metadata = {};

  try {
    const content = await fs.promises.readFile(metadataPath, "utf8");
    metadata = JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error("Não foi possível ler os dados das skins.");
    }
  }

  await fs.promises.rename(oldPath, newPath);

  try {
    if (Object.hasOwn(metadata, oldName)) {
      metadata[newName] = metadata[oldName];
      delete metadata[oldName];

      await fs.promises.writeFile(
        metadataPath,
        JSON.stringify(metadata, null, 2),
        "utf8"
      );
    }
  } catch (error) {
    await fs.promises.rename(newPath, oldPath).catch(() => {});
    throw new Error("Não foi possível atualizar os dados da skin.");
  }

  return { success: true, name: newName };
});


ipcMain.handle("get-saved-skins", async () => {
  const skinsDirectory = path.join(app.getPath("userData"), "skins");
  const metadataPath = path.join(skinsDirectory, "skins.json");

  await fs.promises.mkdir(skinsDirectory, { recursive: true });

  let metadata = {};

  try {
    const content = await fs.promises.readFile(metadataPath, "utf8");
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      metadata = parsed;
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) {
      console.error("Erro ao ler os metadados das skins:", error.message);
    }
  }

  const files = await fs.promises.readdir(skinsDirectory);
  const skins = [];

  for (const name of files) {
    if (!/^[\w -]+\.png$/i.test(name)) {
      continue;
    }

    const filePath = path.join(skinsDirectory, name);

    try {
      const buffer = await fs.promises.readFile(filePath);

      if (
        buffer.length < 8 ||
        buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
      ) {
        continue;
      }

      if (buffer.length > 2 * 1024 * 1024) {
        continue;
      }

      const savedModel = metadata[name]?.model;

      skins.push({
        name,
        data: `data:image/png;base64,${buffer.toString("base64")}`,
        model: ["steve", "alex"].includes(savedModel)
          ? savedModel
          : "steve"
      });
    } catch (error) {
      console.error(`Erro ao ler a skin ${name}:`, error.message);
    }
  }

  return skins;
});

ipcMain.handle("set-skin-model", async (_event, input) => {
  if (!input || typeof input !== "object") {
    throw new Error("Dados do modelo inválidos.");
  }

  const { name, model } = input;

  if (
    typeof name !== "string" ||
    !/^[\w -]+\.png$/i.test(name) ||
    typeof model !== "string" ||
    !["steve", "alex"].includes(model)
  ) {
    throw new Error("Nome da skin ou modelo inválido.");
  }

  const skinsDirectory = path.join(app.getPath("userData"), "skins");
  const metadataPath = path.join(skinsDirectory, "skins.json");
  const skinPath = path.join(skinsDirectory, name);

  await fs.promises.mkdir(skinsDirectory, { recursive: true });

  try {
    await fs.promises.access(skinPath);
  } catch {
    throw new Error("A skin selecionada não existe.");
  }

  let metadata = {};

  try {
    const content = await fs.promises.readFile(metadataPath, "utf8");
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      metadata = parsed;
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) {
      throw error;
    }
  }

  metadata[name] = { model };

  await fs.promises.writeFile(
    metadataPath,
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  return { success: true, name, model };
});

ipcMain.handle("delete-skin", async (_event, name) => {
  if (
  typeof name !== "string" ||
  !/^[\w -]+\.png$/i.test(name)
) {
    throw new Error("Nome da skin inválido.");
  }

  const skinsDirectory = path.join(app.getPath("userData"), "skins");
  const metadataPath = path.join(skinsDirectory, "skins.json");
  const skinPath = path.join(skinsDirectory, name);

  try {
    await fs.promises.unlink(skinPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("A skin não foi encontrada.");
    }

    throw error;
  }

  try {
    const content = await fs.promises.readFile(metadataPath, "utf8");
    const metadata = JSON.parse(content);

    if (
      metadata &&
      typeof metadata === "object" &&
      !Array.isArray(metadata) &&
      Object.hasOwn(metadata, name)
    ) {
      delete metadata[name];

      await fs.promises.writeFile(
        metadataPath,
        JSON.stringify(metadata, null, 2),
        "utf8"
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar os metadados das skins:", error.message);
  }

  return { success: true, name };
});

ipcMain.handle("delete-profile", async (_event, id) => {
  const settings = loadSettings();

  const profile = settings.profiles.find(
    (item) => item.id === id
  );

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  if (!profile.slug) {
    throw new Error("A instalação não possui uma pasta identificada.");
  }

  const gameRoot = path.resolve(getGameRoot());

  const folderName = String(profile.slug)
    .replace(/[^a-z0-9_-]/gi, "_")
    .toLowerCase();

  const profileFolder = path.resolve(gameRoot, folderName);

  if (path.dirname(profileFolder) !== gameRoot) {
    throw new Error("Caminho da instalação inválido.");
  }

  await fs.promises.rm(profileFolder, {
    recursive: true,
    force: true
  });

  const remaining = settings.profiles.filter(
    (item) => item.id !== id
  );

  saveSettings({ profiles: remaining });

  return { success: true };
});

ipcMain.handle("open-game-folder", async () => {
  const gameFolder = getGameRoot();

  await fs.promises.mkdir(gameFolder, { recursive: true });

  const error = await shell.openPath(gameFolder);

  if (error) {
    throw new Error(`Não foi possível abrir a pasta: ${error}`);
  }

  return { success: true };
});

// ==================================================
// VALIDAÇÃO DO JAVA
// ==================================================

ipcMain.handle("validate-java", (_event, javaPath) => {
  if (typeof javaPath !== "string" || !path.isAbsolute(javaPath)) {
    throw new Error("Seleciona um caminho absoluto para o Java.");
  }

  if (!fs.existsSync(javaPath) || !fs.statSync(javaPath).isFile()) {
    throw new Error("O arquivo Java selecionado não existe.");
  }

  const expectedExecutable =
    process.platform === "win32" ? "java.exe" : "java";

  if (path.basename(javaPath).toLowerCase() !== expectedExecutable) {
    throw new Error(`Seleciona o executável ${expectedExecutable}.`);
  }

  return { valid: true, path: javaPath };
});

// ==================================================
// INSTALAÇÃO E INICIALIZAÇÃO DO MINECRAFT
// ==================================================

ipcMain.handle("install-and-launch", async (_event, selection) => {
  if (!currentAccount) {
    throw new Error("Entre com sua conta Microsoft antes de jogar.");
  }

  if (isLaunching) {
    throw new Error("O Minecraft já está sendo iniciado.");
  }

  const settings = loadSettings();
  let profile;

  if (typeof selection === "string") {
    if (!(await isMinecraftVersionAvailable(selection))) {
  throw new Error("A versão selecionada não é válida.");
}

    profile = {
      id: `legacy-${selection}`,
      name: `Minecraft ${selection}`,
      slug: `legacy-${selection.replace(/\./g, "-")}`,
      minecraftVersion: selection,
      loader: "vanilla",
      loaderVersion: "",
      maxRam: DEFAULT_RAM,
      javaMode: "auto",
      javaPath: ""
    };
  } else {
    profile = settings.profiles.find(
      (item) => item.id === selection?.profileId
    );

    if (!profile) {
      throw new Error("Seleciona um perfil válido.");
    }
  }

  if (!(await isMinecraftVersionAvailable(profile.minecraftVersion))) {
  throw new Error("A versão deste perfil não existe no catálogo oficial.");
}

  if (!LOADERS.includes(profile.loader)) {
    throw new Error("O loader deste perfil não é válido.");
  }

  if (profile.loader !== "vanilla" && !profile.loaderVersion) {
    throw new Error("Configura a versão do loader antes de jogar.");
  }

  if (
    !Number.isInteger(profile.maxRam) ||
    profile.maxRam < 1024 ||
    profile.maxRam > MAX_RAM_LIMIT
  ) {
    throw new Error("A RAM máxima deste perfil não é válida.");
  }

  if (profile.javaMode === "manual") {
    if (
      !path.isAbsolute(profile.javaPath) ||
      !fs.existsSync(profile.javaPath) ||
      !fs.statSync(profile.javaPath).isFile()
    ) {
      throw new Error("O caminho do Java deste perfil não é válido.");
    }
  }

  isLaunching = true;

  // O rastreador é exclusivo para cada inicialização.
  const downloadTracker = createDownloadTracker();

  try {
    sendProgress("preparing", "preparing");

    const loaderConfig = profile.loader === "vanilla"
      ? { loader: "vanilla" }
      : {
          loader: profile.loader,
          version: profile.loaderVersion
        };

    const launcher = new Launcher({
      root: ROOT_NAME,
      storage: "isolated",
      profile: {
        slug: profile.slug,
        minecraft: {
          version: profile.minecraftVersion,
          loader: loaderConfig
        }
      },
      account: currentAccount,
      cleaning: {
        enabled: false
      },
      java: profile.javaMode === "manual"
        ? {
            install: "manual",
            absolutePath: profile.javaPath
          }
        : {
            install: "auto"
          },
      memory: {
        min: MIN_RAM,
        max: profile.maxRam
      }
    });

    // Verificação dos arquivos necessários.
    launcher.on("launch_compute_download", () => {
      sendProgress(
        "checking",
        "Verificando os arquivos do Minecraft..."
      );
    });

    // O evento contém o total global dos arquivos desta instalação.
    launcher.on("launch_download", (data) => {
      downloadTracker.active = true;
      downloadTracker.totalBytes = Math.max(
        0,
        Number(data?.total?.size) || 0
      );
      downloadTracker.totalFiles = Math.max(
        0,
        Number(data?.total?.amount) || 0
      );

      downloadTracker.completedBytes = 0;
      downloadTracker.completedFiles = 0;
      downloadTracker.currentBatchBytes = 0;
      downloadTracker.currentBatchFiles = 0;
      downloadTracker.lastPercent = 0;
      downloadTracker.completedBatches = 0;

      const progress = getTrackedProgress(downloadTracker);

      sendProgress(
        "downloading",
        downloadTracker.totalFiles > 0
  ? `preparing-download:${downloadTracker.totalFiles}`
  : "preparing-download",
      );
    });

    // Progresso real dos bytes recebidos.
    launcher.on("download_progress", (data) => {
      if (!downloadTracker.active) return;

      const progress = getTrackedProgress(downloadTracker, data);

      const speedText = progress.speed > 0
        ? ` • ${formatBytes(progress.speed)}/s`
        : "";

      sendProgress(
        "downloading",
        "download-progress",
  {
    ...progress,
    speedText
  }
);
    });

    // Cada download_end marca o fim de um grupo.
    // O downloader reinicia seus contadores para o grupo seguinte.
    launcher.on("download_end", (data) => {
      if (!downloadTracker.active) return;

      const progress = finishDownloadBatch(downloadTracker, data);

      if (!progress) return;

      sendProgress(
        "downloading",
        progress.percent >= 100
          ? "Downloads concluídos!"
          : `Grupo de downloads concluído: ${progress.percent}%`,
        progress
      );
    });

    launcher.on("download_error", (data) => {
      console.error("[Download] Falha:", data);

      sendProgress(
        "downloading",
        `Falha ao baixar um arquivo${data?.filename ? `: ${data.filename}` : "."}`,
        {
          filename: data?.filename || "",
          downloadError: data?.message || "Erro desconhecido."
        }
      );
    });

    // O evento real possui a estrutura:
    // { version, loader: { loader, version } }
    launcher.on("launch_install_loader", (data) => {
      const loaderName =
        data?.loader?.loader ||
        (typeof data?.loader === "string" ? data.loader : null) ||
        profile.loader;

      const loaderVersion =
        data?.loader?.version ||
        data?.version ||
        profile.loaderVersion;

      sendProgress(
        "installing",
        `Instalando ${loaderName} ${loaderVersion || ""}...`.trim(),
        {
          loader: loaderName,
          loaderVersion
        }
      );
    });

    launcher.on("launch_check_java", () => {
      sendProgress(
        "java",
        "Verificando e preparando o Java..."
      );
    });

    launcher.on("launch_launch", (data) => {
      sendProgress(
        "started",
        "Minecraft iniciado! Bom jogo!",
        {
          version: data?.version || profile.minecraftVersion,
          loader: data?.loader || profile.loader,
          loaderVersion: data?.loaderVersion || profile.loaderVersion
        }
      );
    });

    launcher.on("launch_close", (exitCode) => {
      isLaunching = false;

      sendProgress(
        "closed",
        exitCode === 0
          ? "O Minecraft foi fechado."
          : `O Minecraft foi fechado com código ${exitCode}.`,
        {
          exitCode
        }
      );
    });

    launcher.on("launch_crash", (data) => {
      isLaunching = false;

      sendProgress(
        "error",
        "O Minecraft fechou inesperadamente.",
        {
          exitCode: data?.exitCode ?? null,
          crashData: data?.crashData ?? null
        }
      );
    });

    await launcher.launch();

    return { success: true };
  } catch (error) {
    isLaunching = false;

    console.error("[Minecraft] Falha ao iniciar:", error);

    sendProgress(
      "error",
      `Erro ao iniciar o Minecraft: ${error.message || "Erro desconhecido."}`
    );

    throw new Error(
      error.message || "Não foi possível iniciar o Minecraft."
    );
  }
});

// ==================================================
// EVENTOS DO ELECTRON
// ==================================================

app.whenReady().then(() => {
  createWindow();

  // Atualizações automáticas somente na versão instalada.
  if (app.isPackaged) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on("checking-for-update", () => {
      mainWindow?.webContents.send("update-status", {
        status: "checking"
      });
    });

    autoUpdater.on("update-available", (info) => {
      mainWindow?.webContents.send("update-status", {
        status: "available",
        version: info.version
      });
    });

    autoUpdater.on("update-not-available", (info) => {
      mainWindow?.webContents.send("update-status", {
        status: "not-available",
        version: info.version
      });
    });

    autoUpdater.on("download-progress", (progress) => {
      mainWindow?.webContents.send("update-status", {
        status: "downloading",
        percent: progress.percent
      });
    });

    autoUpdater.on("update-downloaded", (info) => {
      mainWindow?.webContents.send("update-status", {
        status: "downloaded",
        version: info.version
      });
    });

    autoUpdater.on("error", (error) => {
      console.error("[Atualizações] Erro:", error);

      mainWindow?.webContents.send("update-status", {
        status: "error",
        message: error.message
      });
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});