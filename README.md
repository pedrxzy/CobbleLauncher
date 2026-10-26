# CobbleLauncher

A custom Minecraft launcher for Windows, built with Electron. Manage your Minecraft profiles, install mods and modpacks, customize your skins, and keep your launcher up to date.

## Features

- **Microsoft Authentication** — Sign in with your Microsoft account to access Minecraft.
- **Minecraft Profiles** — Create and manage profiles with different Minecraft versions and mod loaders.
- **Modrinth Integration** — Discover and install compatible Minecraft mods.
- **CurseForge Integration** — Browse and install Minecraft mods and modpacks.
- **Skin Management** — Import, rename, manage, and apply custom Minecraft skins.
- **Cape Management** — View and manage available Minecraft account capes.
- **Automatic Updates** — Check for new versions, download updates, and install them by restarting the launcher.
- **Multilingual Interface** — Available in Brazilian Portuguese, English, and Spanish.
- **Customizable Settings** — Configure memory allocation and other launcher options.

## Download

Download the latest version from the [GitHub Releases](https://github.com/pedrxzy/CobbleLauncher/releases) page.

1. Open the latest release.
2. Download the Windows installer (`CobbleLauncher-Setup-x.x.x.exe`).
3. Run the installer and follow the instructions.
4. Open CobbleLauncher and sign in with your Microsoft account.

## Requirements

- Windows 10 or Windows 11
- A valid Minecraft Java Edition license for playing the game
- An internet connection for authentication, downloads, and updates

## Development

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git (optional)

### Setup

Clone the repository:

```bash
git clone https://github.com/pedrxzy/CobbleLauncher.git
cd CobbleLauncher
```

Install dependencies:

```bash
npm install
```

Start the launcher in development mode:

```bash
npm start
```

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
- `eml-lib`
- `electron-updater`

## Contributing

Bug reports and feature suggestions are welcome. Please open an issue in the [GitHub repository](https://github.com/pedrxzy/CobbleLauncher/issues).

## Disclaimer

CobbleLauncher is an independent community project and is not affiliated with, endorsed by, or sponsored by Mojang or Microsoft. Minecraft is a trademark of Mojang Studios.

CurseForge and Modrinth are third-party platforms. Their services and content are subject to their respective terms and policies.

## License

See the [LICENSE](LICENSE) file for licensing information, if available.
