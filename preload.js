"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cobble", {
  checkForUpdates: () =>
  ipcRenderer.invoke("check-for-updates"),

onManualDownloadRequired: (callback) => {
  const listener = (_event, data) => callback(data);

  ipcRenderer.on("manual-download-required", listener);

  return () => {
    ipcRenderer.removeListener(
      "manual-download-required",
      listener
    );
  };
},

openManualDownload: (requestId) =>
  ipcRenderer.invoke("manual-download-open", requestId),

selectManualDownload: (requestId) =>
  ipcRenderer.invoke("manual-download-select", requestId),

cancelManualDownload: (requestId) =>
  ipcRenderer.invoke("manual-download-cancel", requestId),

getProfileWorlds: (profileId) =>
  ipcRenderer.invoke("get-profile-worlds", profileId),

getInstalledContent: (input) =>
  ipcRenderer.invoke("get-installed-content", input),

downloadUpdate: () =>
  ipcRenderer.invoke("download-update"),

installUpdate: () =>
  ipcRenderer.invoke("install-update"),

toggleInstalledContent: (input) =>
  ipcRenderer.invoke("toggle-installed-content", input),

removeInstalledContent: (input) =>
  ipcRenderer.invoke("remove-installed-content", input),

onUpdateStatus: (callback) => {
  const listener = (_event, data) => callback(data);

  ipcRenderer.on("update-status", listener);

  return () => {
    ipcRenderer.removeListener("update-status", listener);
  };
},

  getLanguage: () =>
    ipcRenderer.invoke("get-language"),
  setLanguage: (language) =>
    ipcRenderer.send("set-language", language),
  
  loginMicrosoft: () => ipcRenderer.invoke("login-microsoft"),
  getAccountSkin: () => ipcRenderer.invoke("get-account-skin"),
  getAccountCapes: () =>
    ipcRenderer.invoke("get-account-capes"),

switchAccountCape: (capeId) =>
  ipcRenderer.invoke("switch-account-cape", capeId),

hideAccountCape: () =>
  ipcRenderer.invoke("hide-account-cape"),
  updateAccountSkin: (input) =>
  ipcRenderer.invoke("update-account-skin", input),
  restoreSession: () => ipcRenderer.invoke("restore-session"),
  logoutMicrosoft: () => ipcRenderer.invoke("logout-microsoft"),

  getInstalledMods: (profileId) =>
   ipcRenderer.invoke("get-installed-mods", profileId),

  toggleInstalledMod: (input) =>
   ipcRenderer.invoke("toggle-installed-mod", input),

  removeInstalledMod: (input) =>
   ipcRenderer.invoke("remove-installed-mod", input),

  installAndLaunch: (selection) =>
    ipcRenderer.invoke("install-and-launch", selection),

  getProfiles: () => ipcRenderer.invoke("get-profiles"),

  getMinecraftVersions: () =>
    ipcRenderer.invoke("get-minecraft-versions"),

  getLoaderVersions: (minecraftVersion, loader) =>
    ipcRenderer.invoke("get-loader-versions", {
      minecraftVersion,
      loader
    }),

  searchMods: (input) =>
    ipcRenderer.invoke("modrinth-search", input),

  searchCurseForgeMods: (input) =>
    ipcRenderer.invoke("curseforge-search", input),

  getCurseForgeFiles: (input) =>
    ipcRenderer.invoke("curseforge-files", input),

  installCurseForgeMod: (input) =>
    ipcRenderer.invoke("install-curseforge-mod", input),

  getModVersions: (input) =>
    ipcRenderer.invoke("modrinth-versions", input),

  installModrinthContent: (input) =>
    ipcRenderer.invoke("install-modrinth-content", input),

  saveProfile: (profile) =>
    ipcRenderer.invoke("save-profile", profile),

  deleteProfile: (id) =>
    ipcRenderer.invoke("delete-profile", id),

  openGameFolder: () =>
  ipcRenderer.invoke("open-game-folder"),

  validateJava: (javaPath) =>
    ipcRenderer.invoke("validate-java", javaPath),

  saveSkin: (input) =>
    ipcRenderer.invoke("save-skin", input),

  getSavedSkins: () =>
    ipcRenderer.invoke("get-saved-skins"),

  setSkinModel: (input) =>
    ipcRenderer.invoke("set-skin-model", input),

  deleteSkin: (name) =>
    ipcRenderer.invoke("delete-skin", name),

  renameSkin: (input) => ipcRenderer.invoke("rename-skin", input),

  onLaunchProgress: (callback) => {
    ipcRenderer.on("launch-progress", (_event, message) => {
      callback(message);
    });
  }
});