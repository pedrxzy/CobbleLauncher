"use strict";

const { app, BrowserWindow, ipcMain, safeStorage, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { MicrosoftAuth, Launcher, Skin } = require("eml-lib");
const AdmZip = require("adm-zip");

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
let isLaunching = false;

const ROOT_NAME = "CobbleLauncher";
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
    javaPath
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

    const params = new URLSearchParams();
    params.set("query", query);

    if (input.gameVersion) {
      params.set("gameVersion", String(input.gameVersion));
    }

    if (input.loader) {
      params.set("loader", String(input.loader).toLowerCase());
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
  // EML usa uma pasta isolada para cada slug de perfil.
  return path.join(
    app.getPath("appData"),
    `.${ROOT_NAME}`,
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
      `"${modName}" parece já estar instalado neste perfil. Verifique os mods instalados antes de tentar novamente.`
    );
  }

  const destination = path.join(modsDirectory, filename);

  if (fs.existsSync(destination)) {
    throw new Error(
      `Já existe um arquivo chamado "${filename}" na pasta de mods.`
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
  project.title
);

const destination = resolveInside(modsDirectory, file.filename);

await downloadVerifiedFile(
  file.url,
  destination,
  file.hashes || {}
);

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


async function installCurseForgeMod(input) {
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

  const modId = Number(input.modId);

  if (!Number.isSafeInteger(modId) || modId <= 0) {
    throw new Error("Identificador do mod inválido.");
  }

  const params = new URLSearchParams({
    modId: String(modId),
    gameVersion: profile.minecraftVersion,
    loader: profile.loader
  });

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

const file = result.data.find(
  (item) =>
    item.downloadUrl &&
    item.fileName &&
    path.basename(item.fileName) === item.fileName &&
    Array.isArray(item.gameVersions) &&
    item.gameVersions.includes(profile.minecraftVersion)
);

  if (!file) {
    throw new Error(
      "Não foi encontrado um arquivo compatível com esta instalação."
    );
  }

  const modsDirectory = path.join(
    getInstanceDirectory(profile),
    "mods"
  );

checkDuplicateMod(
  modsDirectory,
  `curseforge-${modId}`,
  file.fileName,
  file.displayName,
  file.hashes || {}
);

const destination = resolveInside(modsDirectory, file.fileName);

await downloadVerifiedFile(
  file.downloadUrl,
  destination,
  file.hashes || {}
);

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

    const profile = normalizeProfile({
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

  const gameRoot = path.resolve(
    app.getPath("appData"),
    ".cobblelauncher"
  );

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
  const gameFolder = path.join(
    app.getPath("appData"),
    ".cobblelauncher"
  );

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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});