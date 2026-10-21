"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cobble", {
  loginMicrosoft: () => ipcRenderer.invoke("login-microsoft"),
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

  getLoaderVersions: (minecraftVersion, loader) =>
    ipcRenderer.invoke("get-loader-versions", {
      minecraftVersion,
      loader
    }),

  searchMods: (input) =>
    ipcRenderer.invoke("modrinth-search", input),

  getModVersions: (input) =>
    ipcRenderer.invoke("modrinth-versions", input),

  installModrinthContent: (input) =>
    ipcRenderer.invoke("install-modrinth-content", input),

  saveProfile: (profile) =>
    ipcRenderer.invoke("save-profile", profile),

  deleteProfile: (id) =>
    ipcRenderer.invoke("delete-profile", id),

  validateJava: (javaPath) =>
    ipcRenderer.invoke("validate-java", javaPath),

  saveSkin: (input) =>
    ipcRenderer.invoke("save-skin", input),

  getSavedSkins: () =>
    ipcRenderer.invoke("get-saved-skins"),

  onLaunchProgress: (callback) => {
    ipcRenderer.on("launch-progress", (_event, message) => {
      callback(message);
    });
  }
});