"use strict";

const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { MicrosoftAuth, Launcher } = require("eml-lib");

let mainWindow = null;
let currentAccount = null;
let isLaunching = false;

const ROOT_NAME = "CobbleLauncher";
const LOADERS = ["vanilla", "fabric", "forge", "neoforge", "quilt"];
const MIN_RAM = 512;
const DEFAULT_RAM = 4096;
const MAX_RAM_LIMIT = 65536;
const SUPPORTED_VERSIONS = ["1.21.1", "1.20.1"];

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

function normalizeProfile(input, existingProfiles = []) {
  if (!input || typeof input !== "object") {
    throw new Error("Dados do perfil inválidos.");
  }

  const name = String(input.name || "").trim();

  if (!name || name.length > 60) {
    throw new Error("O nome do perfil deve ter entre 1 e 60 caracteres.");
  }

  const minecraftVersion = String(input.minecraftVersion || "");

  if (!SUPPORTED_VERSIONS.includes(minecraftVersion)) {
    throw new Error("A versão do Minecraft selecionada não é suportada.");
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

  if (!SUPPORTED_VERSIONS.includes(minecraftVersion)) {
    throw new Error("Seleciona uma versão de Minecraft suportada.");
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

// ==================================================
// OPERAÇÕES DOS PERFIS
// ==================================================

ipcMain.handle("get-profiles", () => {
  return loadSettings().profiles;
});

ipcMain.handle("save-profile", (_event, input) => {
  const settings = loadSettings();
  const profile = normalizeProfile(input, settings.profiles);

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

ipcMain.handle("delete-profile", (_event, id) => {
  const settings = loadSettings();

  const remaining = settings.profiles.filter(
    (profile) => profile.id !== id
  );

  if (remaining.length === settings.profiles.length) {
    throw new Error("Perfil não encontrado.");
  }

  saveSettings({ profiles: remaining });
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
    if (!SUPPORTED_VERSIONS.includes(selection)) {
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

  if (!SUPPORTED_VERSIONS.includes(profile.minecraftVersion)) {
    throw new Error("A versão deste perfil não é suportada.");
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
    sendProgress("preparing", `Preparando ${profile.name}...`);

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
          ? `Preparando download: ${downloadTracker.totalFiles} arquivos...`
          : "Preparando o download do Minecraft...",
        progress
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
        `Baixando arquivos: ${progress.percent}% (${progress.downloadedText} de ${progress.totalText})${speedText}`,
        progress
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