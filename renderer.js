"use strict";

// ==================================================
// COBBLELAUNCHER - INTERFACE
// ==================================================

const $ = (id) => document.getElementById(id);

// Inicialização e progresso
const playButton = $("play");
const statusText = $("status");
const launchProgress = $("launch-progress");
const progressLabel = $("progress-label");
const progressPercent = $("progress-percent");
const progressTrack = $("progress-track");
const progressFill = $("progress-fill");

// Conta Microsoft
const accountButton =
  $("account-button") || document.querySelector(".account");
const accountAvatar = $("account-avatar");
const accountName = $("account-name");
const logoutButton = $("logout-button");

// Instalações
const homeProfile = $("home-profile");
const modsProfile = $("mods-profile");
const settingsProfile = $("settings-profile");

const profileForm = $("profile-form");
const profileId = $("profile-id");
const profileName = $("profile-name");
const profileVersion = $("profile-version");
const profileLoader = $("profile-loader");
const profileLoaderVersion = $("profile-loader-version");
const loaderVersionGroup = $("loader-version-group");
const profilesList = $("profiles-list");
const saveProfileButton = $("save-profile");
const cancelProfileButton = $("cancel-profile");

// Configurações
const settingsForm = $("settings-form");
const maxRamInput = $("max-ram");
const javaMode = $("java-mode");
const javaPath = $("java-path");
const javaPathGroup = $("java-path-group");
const javaStatus = $("java-status");
const validateJavaButton = $("validate-java");
const modsInfo = $("mods-info");

// Estado da aplicação
let loggedIn = false;
let loginInProgress = false;
let launchInProgress = false;
let gameStarted = false;
let profiles = [];
let validatedJavaPath = "";
let loaderVersionsRequest = 0;

// ==================================================
// UTILITÁRIOS
// ==================================================

function setStatus(message) {
  if (statusText) {
    statusText.textContent = String(message ?? "");
  }
}

function showMessage(message, type = "info") {
  const box = document.createElement("p");
  box.className = `hint ${type}`;
  box.textContent = message;
  return box;
}

function friendlyError(error) {
  return error?.message || "Ocorreu um erro inesperado.";
}

function getProfile(id) {
  return profiles.find((profile) => profile.id === id);
}

function getSelectedProfile() {
  return getProfile(homeProfile?.value);
}

function setLaunchButtonState(disabled, text) {
  if (!playButton) return;

  playButton.disabled = disabled;

  if (text) {
    playButton.innerHTML = text;
  }
}

function setLoggedOut() {
  loggedIn = false;

  if (accountName) {
    accountName.textContent = "Entrar com Microsoft";
  }

  if (accountAvatar) {
    accountAvatar.hidden = true;
    accountAvatar.removeAttribute("src");
  }

  if (logoutButton) {
    logoutButton.hidden = true;
  }
}

function setAccount(account) {
  if (!account?.name) {
    throw new Error("A conta Microsoft não retornou um nome válido.");
  }

  loggedIn = true;

  if (accountName) {
    accountName.textContent = account.name;
  }

  if (logoutButton) {
    logoutButton.hidden = false;
  }

  if (accountAvatar) {
    accountAvatar.hidden = true;
    accountAvatar.removeAttribute("src");

    if (account.uuid) {
      const uuid = account.uuid.replace(/-/g, "");

      accountAvatar.onload = () => {
        accountAvatar.hidden = false;
      };

      accountAvatar.onerror = () => {
        accountAvatar.hidden = true;
      };

      accountAvatar.src =
        `https://mc-heads.net/avatar/${encodeURIComponent(uuid)}/64`;
    }
  }

  setStatus("Conta conectada! Pode jogar.");
}

// ==================================================
// BARRA DE PROGRESSO
// ==================================================

function updateLaunchProgress(message, options = {}) {
  if (!launchProgress) return;

  const isObject = typeof message === "object" && message !== null;

  const text = isObject
    ? String(message.message || "Preparando Minecraft...")
    : String(message ?? "Preparando Minecraft...");

  const stage = isObject
    ? String(message.stage || "")
    : String(options.stage || "");

  const rawPercent = isObject
    ? message.percent
    : options.percent;

  const percent = Number(rawPercent);

  const hasPercent =
    rawPercent !== undefined &&
    rawPercent !== null &&
    rawPercent !== "" &&
    Number.isFinite(percent) &&
    percent >= 0 &&
    percent <= 100;

  const isComplete =
    stage === "started" ||
    text.startsWith("Minecraft iniciado!") ||
    text === "Minecraft iniciado com sucesso!";

  const isError =
    stage === "error" ||
    /^erro\b/i.test(text) ||
    text.startsWith("O Minecraft fechou inesperadamente.");

  launchProgress.hidden = false;

  launchProgress.classList.remove(
    "complete",
    "error",
    "indeterminate"
  );

  if (progressLabel) {
    progressLabel.textContent = text;
  }

  if (hasPercent) {
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressPercent) {
      progressPercent.textContent = `${Math.round(percent)}%`;
    }

    if (progressTrack) {
      progressTrack.setAttribute(
        "aria-valuenow",
        String(Math.round(percent))
      );

      progressTrack.setAttribute(
        "aria-valuetext",
        `${Math.round(percent)}% concluído`
      );
    }
  } else {
    if (progressFill) {
      progressFill.style.width = "35%";
    }

    if (progressPercent) {
      progressPercent.textContent = "";
    }

    if (progressTrack) {
      progressTrack.removeAttribute("aria-valuenow");
      progressTrack.setAttribute("aria-valuetext", text);
    }

    if (!isComplete && !isError) {
      launchProgress.classList.add("indeterminate");
    }
  }

  if (isComplete) {
    launchProgress.classList.remove("indeterminate");
    launchProgress.classList.add("complete");

    if (progressFill) {
      progressFill.style.width = "100%";
    }

    if (progressPercent) {
      progressPercent.textContent = "Concluído";
    }

    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", "100");
      progressTrack.setAttribute(
        "aria-valuetext",
        "Inicialização concluída"
      );
    }
  } else if (isError) {
    launchProgress.classList.remove("indeterminate");
    launchProgress.classList.add("error");

    if (progressPercent) {
      progressPercent.textContent = "Falhou";
    }

    if (progressTrack) {
      progressTrack.removeAttribute("aria-valuenow");
      progressTrack.setAttribute("aria-valuetext", text);
    }
  }
}

function resetLaunchProgress() {
  if (!launchProgress) return;

  launchProgress.hidden = true;

  launchProgress.classList.remove(
    "complete",
    "error",
    "indeterminate"
  );

  if (progressLabel) {
    progressLabel.textContent = "Preparando Minecraft...";
  }

  if (progressPercent) {
    progressPercent.textContent = "";
  }

  if (progressFill) {
    progressFill.style.width = "0%";
  }

  if (progressTrack) {
    progressTrack.removeAttribute("aria-valuenow");
    progressTrack.setAttribute(
      "aria-valuetext",
      "Preparando Minecraft"
    );
  }
}

// ==================================================
// NAVEGAÇÃO
// ==================================================

function navigateTo(pageName) {
  document.querySelectorAll(".nav").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  document.querySelectorAll(".page").forEach((page) => {
    const isActive = page.id === `page-${pageName}`;

    page.classList.toggle("active", isActive);
    page.hidden = !isActive;
  });
}

document.querySelectorAll(".nav[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.page);
  });
});

document.querySelectorAll("[data-goto]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.goto);
  });
});

// ==================================================
// PERFIS / INSTALAÇÕES
// ==================================================

function populateProfileSelect(select, selectedId, emptyText) {
  if (!select) return;

  select.replaceChildren();

  if (profiles.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = emptyText;

    select.append(option);
    select.disabled = true;
    return;
  }

  select.disabled = false;

  for (const profile of profiles) {
    const option = document.createElement("option");

    option.value = profile.id;
    option.textContent =
      `${profile.name} — ${profile.minecraftVersion} (${profile.loader})`;

    select.append(option);
  }

  select.value = profiles.some(
    (profile) => profile.id === selectedId
  )
    ? selectedId
    : profiles[0].id;
}

function renderProfiles() {
  const previousHome = homeProfile?.value;
  const previousMods = modsProfile?.value;
  const previousSettings = settingsProfile?.value;

  populateProfileSelect(
    homeProfile,
    previousHome,
    "Cria uma instalação na tela Versões"
  );

  populateProfileSelect(
    modsProfile,
    previousMods,
    "Nenhuma instalação disponível"
  );

  populateProfileSelect(
    settingsProfile,
    previousSettings,
    "Nenhuma instalação disponível"
  );

  if (!profilesList) return;

  profilesList.replaceChildren();

  if (profiles.length === 0) {
    profilesList.append(
      showMessage(
        "Ainda não tens instalações. Cria uma acima para começar."
      )
    );

    updateModsInfo();
    return;
  }

  for (const profile of profiles) {
    const card = document.createElement("article");
    card.className = "profile-card";

    const details = document.createElement("div");
    details.className = "profile-details";

    const title = document.createElement("h3");
    title.textContent = profile.name;

    const description = document.createElement("p");
    description.textContent =
      `Minecraft ${profile.minecraftVersion} · ` +
      `${profile.loader === "vanilla" ? "Vanilla" : profile.loader} · ` +
      `RAM máxima: ${profile.maxRam} MB`;

    const javaDescription = document.createElement("p");
    javaDescription.className = "hint";
    javaDescription.textContent =
      profile.javaMode === "manual"
        ? "Java configurado manualmente"
        : "Java automático";

    details.append(title, description, javaDescription);

    const actions = document.createElement("div");
    actions.className = "profile-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-button";
    editButton.textContent = "Editar";

    editButton.addEventListener("click", () => {
      editProfile(profile.id);
    });

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "secondary-button";
    selectButton.textContent = "Selecionar";

    selectButton.addEventListener("click", () => {
      if (homeProfile) homeProfile.value = profile.id;
      if (modsProfile) modsProfile.value = profile.id;
      if (settingsProfile) settingsProfile.value = profile.id;

      updateModsInfo();
      loadProfileSettings();
      navigateTo("home");

      setStatus(`Instalação selecionada: ${profile.name}`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button";
    deleteButton.textContent = "Excluir";

    deleteButton.addEventListener("click", () => {
      deleteProfile(profile.id);
    });

    actions.append(editButton, selectButton, deleteButton);
    card.append(details, actions);
    profilesList.append(card);
  }

  updateModsInfo();
}

async function loadProfiles() {
  if (!window.cobble?.getProfiles) {
    if (profilesList) {
      profilesList.replaceChildren(
        showMessage(
          "A comunicação com o processo principal não está disponível.",
          "error"
        )
      );
    }

    return;
  }

  try {
    const result = await window.cobble.getProfiles();

    profiles = Array.isArray(result) ? result : [];
    renderProfiles();
  } catch (error) {
    console.error("[Perfis] Erro ao carregar:", error);

    if (profilesList) {
      profilesList.replaceChildren(
        showMessage(
          `Não foi possível carregar as instalações: ${friendlyError(error)}`,
          "error"
        )
      );
    }
  }
}

function resetProfileForm() {
  profileForm?.reset();

  if (profileId) profileId.value = "";
  if (profileLoader) profileLoader.value = "vanilla";
  if (profileVersion) profileVersion.value = "1.21.1";

  if (saveProfileButton) {
    saveProfileButton.textContent = "Criar instalação";
  }

  if (cancelProfileButton) {
    cancelProfileButton.hidden = true;
  }

  updateLoaderFields();
  loadLoaderVersions();
}

function editProfile(id) {
  const profile = getProfile(id);
  if (!profile) return;

  profileId.value = profile.id;
  profileName.value = profile.name;
  profileVersion.value = profile.minecraftVersion;
  profileLoader.value = profile.loader;
  profileLoaderVersion.value = profile.loaderVersion || "";

  updateLoaderFields();
  loadLoaderVersions(profile.loaderVersion || "");

  saveProfileButton.textContent = "Salvar alterações";
  cancelProfileButton.hidden = false;

  navigateTo("versions");
  profileName.focus();
}

async function deleteProfile(id) {
  const profile = getProfile(id);
  if (!profile) return;

  const confirmed = window.confirm(
    `Excluir a instalação "${profile.name}" da lista? ` +
    "Os arquivos do jogo não serão apagados automaticamente."
  );

  if (!confirmed) return;

  try {
    await window.cobble.deleteProfile(id);

    if (profileId?.value === id) {
      resetProfileForm();
    }

    await loadProfiles();

    setStatus(`Instalação "${profile.name}" removida da lista.`);
  } catch (error) {
    console.error("[Perfis] Erro ao excluir:", error);

    setStatus(
      `Não foi possível excluir: ${friendlyError(error)}`
    );
  }
}

// ==================================================
// VERSÕES DOS LOADERS
// ==================================================

function updateLoaderFields() {
  const needsVersion =
    Boolean(profileLoader && profileLoader.value !== "vanilla");

  if (loaderVersionGroup) {
    loaderVersionGroup.hidden = !needsVersion;
  }

  if (profileLoaderVersion) {
    profileLoaderVersion.required = needsVersion;
  }
}

async function loadLoaderVersions(preferredVersion = "") {
  if (!profileLoaderVersion || !profileLoader || !profileVersion) {
    return;
  }

  const loader = profileLoader.value;
  const minecraftVersion = profileVersion.value;
  const requestId = ++loaderVersionsRequest;

  profileLoaderVersion.replaceChildren();

  if (loader === "vanilla") {
    profileLoaderVersion.add(new Option("Não se aplica", ""));
    profileLoaderVersion.required = false;
    return;
  }

  profileLoaderVersion.required = true;

  profileLoaderVersion.add(
    new Option("Carregando versões...", "")
  );

  if (!window.cobble?.getLoaderVersions) {
    profileLoaderVersion.replaceChildren(
      new Option("API de versões indisponível", "")
    );

    return;
  }

  try {
    const versions = await window.cobble.getLoaderVersions(
      minecraftVersion,
      loader
    );

    if (requestId !== loaderVersionsRequest) return;

    profileLoaderVersion.replaceChildren();

    if (!Array.isArray(versions) || versions.length === 0) {
      profileLoaderVersion.add(
        new Option("Nenhuma versão encontrada", "")
      );

      return;
    }

    for (const version of versions) {
      profileLoaderVersion.add(new Option(version, version));
    }

    profileLoaderVersion.value =
      preferredVersion && versions.includes(preferredVersion)
        ? preferredVersion
        : versions[0];
  } catch (error) {
    if (requestId !== loaderVersionsRequest) return;

    console.error("[Versões do loader]", error);

    profileLoaderVersion.replaceChildren(
      new Option("Erro ao carregar versões", "")
    );

    setStatus(friendlyError(error));
  }
}

profileLoader?.addEventListener("change", () => {
  updateLoaderFields();
  loadLoaderVersions();
});

profileVersion?.addEventListener("change", () => {
  loadLoaderVersions();
});

cancelProfileButton?.addEventListener("click", resetProfileForm);

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!window.cobble?.saveProfile) {
    setStatus(
      "A função de salvar instalações não está disponível."
    );

    return;
  }

  const current = getProfile(profileId.value);

  const data = {
    id: profileId.value || undefined,
    name: profileName.value.trim(),
    minecraftVersion: profileVersion.value,
    loader: profileLoader.value,
    loaderVersion: profileLoader.value === "vanilla"
      ? ""
      : profileLoaderVersion.value.trim(),
    maxRam: current?.maxRam ?? 4096,
    javaMode: current?.javaMode ?? "auto",
    javaPath: current?.javaPath ?? ""
  };

  saveProfileButton.disabled = true;

  try {
    const saved = await window.cobble.saveProfile(data);

    await loadProfiles();

    if (homeProfile) homeProfile.value = saved.id;
    if (modsProfile) modsProfile.value = saved.id;
    if (settingsProfile) settingsProfile.value = saved.id;

    resetProfileForm();

    setStatus(`Instalação "${saved.name}" salva.`);
  } catch (error) {
    console.error("[Perfis] Erro ao salvar:", error);

    setStatus(
      `Não foi possível salvar a instalação: ${friendlyError(error)}`
    );
  } finally {
    saveProfileButton.disabled = false;
  }
});

// ==================================================
// CONFIGURAÇÕES
// ==================================================

function loadProfileSettings() {
  const profile = getProfile(settingsProfile?.value);
  if (!profile) return;

  if (maxRamInput) {
    maxRamInput.value = profile.maxRam ?? 4096;
  }

  if (javaMode) {
    javaMode.value = profile.javaMode ?? "auto";
  }

  if (javaPath) {
    javaPath.value = profile.javaPath ?? "";
  }

  validatedJavaPath =
    profile.javaMode === "manual" ? profile.javaPath : "";

  if (javaStatus) {
    javaStatus.textContent = "";
  }

  updateJavaFields();
}

function updateJavaFields() {
  const manual = javaMode?.value === "manual";

  if (javaPathGroup) {
    javaPathGroup.hidden = !manual;
  }

  if (javaPath) {
    javaPath.required = manual;
  }
}

settingsProfile?.addEventListener("change", loadProfileSettings);
javaMode?.addEventListener("change", updateJavaFields);

validateJavaButton?.addEventListener("click", async () => {
  if (!window.cobble?.validateJava) {
    if (javaStatus) {
      javaStatus.textContent = "Validação de Java indisponível.";
    }

    return;
  }

  const candidate = javaPath.value.trim();

  validateJavaButton.disabled = true;

  if (javaStatus) {
    javaStatus.textContent = "Verificando caminho...";
  }

  try {
    const result = await window.cobble.validateJava(candidate);

    validatedJavaPath = result.path;

    if (javaStatus) {
      javaStatus.textContent = "Executável Java encontrado.";
    }
  } catch (error) {
    validatedJavaPath = "";

    if (javaStatus) {
      javaStatus.textContent = friendlyError(error);
    }
  } finally {
    validateJavaButton.disabled = false;
  }
});

settingsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const profile = getProfile(settingsProfile?.value);

  if (!profile) {
    setStatus("Cria ou seleciona uma instalação primeiro.");
    return;
  }

  const maxRam = Number(maxRamInput.value);

  if (
    !Number.isInteger(maxRam) ||
    maxRam < 1024 ||
    maxRam > 65536
  ) {
    setStatus("A RAM máxima deve ficar entre 1024 e 65536 MB.");
    return;
  }

  const mode = javaMode.value;
  const chosenPath = javaPath.value.trim();

  if (
    mode === "manual" &&
    (!chosenPath || chosenPath !== validatedJavaPath)
  ) {
    setStatus("Valida o caminho do Java antes de salvar.");
    return;
  }

  const updated = {
    ...profile,
    maxRam,
    javaMode: mode,
    javaPath: mode === "manual" ? chosenPath : ""
  };

  const button = $("save-settings");

  if (button) {
    button.disabled = true;
  }

  try {
    const saved = await window.cobble.saveProfile(updated);

    profiles = profiles.map((item) =>
      item.id === saved.id ? saved : item
    );

    renderProfiles();

    if (settingsProfile) {
      settingsProfile.value = saved.id;
    }

    loadProfileSettings();

    setStatus("Configurações salvas para esta instalação.");
  } catch (error) {
    console.error("[Configurações] Erro ao salvar:", error);

    setStatus(
      `Não foi possível salvar: ${friendlyError(error)}`
    );
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
});

// ==================================================
// MODS
// ==================================================

function updateModsInfo() {
  if (!modsInfo) return;

  const profile = getProfile(modsProfile?.value);

  if (!profile) {
    modsInfo.textContent =
      "Cria uma instalação na tela Versões para começar.";

    return;
  }

  if (profile.loader === "vanilla") {
    modsInfo.textContent =
      `"${profile.name}" usa Minecraft Vanilla. ` +
      "Edita a instalação e seleciona um loader para preparar o suporte a mods.";
  } else {
    modsInfo.textContent =
      `"${profile.name}" usa ${profile.loader} no Minecraft ` +
      `${profile.minecraftVersion}. A importação e a gestão dos mods ` +
      "serão adicionadas na próxima etapa.";
  }
}

modsProfile?.addEventListener("change", updateModsInfo);

// ==================================================
// LOGIN MICROSOFT
// ==================================================

accountButton?.addEventListener("click", async () => {
  if (loggedIn || loginInProgress) return;

  if (!window.cobble?.loginMicrosoft) {
    setStatus("Erro: comunicação com o launcher indisponível.");
    return;
  }

  loginInProgress = true;
  accountButton.disabled = true;

  setStatus("Abrindo o login Microsoft...");

  try {
    const account = await window.cobble.loginMicrosoft();
    setAccount(account);
  } catch (error) {
    console.error("[Login] Erro:", error);

    setLoggedOut();
    setStatus(friendlyError(error));
  } finally {
    loginInProgress = false;
    accountButton.disabled = false;
  }
});

logoutButton?.addEventListener("click", async () => {
  if (!window.cobble?.logoutMicrosoft) {
    setStatus("Não foi possível comunicar com o launcher.");
    return;
  }

  logoutButton.disabled = true;

  try {
    await window.cobble.logoutMicrosoft();

    setLoggedOut();
    setStatus("Você saiu da conta Microsoft.");
  } catch (error) {
    console.error("[Logout] Erro:", error);

    setStatus(friendlyError(error));
  } finally {
    logoutButton.disabled = false;
  }
});

async function restoreSession() {
  if (!window.cobble?.restoreSession) {
    setStatus("Entre com sua conta Microsoft para jogar.");
    return;
  }

  if (accountButton) {
    accountButton.disabled = true;
  }

  setStatus("Verificando conta salva...");

  try {
    const account = await window.cobble.restoreSession();

    if (account) {
      setAccount(account);
    } else {
      setLoggedOut();
      setStatus("Entre com sua conta Microsoft para jogar.");
    }
  } catch (error) {
    console.error("[Sessão] Erro ao restaurar:", error);

    setLoggedOut();
    setStatus("Entre com sua conta Microsoft para jogar.");
  } finally {
    if (accountButton) {
      accountButton.disabled = false;
    }
  }
}

// ==================================================
// INICIAR MINECRAFT
// ==================================================

playButton?.addEventListener("click", async () => {
  if (!loggedIn) {
    setStatus("Entre com sua conta Microsoft primeiro.");
    return;
  }

  if (launchInProgress || gameStarted) return;

  const profile = getSelectedProfile();

  if (!profile) {
    setStatus("Cria uma instalação na tela Versões primeiro.");
    navigateTo("versions");
    return;
  }

  if (!window.cobble?.installAndLaunch) {
    setStatus(
      "A função de inicialização não está disponível. Confere o preload.js."
    );

    return;
  }

  launchInProgress = true;
  gameStarted = false;

  resetLaunchProgress();

  playButton.disabled = true;

  setStatus(`Preparando ${profile.name}...`);

  updateLaunchProgress({
    stage: "preparing",
    message: `Preparando ${profile.name}...`
  });

  try {
    await window.cobble.installAndLaunch({
      profileId: profile.id
    });
  } catch (error) {
    console.error("[Minecraft] Erro ao iniciar:", error);

    const message = friendlyError(error);
    const progressMessage = `Erro ao iniciar o Minecraft: ${message}`;

    setStatus(progressMessage);

    updateLaunchProgress({
      stage: "error",
      message: progressMessage
    });
  } finally {
    launchInProgress = false;

    if (playButton) {
      playButton.disabled = gameStarted;
    }
  }
});

// ==================================================
// EVENTOS DE PROGRESSO DO PROCESSO PRINCIPAL
// ==================================================

if (window.cobble?.onLaunchProgress) {
  window.cobble.onLaunchProgress((message) => {
    const isObject =
      typeof message === "object" && message !== null;

    const text = isObject
      ? String(message.message || "Preparando Minecraft...")
      : String(message || "Preparando Minecraft...");

    const stage = isObject
      ? String(message.stage || "")
      : "";

    setStatus(text);
    updateLaunchProgress(message);

    if (
      stage === "started" ||
      text.startsWith("Minecraft iniciado!")
    ) {
      gameStarted = true;
      launchInProgress = false;

      if (playButton) {
        playButton.disabled = true;
      }

      return;
    }

    if (stage === "closed") {
      gameStarted = false;
      launchInProgress = false;

      if (playButton) {
        playButton.disabled = false;
      }

      resetLaunchProgress();
      return;
    }

    if (
      stage === "error" ||
      text.startsWith("O Minecraft fechou inesperadamente.") ||
      text.startsWith("Erro ao iniciar o Minecraft:")
    ) {
      gameStarted = false;
      launchInProgress = false;

      if (playButton) {
        playButton.disabled = false;
      }

      // Mantém a barra vermelha e a mensagem de erro visíveis.
      updateLaunchProgress({
        stage: "error",
        message: text
      });
    }
  });
}

// ==================================================
// INICIALIZAÇÃO
// ==================================================

async function initialize() {
  updateLoaderFields();
  updateJavaFields();

  await Promise.all([
    loadProfiles(),
    restoreSession()
  ]);

  loadProfileSettings();
  updateModsInfo();
}

initialize();