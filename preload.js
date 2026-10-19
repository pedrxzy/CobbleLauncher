"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cobble", {
  loginMicrosoft: () => ipcRenderer.invoke("login-microsoft"),
  restoreSession: () => ipcRenderer.invoke("restore-session"),
  logoutMicrosoft: () => ipcRenderer.invoke("logout-microsoft"),

  installAndLaunch: (selection) =>
    ipcRenderer.invoke("install-and-launch", selection),

  getProfiles: () => ipcRenderer.invoke("get-profiles"),

getLoaderVersions: (minecraftVersion, loader) =>
  ipcRenderer.invoke("get-loader-versions", {
    minecraftVersion,
    loader
  }),

  saveProfile: (profile) =>
    ipcRenderer.invoke("save-profile", profile),

  deleteProfile: (id) =>
    ipcRenderer.invoke("delete-profile", id),

  validateJava: (javaPath) =>
    ipcRenderer.invoke("validate-java", javaPath),

  onLaunchProgress: (callback) => {
    ipcRenderer.on("launch-progress", (_event, message) => {
      callback(message);
    });
  }
});