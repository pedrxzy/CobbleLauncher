
# CobbleLauncher

**Your Minecraft. Your way.**

A modern, independent Minecraft Java Edition launcher developed by **Zavira Studios**, designed to deliver a simple, customizable and integrated Minecraft experience.

![Version](https://img.shields.io/badge/Stable-1.2.0-brightgreen?style=flat-square)
![Windows](https://img.shields.io/badge/Windows-Supported-0078D6?style=flat-square&logo=windows)
![Linux](https://img.shields.io/badge/Linux-Supported-FCC624?style=flat-square&logo=linux&logoColor=black)
![Modrinth](https://img.shields.io/badge/Modrinth-Integrated-1BD96A?style=flat-square&logo=modrinth&logoColor=white)
![CurseForge](https://img.shields.io/badge/CurseForge-Integrated-F16436?style=flat-square&logo=curseforge&logoColor=white)

> [!IMPORTANT]
> ## CobbleLauncher 2.0 — The Rust Rewrite
>
> We are working on the next generation of CobbleLauncher.
>
> CobbleLauncher 2.0 is a major architectural rewrite that will replace Electron and Node.js with Tauri and a Rust-powered backend.
>
> Our goal is to deliver a faster, lighter and more efficient Minecraft launcher while preserving its visual identity, simplicity and existing functionality.
>
> The current Electron-based version remains available during development.
>
> **Development status:** In development  
> **Release date:** To be announced.

---

## CobbleLauncher 2.0

![Rust](https://img.shields.io/badge/Rust-Backend-000000?style=flat-square&logo=rust)
![Tauri](https://img.shields.io/badge/Tauri-Framework-24C8DB?style=flat-square&logo=tauri&logoColor=white)
![Development](https://img.shields.io/badge/2.0-In_Development-orange?style=flat-square)

### Our Goals

- Replace Electron with Tauri.
- Introduce a Rust-powered backend.
- Reduce memory consumption.
- Reduce application and installer sizes.
- Improve startup times.
- Improve download and file management efficiency.
- Improve security and reliability.
- Preserve the existing visual identity.
- Maintain compatibility with existing Minecraft installations and user data.
- Continue supporting Windows and Linux.

### Development Roadmap

- [x] Tauri project architecture.
- [x] Rust backend implementation.
- [x] User interface migration.
- [ ] Microsoft authentication.
- [ ] Minecraft installation and execution.
- [x] Java management.
- [ ] Mod loader integration.
- [ ] Modrinth integration.
- [ ] CurseForge integration.
- [ ] Content management.
- [x] Migration from previous versions.
- [x] Automatic update system.
- [ ] Multiplatform testing.
- [ ] Public beta.
- [ ] CobbleLauncher 2.0 stable release.

The roadmap is subject to change throughout development.

---

## Features

The following features are available in the current stable version of CobbleLauncher.

### Minecraft Management

- Microsoft account authentication.
- Independent Minecraft installations.
- Support for multiple Minecraft versions.
- Automatic Java detection and installation.
- Custom Java executable paths.
- Custom RAM allocation.
- Skin and cape management.
- Automatic launcher updates.

### Supported Mod Loaders

| Mod Loader | Support |
|---|---|
| Vanilla | Supported |
| Fabric | Supported |
| Forge | Supported |
| NeoForge | Supported |
| Quilt | Supported |

### Content Management

Discover, download and manage Minecraft content directly from CobbleLauncher through its integrated Modrinth and CurseForge platforms.

Supported content types:

- Mods.
- Modpacks.
- Resource packs.
- Datapacks.
- Shaders.

Additional management features:

- Enable, disable and remove installed content.
- Automatic duplicate detection.
- Independent modpack installations.
- Manual download support for restricted CurseForge files.
- File integrity verification.

### Supported Languages

| Language | Availability |
|---|---|
| English | Available |
| Português (Brasil) | Available |
| Español | Available |

---

## Download

**Current stable version: 1.2.0**

CobbleLauncher is currently available for Windows and Linux.

| Platform | Architecture | Package |
|---|---|---|
| Windows | x64 | EXE Installer |
| Linux | x86_64 | AppImage |
| Debian / Ubuntu | AMD64 | DEB Package |

[![Download](https://img.shields.io/badge/Download-Latest_Release-2EA44F?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pedrxzy/CobbleLauncher/releases/latest)

> [!NOTE]
> The currently available stable release is based on Electron. CobbleLauncher 2.0, powered by Rust and Tauri, is still in development.

---

## Installation

### Windows

1. Download the latest EXE installer from the GitHub Releases page.
2. Run the installer.
3. Follow the installation instructions.
4. Launch CobbleLauncher from the Start menu.

### Linux — AppImage

Download the AppImage from the GitHub Releases page.

Make the file executable:

```bash
chmod +x CobbleLauncher-1.2.0-x86_64.AppImage
```

Launch CobbleLauncher:

```bash
./CobbleLauncher-1.2.0-x86_64.AppImage
```

### Linux — Debian and Ubuntu

Download the DEB package and install it using:

```bash
sudo apt install ./CobbleLauncher-1.2.0-amd64.deb
```

Once installed, CobbleLauncher will be available from your application menu.

---

## Development

CobbleLauncher is currently transitioning to a new architecture.

### Current Architecture — 1.x

The current stable version is built using:

- Electron
- Node.js
- JavaScript
- HTML
- CSS
- EML Lib
- Electron Builder
- Cloudflare Workers

### Next-Generation Architecture — 2.0

The new architecture is planned around:

- Rust
- Tauri
- HTML
- CSS
- JavaScript
- Platform-native WebView
- Cloudflare Workers

The new Rust backend will be responsible for Minecraft management, authentication, downloads, file operations and content management.

### Architecture Transition

| Component | CobbleLauncher 1.x | CobbleLauncher 2.0 |
|---|---|---|
| Application framework | Electron | Tauri |
| Backend | Node.js | Rust |
| User interface | HTML, CSS, JavaScript | HTML, CSS, JavaScript |
| Rendering engine | Bundled Chromium | System WebView |
| Development status | Stable | In development |

---

## Running from Source

The following instructions apply to the current Electron-based version.

### Prerequisites

- Git
- Node.js
- npm

### Clone the Repository

```bash
git clone https://github.com/pedrxzy/CobbleLauncher.git
cd CobbleLauncher
```

### Install Dependencies

```bash
npm ci
```

### Start the Launcher

```bash
npm start
```

---

## Building

The following build commands apply to the current Electron-based architecture.

### Windows

```bash
npm run dist:win
```

### Linux — AppImage

```bash
npm run dist:linux
```

### Linux — DEB

```bash
npm run dist:deb
```

Build instructions for CobbleLauncher 2.0 will be provided as the Rust and Tauri architecture progresses.

---

## Feedback and Bug Reports

Feedback helps us improve CobbleLauncher.

If you encounter a bug, experience a technical issue or have a feature suggestion, please open an issue on GitHub.

[![GitHub Issues](https://img.shields.io/badge/GitHub-Open_an_Issue-181717?style=flat-square&logo=github)](https://github.com/pedrxzy/CobbleLauncher/issues)

When reporting a bug, please include:

- Your operating system.
- CobbleLauncher version.
- A description of the issue.
- Steps to reproduce the issue.
- Relevant logs or screenshots, if available.

Never include passwords, authentication tokens or other sensitive information in public bug reports.

---

## Disclaimer

CobbleLauncher is an independent third-party Minecraft Java Edition launcher.

CobbleLauncher and Zavira Studios are not affiliated with, endorsed by or officially associated with Mojang Studios, Microsoft, Modrinth or CurseForge.

A valid Minecraft Java Edition license is required to play.

All respective trademarks, services and third-party content belong to their respective owners.

---

## Credits

Developed and maintained by **Zavira Studios**.

---

<div align="center">

**CobbleLauncher**

*Your Minecraft. Your way.*

Built for players. Designed for freedom.

© 2026 Zavira Studios. All rights reserved.

</div>
