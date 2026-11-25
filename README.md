# CobbleLauncher

**Your Minecraft. Your way.**

A modern, independent Minecraft Java Edition launcher developed by Zavira Studios, designed to provide a simple, customizable and integrated Minecraft experience.

![Version](https://img.shields.io/badge/version-1.2.0-brightgreen)
![Windows](https://img.shields.io/badge/Windows-Supported-0078D6)
![Linux](https://img.shields.io/badge/Linux-Supported-FCC624)
![Modrinth](https://img.shields.io/badge/Modrinth-Integrated-1BD96A)
![CurseForge](https://img.shields.io/badge/CurseForge-Integrated-F16436)

## Features

### Minecraft Management

- Microsoft account authentication.
- Independent Minecraft installations.
- Multiple Minecraft versions.
- Automatic Java detection and installation.
- Custom Java paths and RAM allocation.
- Skin and cape management.
- Automatic launcher updates.

### Supported Mod Loaders

- Vanilla
- Fabric
- Forge
- NeoForge
- Quilt

### Content Management

Download and manage Minecraft content directly from CobbleLauncher through Modrinth and CurseForge.

- Mods
- Modpacks
- Resource packs
- Datapacks
- Shaders
- Enable, disable and remove installed content.
- Automatic duplicate detection.
- Independent modpack installations.
- Manual download support for restricted CurseForge files.
- File integrity verification.

### Supported Languages

- English
- Português (Brasil)
- Español

## Download

CobbleLauncher is available for Windows and Linux.

| Platform | Architecture | Package |
|---|---|---|
| Windows | x64 | EXE Installer |
| Linux | x86_64 | AppImage |
| Debian / Ubuntu | AMD64 | DEB Package |

[Download the latest version](https://github.com/pedrxzy/CobbleLauncher/releases/latest)

### Linux Installation

**AppImage:**

Make the downloaded AppImage executable and launch it:

`chmod +x CobbleLauncher-1.2.0-x86_64.AppImage`

`./CobbleLauncher-1.2.0-x86_64.AppImage`

**Debian and Ubuntu:**

`sudo apt install ./CobbleLauncher-1.2.0-amd64.deb`

## Development

CobbleLauncher is built using:

- Electron
- Node.js
- JavaScript
- HTML
- CSS
- EML Lib
- Electron Builder
- Cloudflare Workers

### Running from source

`git clone https://github.com/pedrxzy/CobbleLauncher.git`

`cd CobbleLauncher`

`npm ci`

`npm start`

### Building

Windows:

`npm run dist:win`

Linux AppImage:

`npm run dist:linux`

Linux DEB:

`npm run dist:deb`

## Feedback and Bug Reports

Found a bug or have a suggestion?

[Open an issue on GitHub](https://github.com/pedrxzy/CobbleLauncher/issues)

## Disclaimer

CobbleLauncher is an independent third-party Minecraft launcher. It is not affiliated with, endorsed by or associated with Mojang Studios, Microsoft, Modrinth or CurseForge.

A valid Minecraft Java Edition license is required to play.

All respective trademarks and content belong to their respective owners.

## Credits

Developed and maintained by **Zavira Studios**.

© 2026 Zavira Studios. All rights reserved.
