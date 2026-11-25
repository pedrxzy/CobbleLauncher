# 📢 CobbleLauncher — Linux Support Coming Soon!

Hey everyone!

We're currently working on bringing CobbleLauncher to Linux, and we hope to make it available for download soon!

We're fixing bugs, improving compatibility, and polishing existing features to ensure you have the best possible experience with CobbleLauncher.

Thank you to everyone who has supported CobbleLauncher so far. Your support means a lot!

**We'll be back soon. See you in the next update!**

— The CobbleLauncher Team

---

# CobbleLauncher

A custom Minecraft Java Edition launcher built with Electron. Manage your Minecraft installations, discover and install community content, customize your skins, and keep your launcher up to date.

## Platform Support

| Platform | Status |
|---|---|
| Windows | Available |
| Linux | In development |

## Features

- **Microsoft Authentication** — Sign in with your Microsoft account to access Minecraft.
- **Minecraft Profiles** — Create and manage independent installations with different Minecraft versions and mod loaders.
- **Mod Loader Support** — Supports Vanilla, Fabric, Forge, NeoForge, and Quilt installations.
- **Modrinth Integration** — Discover and install compatible Minecraft mods and modpacks.
- **CurseForge Integration** — Browse and install compatible Minecraft mods.
- **Mod Management** — Manage, enable, disable, and remove installed mods.
- **Skin Management** — Import, rename, manage, and apply custom Minecraft skins.
- **Cape Management** — View and manage available Minecraft account capes.
- **Automatic Updates** — Check for new versions, download updates, and install them by restarting the launcher.
- **Multilingual Interface** — Available in Brazilian Portuguese, English, and Spanish.
- **Customizable Settings** — Configure memory allocation and Java settings for each installation.

## In Development

- Native Linux support.
- Improved Resource Pack, Shader, and Datapack support.
- Built-in world selection for Datapack installation.
- Unified content management.
- Improved duplicate detection across Modrinth and CurseForge.
- CurseForge Modpack installation.

## Download

Download the latest stable version from the [GitHub Releases](https://github.com/pedrxzy/CobbleLauncher/releases) page.

1. Open the latest stable release.
2. Download the Windows installer (`CobbleLauncher-Setup-x.x.x.exe`).
3. Run the installer and follow the instructions.
4. Open CobbleLauncher and sign in with your Microsoft account.

Linux builds are not officially available yet.

## Requirements

- Windows 10 or Windows 11.
- A valid Minecraft Java Edition license to play the game.
- An internet connection for authentication, downloads, and updates.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)

### Setup

Clone the repository:

```bash
git clone https://github.com/pedrxzy/CobbleLauncher.git
cd CobbleLauncher
```

Install dependencies:

```bash
npm ci
```

Start the launcher in development mode:

```bash
npm start
```

### Building

Build the Windows installer:

```bash
npm run dist
```

The generated installer and update files are placed in the `dist` directory.

**Note:** Automatic updates are intended for packaged installations, not development mode.

## Technologies

- Electron
- Node.js
- JavaScript
- HTML and CSS
- eml-lib
- electron-updater
- electron-builder
- adm-zip
- prismarine-nbt

## Contributing

Bug reports and feature suggestions are welcome.

Please open an issue in the [GitHub repository](https://github.com/pedrxzy/CobbleLauncher/issues).

## Disclaimer

CobbleLauncher is an independent, unofficial Minecraft launcher and is not affiliated with, endorsed by, or sponsored by Mojang Studios or Microsoft.

Minecraft is a trademark of its respective owner.

CurseForge and Modrinth are third-party platforms. Their services and content are subject to their respective terms and policies.

## License

See the [LICENSE](LICENSE) file for licensing information.
