"use strict";

// ==================================================
// COBBLELAUNCHER - INTERFACE
// ==================================================

const $ = (id) => document.getElementById(id);
const translations = {
  "pt-BR": {
    settings: "Configurações",
    customization: "PERSONALIZAÇÃO",
    settingsDescription: "Ajuste o ambiente do Minecraft para o seu computador.",
    language: "Idioma",
    languageDescription: "Escolha o idioma da interface do CobbleLauncher.",
    applicationLanguage: "Idioma do aplicativo",
    languageHint: "As alterações serão aplicadas ao aplicativo inteiro.",
    installationSettings: "Configurações da instalação",
    installation: "Instalação",
    noInstallation: "Nenhuma instalação disponível",
    maxRam: "Memória RAM máxima (MB)",
    java: "Java",
    saveSettings: "Salvar configurações",
    gameFolder: "Pasta dos jogos",
    openGameFolder: "Abrir pasta dos jogos",
    cancel: "Cancelar",
    deleteSkin: "Excluir skin?",
    maxRamHint: "O mínimo será configurado automaticamente em 512 MB. Não reserve toda a RAM do computador para o jogo.",
    javaAuto: "Detectar e instalar automaticamente",
    javaManual: "Escolher Java manualmente",
    javaPath: "Caminho do executável Java",
    validateJava: "Validar caminho",
    saveSettingsHint: "Configurações salvas com sucesso.",
    gameFolderDescription: "As instalações do Minecraft e seus arquivos ficam na pasta de dados do CobbleLauncher.",
    gameFolderHint: "Abre a pasta utilizada pelo CobbleLauncher no Windows.",
    javaValidationUnavailable: "Validação de Java indisponível.",
    javaCheckingPath: "Verificando caminho...",
    javaExecutableFound: "Executável Java encontrado.",
    selectInstallationFirst: "Crie ou selecione uma instalação primeiro.",
    ramRangeError: "A RAM máxima deve ficar entre 1024 e 65536 MB.",
    validateJavaBeforeSaving: "Valide o caminho do Java antes de salvar.",
    settingsSaved: "Configurações salvas para esta instalação.",
    saveSettingsError: "Não foi possível salvar: ",
    loginCommunicationError: "Erro: comunicação com o launcher indisponível.",
    openingMicrosoftLogin: "Abrindo o login Microsoft...",
    microsoftLogin: "Entrar com Microsoft",
    accountConnected: "Conta conectada! Pode jogar.",
    invalidMicrosoftAccount: "A conta Microsoft não retornou um nome válido.",
    unexpectedError: "Ocorreu um erro inesperado.",
    preparingMinecraft: "Preparando Minecraft...",
    percentCompleted: "% concluído",
    completed: "Concluído",
    failed: "Falhou",
    initializationCompleted: "Inicialização concluída",
    launchError: "Erro ao iniciar o Minecraft",
    checkingFiles: "Verificando os arquivos do Minecraft...",
    preparingDownload: "Preparando o download do Minecraft...",
    downloadsCompleted: "Downloads concluídos!",
    checkingJava: "Verificando e preparando o Java...",
    minecraftStarted: "Minecraft iniciado! Bom jogo!",
    minecraftClosed: "O Minecraft foi fechado.",
    minecraftClosedWithCode: "O Minecraft foi fechado com código",
    minecraftCrashed: "O Minecraft fechou inesperadamente.",
    preparingDownloadFiles: "Preparando download: {count} arquivos...",
    downloadProgress: "Baixando arquivos: {percent}% ({downloaded} de {total}){speed}",
    downloadGroupCompleted: "Grupo de downloads concluído: {percent}%",
    createInstallationFirst:
      "Crie uma instalação na tela Versões primeiro.",
    launcherUnavailable:
      "A função de inicialização não está disponível. Verifique o preload.js.",
    signedOutMicrosoft: "Você saiu da conta Microsoft.",
    signInMicrosoftToPlay: "Entre com sua conta Microsoft para jogar.",
    checkingSavedAccount: "Verificando conta salva...",
    signInMicrosoftFirst: "Entre com sua conta Microsoft primeiro.",
    edit: "Editar",
    select: "Selecionar",
    manageMods: "Gerenciar mods",
    delete: "Excluir",
    installationSelected: "Instalação selecionada: {name}",
    createInstallation: "Criar instalação",
    saveChanges: "Salvar alterações",
    installationDeleted: 'Instalação "{name}" excluída.',
    deleteInstallationTitle: "Excluir instalação?",
    deleteInstallationMessage:
    'A instalação "{name}" e todos os arquivos dentro da pasta dela serão apagados permanentemente.',
    confirmDeleteInstallation: "Excluir instalação",
    installationSaved: 'Instalação "{name}" salva.',
    selectInstallationForMods: "Selecione uma instalação primeiro.",
    noInstallationSelected: "Nenhuma instalação selecionada.",
    modsNeedLoader: "Mods precisam de uma instalação com mod loader.",
    selectModLoader: "Selecione uma instalação com Fabric, Forge, NeoForge ou Quilt.",
    searchMinCharacters: "Digite pelo menos 2 caracteres ou deixe a pesquisa vazia.",
    searchUnavailable: "Pesquisa indisponível.",
    checkMainProcess: "Verifique a comunicação com o processo principal.",
    loadingResults: "Carregando resultados...",
    searchingModrinth: "Pesquisando no Modrinth...",
    noResultsFound: "Nenhum resultado encontrado.",
    tryAnotherSearch: "Tente outra pesquisa ou categoria.",
    searchFailed: "Falha ao carregar os resultados.",
    checkConnectionRetry: "Verifique a conexão e tente novamente.",
    remove: "Remover",
    removeModTitle: "Remover mod?",
    removeModMessage: 'O mod "{name}" será removido desta instalação.',
    confirmRemoveMod: "Remover mod",
    removeModError: "Não foi possível remover o mod: {error}",
    loadModsError: "Não foi possível carregar os mods: {error}",
    modsCreateInstallation: "Crie uma instalação na tela Versões para começar.",
    modsVanillaInfo: '"{name}" usa Minecraft Vanilla. Selecione Fabric, Forge, NeoForge ou Quilt para usar mods.',
    modsLoaderInfo: '"{name}" usa {loader} no Minecraft {version}.',
    downloadsUnavailable: "Downloads indisponíveis",
    downloadCount: "{count} downloads",
    unnamedMod: "Sem nome",
    noModDescription: "Sem descrição disponível.",
    unknownAuthor: "Autor desconhecido",
    downloaded: "Baixado",
    install: "Instalar",
    download: "Baixar",
    modInstallationUnavailable: "A função de instalação não está disponível. Verifique o preload.js.",
    createInstallationFirst: "Crie uma instalação na tela Versões primeiro.",
    preparingModpack: 'Preparando o modpack "{name}"...',
    downloadingMod: 'Baixando "{name}"...',
    modpackInstalledNewProfile: 'Modpack "{name}" instalado em um perfil novo.',
    modInstalledProfile: 'Mod "{filename}" instalado no perfil "{profile}".',
    curseForgeInstallFailed: "Não foi possível instalar este mod pelo CurseForge. Você pode tentar instalá-lo pelo Modrinth.",
    installViaModrinth: "Instalar pelo Modrinth",
    gotIt: "Entendi",
    searchingModrinthMod: "Procurando o mod no Modrinth...",
    modrinthModNotFound: "Mod não encontrado no Modrinth. Você pode procurá-lo manualmente.",
    modrinthInstallSuccess: "Mod instalado pelo Modrinth com sucesso!",
    modrinthInstallFailed: "Não foi possível instalar pelo Modrinth: {error}",
    modAlreadyInstalled: "Este mod já está instalado neste perfil.",
    installFailedTitle: "Falha na instalação",
    modNotFoundTitle: "Mod não encontrado",
    modAlreadyInstalledTitle: "Mod já instalado",
    installationFailed: "Falha na instalação: {error}",
    installationNotFound: "Não foi possível encontrar essa instalação.",
    loadingMods: "Carregando mods...",
    noInstalledMods: "Nenhum mod instalado nesta instalação.",
    activated: "Ativado",
    deactivated: "Desativado",
    enable: "Ativar",
    disable: "Desativar",
    toggleModError: "Não foi possível alterar o mod: {error}",
    invalidSkinPng: "Selecione um arquivo PNG válido.",
    skinTooLarge: "A skin deve ter no máximo 2 MB.",
    importSkin: "Importar",
    noSkinsImported: "Você ainda não importou nenhuma skin.",
    skinModel: "Modelo da skin",
    steveModel: "Steve (braços largos)",
    alexModel: "Alex (braços finos)",
    saveSkinName: "Salvar nome",
    deleteSkinButton: "Excluir skin",
    deleteSkinTitle: "Excluir skin?",
    confirmDeleteSkin: "Excluir skin",
    skinNameRequired: "Digite um nome para a skin.",
    skinSaved: "Skin salva: {name}",
    skinSelectedAccount: 'Skin selecionada: {name}. Clique em "Atualizar skin" para enviá-la à sua conta Minecraft.',
    selectSkinFirst: "Selecione uma skin em Minhas skins primeiro.",
    uploadingAccountSkin: "Enviando skin para sua conta Minecraft...",
    skinUpdatedSuccess: "Skin atualizada com sucesso!",
    skinUpdateFailed: "Não foi possível atualizar a skin.",
    loadingCapes: "Carregando suas capas...",
    noCapesFound: "Nenhuma capa encontrada na sua conta.",
    capesFound: "{count} capa(s) encontrada(s).",
    loadCapesFailed: "Não foi possível carregar suas capas.",
    hidingCape: "Ocultando sua capa...",
    capeHiddenSuccess: "Capa ocultada com sucesso.",
    hideCapeFailed: "Não foi possível ocultar a capa.",
    skinModelSaved: 'Modelo da skin "{name}" salvo.',
    saveSkinModelFailed: "Erro ao salvar o modelo da skin.",
    mainMenuLabel: "MENU PRINCIPAL",
    navHome: "Início",
    navVersions: "Versões",
    navMods: "Mods",
    navSkins: "Skins",
    navSettings: "Configurações",
    headerTagline: "SEU MINECRAFT, DO SEU JEITO",
    installationsLabel: "INSTALAÇÕES",
    versionsHeading: "Suas versões",
    versionsDescription: "Cada perfil tem sua própria pasta e configuração.",
    installationName: "Nome da instalação",
    installationNamePlaceholder: "Ex.: Meu Minecraft com mods",
    minecraftVersion: "Versão do Minecraft",
    modLoader: "Mod loader",
    vanillaNoMods: "Vanilla (sem mods)",
    loaderVersion: "Versão do loader",
    loadingVersions: "Carregando versões...",
    compatibleLoaderHint: "Selecione uma versão compatível com o Minecraft escolhido.",
    existingInstallations: "Instalações existentes",
    loadingInstallations: "Carregando instalações...",
    cancelEdit: "Cancelar edição",
    homeEdition: "MINECRAFT JAVA EDITION",
    homeTitleLine1: "Seu mundo.",
    homeTitleLine2: "Suas regras.",
    homeDescription: "Prepare sua próxima aventura.",
    homeInstallation: "INSTALAÇÃO",
    playButton: "▶ JOGAR",
    environmentLabel: "SEU AMBIENTE",
    environmentTitle: "Central de controle",
    homeVersionsTitle: "Versões",
    homeVersionsDescription: "Crie instalações independentes do Minecraft.",
    homeManageVersions: "Gerenciar versões",
    homeModsTitle: "Mods e modpacks",
    homeModsDescription: "Organize os mods de cada instalação.",
    homeViewMods: "Ver mods",
    homeSettingsTitle: "Configurações",
    homeSettingsDescription: "Personalize a memória e o Java.",
    homeConfigure: "Configurar",
    launcherReady: "O CobbleLauncher está pronto para começar.",
    launchProgressLabel: "Progresso da inicialização",
    close: "Fechar",
    skinsDescription: "Personalize a aparência do seu personagem no Minecraft.",
    defaultSkins: "Skins padrão",
    defaultSkinsDescription: "Escolha uma aparência clássica do Minecraft.",
    steveModelDescription: "Modelo clássico",
    alexModelDescription: "Modelo de braços finos",
    steveSkinAlt: "Skin padrão do Steve",
    alexSkinAlt: "Skin padrão da Alex",
    mySkins: "Minhas skins",
    mySkinsDescription: "Skins importadas do seu computador.",
    emptySkinsMessage: "Você ainda não importou nenhuma skin.",
    updateAccountSkin: "Atualizar skin no Minecraft",
    accountSkinUpdateHint: "Selecione uma skin importada para enviá-la à sua conta Minecraft.",
    capesTitle: "Capas",
    capeLoginHint: "Entre na sua conta Microsoft para consultar suas capas.",
    refreshCapes: "Atualizar capas",
    hideCape: "Ocultar capa",
    activeCape: "Capa ativa",
    availableCape: "Capa disponível",
    useCape: "Usar capa",
    updatingCape: "Atualizando sua capa...",
    capeUpdatedSuccess: "Capa atualizada com sucesso.",
    switchCapeFailed: "Não foi possível trocar a capa.",
    capeHiddenSuccess: "Capa ocultada com sucesso.",
    hideCapeFailed: "Não foi possível ocultar a capa.",
    hidingCape: "Ocultando capa...",
    renameSkin: "Renomear",
    modsPageDescription: "Encontre mods compatíveis com suas instalações.",
    modsSelectedInstallation: "Instalação selecionada",
    modsSelectLoaderHint: "Selecione uma instalação com Fabric, Forge, NeoForge ou Quilt para pesquisar mods.",
    modsExploreContent: "Explorar conteúdo",
    modsCategoryMods: "Mods",
    modsCategoryResourcePacks: "Pacotes de recursos",
    modsCategoryDataPacks: "Pacotes de dados",
    modsCategoryModpacks: "Modpacks",
    modsCategoryShaders: "Shaders",
    modsSearchLabel: "Pesquisar",
    modsSearchPlaceholder: "Buscar conteúdo...",
    modsSearchHint: "Os resultados respeitam a versão do Minecraft selecionada sempre que aplicável.",
    modsSearchInitialMessage: "Escolha uma categoria e pesquise o que procura.",
    searchResultsStatus: "{count} resultado(s) · Página {current} de {total}",
    systemDefault: "Padrão do sistema",
    noticeTitle: "Aviso",
    close: "Fechar",
    allRightsReserved: "Todos os direitos reservados.",
  },

  "en-US": {
    settings: "Settings",
    customization: "CUSTOMIZATION",
    settingsDescription: "Adjust the Minecraft environment for your computer.",
    language: "Language",
    languageDescription: "Choose the CobbleLauncher interface language.",
    applicationLanguage: "Application language",
    languageHint: "Changes will apply throughout the application.",
    installationSettings: "Installation settings",
    installation: "Installation",
    noInstallation: "No installations available",
    maxRam: "Maximum RAM (MB)",
    java: "Java",
    saveSettings: "Save settings",
    gameFolder: "Game folder",
    openGameFolder: "Open game folder",
    cancel: "Cancel",
    deleteSkin: "Delete skin?",
    maxRamHint: "The minimum will be set automatically to 512 MB. Do not allocate all your computer's RAM to the game.",
    javaAuto: "Detect and install automatically",
    javaManual: "Choose Java manually",
    javaPath: "Java executable path",
    validateJava: "Validate path",
    saveSettingsHint: "Settings saved successfully.",
    gameFolderDescription: "Minecraft installations and their files are stored in the CobbleLauncher data folder.",
    gameFolderHint: "Opens the folder used by CobbleLauncher on Windows.",
    javaValidationUnavailable: "Java validation is unavailable.",
    javaCheckingPath: "Checking path...",
    javaExecutableFound: "Java executable found.",
    selectInstallationFirst: "Create or select an installation first.",
    ramRangeError: "Maximum RAM must be between 1024 and 65536 MB.",
    validateJavaBeforeSaving: "Validate the Java path before saving.",
    settingsSaved: "Settings saved for this installation.",
    saveSettingsError: "Unable to save: ",
    loginCommunicationError: "Error: communication with the launcher is unavailable.",
    openingMicrosoftLogin: "Opening Microsoft sign-in...",
    microsoftLogin: "Sign in with Microsoft",
    accountConnected: "Account connected! Ready to play.",
    invalidMicrosoftAccount: "The Microsoft account did not return a valid name.",
    unexpectedError: "An unexpected error occurred.",
    preparingMinecraft: "Preparing Minecraft...",
    percentCompleted: "% completed",
    completed: "Completed",
    failed: "Failed",
    initializationCompleted: "Initialization completed",
    launchError: "Error launching Minecraft",
    checkingFiles: "Checking Minecraft files...",
    preparingDownload: "Preparing Minecraft download...",
    downloadsCompleted: "Downloads completed!",
    checkingJava: "Checking and preparing Java...",
    minecraftStarted: "Minecraft started! Have fun!",
    minecraftClosed: "Minecraft was closed.",
    minecraftClosedWithCode: "Minecraft was closed with exit code",
    minecraftCrashed: "Minecraft closed unexpectedly.",
    preparingDownloadFiles: "Preparing download: {count} files...",
    downloadProgress: "Downloading files: {percent}% ({downloaded} of {total}){speed}",
    downloadGroupCompleted: "Download group completed: {percent}%",
    createInstallationFirst:
      "Create an installation on the Versions screen first.",
    launcherUnavailable:
      "The launch function is unavailable. Check preload.js.",
    signedOutMicrosoft: "You signed out of your Microsoft account.",
    signInMicrosoftToPlay: "Sign in with your Microsoft account to play.",
    checkingSavedAccount: "Checking saved account...",
    signInMicrosoftFirst: "Sign in with your Microsoft account first.",
    edit: "Edit",
    select: "Select",
    manageMods: "Manage Mods",
    delete: "Delete",
    remove: "Remove",
    installationSelected: "Installation selected: {name}",
    createInstallation: "Create Installation",
    saveChanges: "Save Changes",
    installationDeleted: 'Installation "{name}" deleted.',
    deleteInstallationTitle: "Delete installation?",
    deleteInstallationMessage:
    'The installation "{name}" and all files inside its folder will be permanently deleted.',
    confirmDeleteInstallation: "Delete installation",
    installationSaved: 'Installation "{name}" saved.',
    selectInstallationForMods: "Select an installation first.",
    noInstallationSelected: "No installation selected.",
    modsNeedLoader: "Mods require an installation with a mod loader.",
    selectModLoader: "Select an installation with Fabric, Forge, NeoForge, or Quilt.",
    searchMinCharacters: "Enter at least 2 characters or leave the search empty.",
    searchUnavailable: "Search unavailable.",
    checkMainProcess: "Check communication with the main process.",
    loadingResults: "Loading results...",
    searchingModrinth: "Searching Modrinth...",
    noResultsFound: "No results found.",
    tryAnotherSearch: "Try another search or category.",
    searchFailed: "Failed to load results.",
    checkConnectionRetry: "Check your connection and try again.",
    removeModTitle: "Remove Mod?",
    removeModMessage: 'The mod "{name}" will be removed from this installation.',
    confirmRemoveMod: "Remove Mod",
    removeModError: "Could not remove the mod: {error}",
    loadModsError: "Could not load mods: {error}",
    modsCreateInstallation: "Create an installation on the Versions screen to get started.",
    modsVanillaInfo: '"{name}" uses Minecraft Vanilla. Select Fabric, Forge, NeoForge, or Quilt to use mods.',
    modsLoaderInfo: '"{name}" uses {loader} on Minecraft {version}.',
    downloadsUnavailable: "Downloads unavailable",
    downloadCount: "{count} downloads",
    unnamedMod: "Unnamed",
    noModDescription: "No description available.",
    unknownAuthor: "Unknown author",
    downloaded: "Downloaded",
    install: "Install",
    download: "Download",
    modInstallationUnavailable: "The installation function is unavailable. Check preload.js.",
    createInstallationFirst: "Create an installation on the Versions screen first.",
    preparingModpack: 'Preparing modpack "{name}"...',
    downloadingMod: 'Downloading "{name}"...',
    modpackInstalledNewProfile: 'Modpack "{name}" installed in a new profile.',
    modInstalledProfile: 'Mod "{filename}" installed in profile "{profile}".',
    curseForgeInstallFailed: "Could not install this mod through CurseForge. You can try installing it through Modrinth.",
    installViaModrinth: "Install via Modrinth",
    gotIt: "Got it",
    searchingModrinthMod: "Searching for the mod on Modrinth...",
    modrinthModNotFound: "Couldn't find this mod on Modrinth. You can search for it manually.",
    modrinthInstallSuccess: "Mod successfully installed through Modrinth!",
    modrinthInstallFailed: "Could not install through Modrinth: {error}",
    modAlreadyInstalled: "This mod is already installed in this profile.",
    installFailedTitle: "Installation failed",
    modNotFoundTitle: "Mod not found",
    modAlreadyInstalledTitle: "Mod already installed",
    installationFailed: "Installation failed: {error}",
    installationNotFound: "Could not find this installation.",
    loadingMods: "Loading mods...",
    noInstalledMods: "No mods installed in this installation.",
    activated: "Enabled",
    deactivated: "Disabled",
    enable: "Enable",
    disable: "Disable",
    toggleModError: "Could not change the mod: {error}",
    invalidSkinPng: "Select a valid PNG file.",
    skinTooLarge: "The skin must be no larger than 2 MB.",
    importSkin: "Import",
    noSkinsImported: "You haven't imported any skins yet.",
    skinModel: "Skin model",
    steveModel: "Steve (wide arms)",
    alexModel: "Alex (slim arms)",
    saveSkinName: "Save name",
    deleteSkinButton: "Delete skin",
    deleteSkinTitle: "Delete skin?",
    confirmDeleteSkin: "Delete skin",
    skinNameRequired: "Enter a name for the skin.",
    skinSaved: "Skin saved: {name}",
    skinSelectedAccount: 'Skin selected: {name}. Click "Update Skin" to upload it to your Minecraft account.',
    selectSkinFirst: "Select a skin in My Skins first.",
    uploadingAccountSkin: "Uploading skin to your Minecraft account...",
    skinUpdatedSuccess: "Skin updated successfully!",
    skinUpdateFailed: "Could not update the skin.",
    loadingCapes: "Loading your capes...",
    noCapesFound: "No capes found on your account.",
    capesFound: "{count} cape(s) found.",
    loadCapesFailed: "Could not load your capes.",
    hidingCape: "Hiding your cape...",
    capeHiddenSuccess: "Cape hidden successfully.",
    hideCapeFailed: "Could not hide the cape.",
    skinModelSaved: 'Skin model "{name}" saved.',
    saveSkinModelFailed: "Error saving the skin model.",
    mainMenuLabel: "MAIN MENU",
    navHome: "Home",
    navVersions: "Versions",
    navMods: "Mods",
    navSkins: "Skins",
    navSettings: "Settings",
    headerTagline: "YOUR MINECRAFT, YOUR WAY",
    installationsLabel: "INSTALLATIONS",
    versionsHeading: "Your versions",
    versionsDescription: "Each profile has its own folder and configuration.",
    installationName: "Installation name",
    installationNamePlaceholder: "E.g., My Minecraft with mods",
    minecraftVersion: "Minecraft version",
    modLoader: "Mod loader",
    vanillaNoMods: "Vanilla (no mods)",
    loaderVersion: "Loader version",
    loadingVersions: "Loading versions...",
    compatibleLoaderHint: "Select a version compatible with the chosen Minecraft version.",
    existingInstallations: "Existing installations",
    loadingInstallations: "Loading installations...",
    cancelEdit: "Cancel editing",
    homeEdition: "MINECRAFT JAVA EDITION",
    homeTitleLine1: "Your world.",
    homeTitleLine2: "Your rules.",
    homeDescription: "Prepare for your next adventure.",
    homeInstallation: "INSTALLATION",
    playButton: "▶ PLAY",
    environmentLabel: "YOUR ENVIRONMENT",
    environmentTitle: "Control center",
    homeVersionsTitle: "Versions",
    homeVersionsDescription: "Create independent Minecraft installations.",
    homeManageVersions: "Manage versions",
    homeModsTitle: "Mods and modpacks",
    homeModsDescription: "Organize mods for each installation.",
    homeViewMods: "View mods",
    homeSettingsTitle: "Settings",
    homeSettingsDescription: "Customize memory and Java.",
    homeConfigure: "Configure",
    launcherReady: "CobbleLauncher is ready to get started.",
    launchProgressLabel: "Launch progress",
    close: "Close",
    skinsDescription: "Customize your character's appearance in Minecraft.",
    defaultSkins: "Default skins",
    defaultSkinsDescription: "Choose a classic Minecraft appearance.",
    steveModelDescription: "Classic model",
    alexModelDescription: "Slim-arm model",
    steveSkinAlt: "Steve default skin",
    alexSkinAlt: "Alex default skin",
    mySkins: "My skins",
    mySkinsDescription: "Skins imported from your computer.",
    emptySkinsMessage: "You haven't imported any skins yet.",
    updateAccountSkin: "Update Minecraft skin",
    accountSkinUpdateHint: "Select an imported skin to upload it to your Minecraft account.",
    capesTitle: "Capes",
    capeLoginHint: "Sign in to your Microsoft account to view your capes.",
    refreshCapes: "Refresh capes",
    hideCape: "Hide cape",
    activeCape: "Active cape",
    availableCape: "Available cape",
    useCape: "Use cape",
    updatingCape: "Updating your cape...",
    capeUpdatedSuccess: "Cape updated successfully.",
    switchCapeFailed: "Could not change the cape.",
    capeHiddenSuccess: "Cape hidden successfully.",
    hideCapeFailed: "Could not hide the cape.",
    hidingCape: "Hiding cape...",
    renameSkin: "Rename",
    modsPageDescription: "Find mods compatible with your installations.",
    modsSelectedInstallation: "Selected installation",
    modsSelectLoaderHint: "Select an installation with Fabric, Forge, NeoForge, or Quilt to search for mods.",
    modsExploreContent: "Explore content",
    modsCategoryMods: "Mods",
    modsCategoryResourcePacks: "Resource packs",
    modsCategoryDataPacks: "Data packs",
    modsCategoryModpacks: "Modpacks",
    modsCategoryShaders: "Shaders",
    modsSearchLabel: "Search",
    modsSearchPlaceholder: "Search content...",
    modsSearchHint: "Results respect the selected Minecraft version whenever applicable.",
    modsSearchInitialMessage: "Choose a category and search for what you're looking for.",
    searchResultsStatus: "{count} result(s) · Page {current} of {total}",
    systemDefault: "System default",
    noticeTitle: "Notice",
    close: "Close",
    allRightsReserved: "All rights reserved.",
  },

  "es-ES": {
    settings: "Configuración",
    customization: "PERSONALIZACIÓN",
    settingsDescription: "Ajusta el entorno de Minecraft para tu ordenador.",
    language: "Idioma",
    languageDescription: "Elige el idioma de la interfaz de CobbleLauncher.",
    applicationLanguage: "Idioma de la aplicación",
    languageHint: "Los cambios se aplicarán a toda la aplicación.",
    installationSettings: "Configuración de la instalación",
    installation: "Instalación",
    noInstallation: "No hay instalaciones disponibles",
    maxRam: "Memoria RAM máxima (MB)",
    java: "Java",
    saveSettings: "Guardar configuración",
    gameFolder: "Carpeta de juegos",
    openGameFolder: "Abrir carpeta de juegos",
    cancel: "Cancelar",
    deleteSkin: "¿Eliminar skin?",
    maxRamHint: "El mínimo se configurará automáticamente en 512 MB. No asignes toda la RAM del ordenador al juego.",
    javaAuto: "Detectar e instalar automáticamente",
    javaManual: "Elegir Java manualmente",
    javaPath: "Ruta del ejecutable de Java",
    validateJava: "Validar ruta",
    saveSettingsHint: "Configuración guardada correctamente.",
    gameFolderDescription: "Las instalaciones de Minecraft y sus archivos se guardan en la carpeta de datos de CobbleLauncher.",
    gameFolderHint: "Abre la carpeta que CobbleLauncher utiliza en Windows.",
    javaValidationUnavailable: "La validación de Java no está disponible.",
    javaCheckingPath: "Comprobando la ruta...",
    javaExecutableFound: "Se ha encontrado el ejecutable de Java.",
    selectInstallationFirst: "Crea o selecciona una instalación primero.",
    ramRangeError: "La memoria RAM máxima debe estar entre 1024 y 65536 MB.",
    validateJavaBeforeSaving: "Valida la ruta de Java antes de guardar.",
    settingsSaved: "Configuración guardada para esta instalación.",
    saveSettingsError: "No se pudo guardar: ",
    loginCommunicationError: "Error: la comunicación con el launcher no está disponible.",
    openingMicrosoftLogin: "Abriendo el inicio de sesión de Microsoft...",
    microsoftLogin: "Iniciar sesión con Microsoft",
    accountConnected: "¡Cuenta conectada! Ya puedes jugar.",
    invalidMicrosoftAccount: "La cuenta de Microsoft no devolvió un nombre válido.",
    unexpectedError: "Se produjo un error inesperado.",
    preparingMinecraft: "Preparando Minecraft...",
    percentCompleted: "% completado",
    completed: "Completado",
    failed: "Falló",
    initializationCompleted: "Inicialización completada",
    launchError: "Error al iniciar Minecraft",
    checkingFiles: "Verificando los archivos de Minecraft...",
    preparingDownload: "Preparando la descarga de Minecraft...",
    downloadsCompleted: "¡Descargas completadas!",
    checkingJava: "Verificando y preparando Java...",
    minecraftStarted: "¡Minecraft iniciado! ¡Que te diviertas!",
    minecraftClosed: "Minecraft se ha cerrado.",
    minecraftClosedWithCode: "Minecraft se ha cerrado con el código",
    minecraftCrashed: "Minecraft se cerró inesperadamente.",
    preparingDownloadFiles: "Preparando descarga: {count} archivos...",
    downloadProgress: "Descargando archivos: {percent}% ({downloaded} de {total}){speed}",
    downloadGroupCompleted: "Grupo de descargas completado: {percent}%",
    createInstallationFirst:
      "Crea una instalación primero en la pantalla Versiones.",
    launcherUnavailable:
      "La función de inicio no está disponible. Comprueba preload.js.",
    signedOutMicrosoft: "Has cerrado sesión de tu cuenta de Microsoft.",
    signInMicrosoftToPlay: "Inicia sesión con tu cuenta de Microsoft para jugar.",
    checkingSavedAccount: "Verificando la cuenta guardada...",
    signInMicrosoftFirst: "Inicia sesión con tu cuenta de Microsoft primero.",
    edit: "Editar",
    select: "Seleccionar",
    manageMods: "Gestionar mods",
    delete: "Eliminar",
    installationSelected: "Instalación seleccionada: {name}",
    createInstallation: "Crear instalación",
    saveChanges: "Guardar cambios",
    installationDeleted: 'Instalación "{name}" eliminada.',
    deleteInstallationTitle: "¿Eliminar instalación?",
    deleteInstallationMessage:
    'La instalación "{name}" y todos los archivos dentro de su carpeta se eliminarán permanentemente.',
    confirmDeleteInstallation: "Eliminar instalación",
    installationSaved: 'Instalación "{name}" guardada.',
    selectInstallationForMods: "Selecciona una instalación primero.",
    noInstallationSelected: "No hay ninguna instalación seleccionada.",
    modsNeedLoader: "Los mods necesitan una instalación con un cargador de mods.",
    selectModLoader: "Selecciona una instalación con Fabric, Forge, NeoForge o Quilt.",
    searchMinCharacters: "Escribe al menos 2 caracteres o deja la búsqueda vacía.",
    searchUnavailable: "Búsqueda no disponible.",
    checkMainProcess: "Comprueba la comunicación con el proceso principal.",
    loadingResults: "Cargando resultados...",
    searchingModrinth: "Buscando en Modrinth...",
    noResultsFound: "No se encontraron resultados.",
    tryAnotherSearch: "Prueba otra búsqueda o categoría.",
    searchFailed: "No se pudieron cargar los resultados.",
    checkConnectionRetry: "Comprueba la conexión e inténtalo de nuevo.",
    remove: "Eliminar",
    removeModTitle: "¿Eliminar mod?",
    removeModMessage: 'El mod "{name}" se eliminará de esta instalación.',
    confirmRemoveMod: "Eliminar mod",
    removeModError: "No se pudo eliminar el mod: {error}",
    loadModsError: "No se pudieron cargar los mods: {error}",
    modsCreateInstallation: "Crea una instalación en la pantalla Versiones para empezar.",
    modsVanillaInfo: '"{name}" usa Minecraft Vanilla. Selecciona Fabric, Forge, NeoForge o Quilt para usar mods.',
    modsLoaderInfo: '"{name}" usa {loader} en Minecraft {version}.',
    downloadsUnavailable: "Descargas no disponibles",
    downloadCount: "{count} descargas",
    unnamedMod: "Sin nombre",
    noModDescription: "No hay descripción disponible.",
    unknownAuthor: "Autor desconocido",
    downloaded: "Descargado",
    install: "Instalar",
    download: "Descargar",
    modInstallationUnavailable: "La función de instalación no está disponible. Comprueba preload.js.",
    createInstallationFirst: "Crea una instalación primero en la pantalla Versiones.",
    preparingModpack: 'Preparando el modpack "{name}"...',
    downloadingMod: 'Descargando "{name}"...',
    modpackInstalledNewProfile: 'Modpack "{name}" instalado en un perfil nuevo.',
    modInstalledProfile: 'Mod "{filename}" instalado en el perfil "{profile}".',
    curseForgeInstallFailed: "No se pudo instalar este mod mediante CurseForge. Puedes intentar instalarlo mediante Modrinth.",
    installViaModrinth: "Instalar mediante Modrinth",
    gotIt: "Entendido",
    searchingModrinthMod: "Buscando el mod en Modrinth...",
    modrinthModNotFound: "No se encontró este mod en Modrinth. Puedes buscarlo manualmente.",
    modrinthInstallSuccess: "¡Mod instalado correctamente mediante Modrinth!",
    modrinthInstallFailed: "No se pudo instalar mediante Modrinth: {error}",
    modAlreadyInstalled: "Este mod ya está instalado en este perfil.",
    installFailedTitle: "Error de instalación",
    modNotFoundTitle: "Mod no encontrado",
    modAlreadyInstalledTitle: "Mod ya instalado",
    installationFailed: "Error de instalación: {error}",
    installationNotFound: "No se pudo encontrar esta instalación.",
    loadingMods: "Cargando mods...",
    noInstalledMods: "No hay mods instalados en esta instalación.",
    activated: "Activado",
    deactivated: "Desactivado",
    enable: "Activar",
    disable: "Desactivar",
    toggleModError: "No se pudo cambiar el mod: {error}",
    invalidSkinPng: "Selecciona un archivo PNG válido.",
    skinTooLarge: "La skin no debe superar los 2 MB.",
    importSkin: "Importar",
    noSkinsImported: "Todavía no has importado ninguna skin.",
    skinModel: "Modelo de skin",
    steveModel: "Steve (brazos anchos)",
    alexModel: "Alex (brazos finos)",
    saveSkinName: "Guardar nombre",
    deleteSkinButton: "Eliminar skin",
    deleteSkinTitle: "¿Eliminar skin?",
    confirmDeleteSkin: "Eliminar skin",
    skinNameRequired: "Escribe un nombre para la skin.",
    skinSaved: "Skin guardada: {name}",
    skinSelectedAccount: 'Skin seleccionada: {name}. Haz clic en "Actualizar skin" para subirla a tu cuenta de Minecraft.',
    selectSkinFirst: "Selecciona una skin en Mis skins primero.",
    uploadingAccountSkin: "Enviando la skin a tu cuenta de Minecraft...",
    skinUpdatedSuccess: "¡Skin actualizada correctamente!",
    skinUpdateFailed: "No se pudo actualizar la skin.",
    loadingCapes: "Cargando tus capas...",
    noCapesFound: "No se encontraron capas en tu cuenta.",
    capesFound: "Se encontraron {count} capa(s).",
    loadCapesFailed: "No se pudieron cargar tus capas.",
    hidingCape: "Ocultando tu capa...",
    capeHiddenSuccess: "Capa ocultada correctamente.",
    hideCapeFailed: "No se pudo ocultar la capa.",
    skinModelSaved: 'Modelo de skin "{name}" guardado.',
    saveSkinModelFailed: "Error al guardar el modelo de la skin.",
    mainMenuLabel: "MENÚ PRINCIPAL",
    navHome: "Inicio",
    navVersions: "Versiones",
    navMods: "Mods",
    navSkins: "Skins",
    navSettings: "Configuración",
    headerTagline: "TU MINECRAFT, A TU MANERA",
    installationsLabel: "INSTALACIONES",
    versionsHeading: "Tus versiones",
    versionsDescription: "Cada perfil tiene su propia carpeta y configuración.",
    installationName: "Nombre de la instalación",
    installationNamePlaceholder: "Ej.: Mi Minecraft con mods",
    minecraftVersion: "Versión de Minecraft",
    modLoader: "Cargador de mods",
    vanillaNoMods: "Vanilla (sin mods)",
    loaderVersion: "Versión del cargador",
    loadingVersions: "Cargando versiones...",
    compatibleLoaderHint: "Selecciona una versión compatible con la versión de Minecraft elegida.",
    existingInstallations: "Instalaciones existentes",
    loadingInstallations: "Cargando instalaciones...",
    cancelEdit: "Cancelar edición",
    homeEdition: "MINECRAFT JAVA EDITION",
    homeTitleLine1: "Tu mundo.",
    homeTitleLine2: "Tus reglas.",
    homeDescription: "Prepara tu próxima aventura.",
    homeInstallation: "INSTALACIÓN",
    playButton: "▶ JUGAR",
    environmentLabel: "TU ENTORNO",
    environmentTitle: "Centro de control",
    homeVersionsTitle: "Versiones",
    homeVersionsDescription: "Crea instalaciones independientes de Minecraft.",
    homeManageVersions: "Gestionar versiones",
    homeModsTitle: "Mods y modpacks",
    homeModsDescription: "Organiza los mods de cada instalación.",
    homeViewMods: "Ver mods",
    homeSettingsTitle: "Configuración",
    homeSettingsDescription: "Personaliza la memoria y Java.",
    homeConfigure: "Configurar",
    launcherReady: "CobbleLauncher está listo para comenzar.",
    launchProgressLabel: "Progreso del inicio",
    close: "Cerrar",
    skinsDescription: "Personaliza la apariencia de tu personaje en Minecraft.",
    defaultSkins: "Skins predeterminadas",
    defaultSkinsDescription: "Elige una apariencia clásica de Minecraft.",
    steveModelDescription: "Modelo clásico",
    alexModelDescription: "Modelo de brazos delgados",
    steveSkinAlt: "Skin predeterminada de Steve",
    alexSkinAlt: "Skin predeterminada de Alex",
    mySkins: "Mis skins",
    mySkinsDescription: "Skins importadas desde tu ordenador.",
    emptySkinsMessage: "Todavía no has importado ninguna skin.",
    updateAccountSkin: "Actualizar skin de Minecraft",
    accountSkinUpdateHint: "Selecciona una skin importada para subirla a tu cuenta de Minecraft.",
    capesTitle: "Capas",
    capeLoginHint: "Inicia sesión en tu cuenta de Microsoft para consultar tus capas.",
    refreshCapes: "Actualizar capas",
    hideCape: "Ocultar capa",
    activeCape: "Capa activa",
    availableCape: "Capa disponible",
    useCape: "Usar capa",
    updatingCape: "Actualizando tu capa...",
    capeUpdatedSuccess: "Capa actualizada correctamente.",
    switchCapeFailed: "No se pudo cambiar la capa.",
    capeHiddenSuccess: "Capa ocultada correctamente.",
    hideCapeFailed: "No se pudo ocultar la capa.",
    hidingCape: "Ocultando capa...",
    renameSkin: "Renombrar",
    modsPageDescription: "Encuentra mods compatibles con tus instalaciones.",
    modsSelectedInstallation: "Instalación seleccionada",
    modsSelectLoaderHint: "Selecciona una instalación con Fabric, Forge, NeoForge o Quilt para buscar mods.",
    modsExploreContent: "Explorar contenido",
    modsCategoryMods: "Mods",
    modsCategoryResourcePacks: "Paquetes de recursos",
    modsCategoryDataPacks: "Paquetes de datos",
    modsCategoryModpacks: "Modpacks",
    modsCategoryShaders: "Shaders",
    modsSearchLabel: "Buscar",
    modsSearchPlaceholder: "Buscar contenido...",
    modsSearchHint: "Los resultados respetan la versión de Minecraft seleccionada cuando corresponde.",
    modsSearchInitialMessage: "Elige una categoría y busca lo que necesitas.",
    searchResultsStatus: "{count} resultado(s) · Página {current} de {total}",
    systemDefault: "Predeterminado del sistema",
    noticeTitle: "Aviso",
    close: "Cerrar",
    allRightsReserved: "Todos los derechos reservados.",
  }
};


function getCurrentLanguage() {
  const savedLanguage = localStorage.getItem("cobblelauncher-language");

  if (
    savedLanguage &&
    savedLanguage !== "system" &&
    Object.hasOwn(translations, savedLanguage)
  ) {
    return savedLanguage;
  }

  if (savedLanguage === "system") {
    const systemLanguage = navigator.language.toLowerCase();

    if (systemLanguage.startsWith("pt")) {
      return "pt-BR";
    }

    if (systemLanguage.startsWith("es")) {
      return "es-ES";
    }

    if (systemLanguage.startsWith("en")) {
      return "en-US";
    }

    return "en-US";
  }

  return "pt-BR";
}

function translate(key) {
  const language = getCurrentLanguage();

  return translations[language][key] ??
    translations["pt-BR"][key] ??
    key;
}


function applyTranslations() {
  const language = getCurrentLanguage();

  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.textContent = translatedText;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.placeholder = translatedText;
    }
  });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const key = element.dataset.i18nAlt;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.setAttribute("alt", translatedText);
    }
  });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.setAttribute("aria-label", translatedText);
    }
  });

  document.querySelectorAll("[data-i18n-aria-valuetext]").forEach((element) => {
    const key = element.dataset.i18nAriaValuetext;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.setAttribute("aria-valuetext", translatedText);
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.dataset.i18nTitle;
    const translatedText = translate(key);

    if (translatedText !== key) {
      element.title = translatedText;
    }
  });

  const languageSelect = document.getElementById("language-select");

  if (languageSelect) {
    languageSelect.value =
  localStorage.getItem("cobblelauncher-language") || "pt-BR";
  }
}

// Inicialização e progresso
const playButton = $("play");
const statusText = $("status");
const launchProgress = $("launch-progress");
const progressLabel = $("progress-label");
const progressPercent = $("progress-percent");
const progressTrack = $("progress-track");
const progressFill = $("progress-fill");
const openGameFolderButton = $("open-game-folder");
if (openGameFolderButton) {
  openGameFolderButton.addEventListener("click", async () => {
    try {
      await window.cobble.openGameFolder();
    } catch (error) {
      console.error(
        "[CobbleLauncher] Erro ao abrir a pasta dos jogos:",
        error
      );
    }
  });
}

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

async function loadMinecraftVersions() {
  if (!profileVersion) return;

  profileVersion.replaceChildren(
    new Option("Carregando versões...", "")
  );
  profileVersion.disabled = true;

  try {
    const versions = await window.cobble.getMinecraftVersions();

    profileVersion.replaceChildren();

    for (const version of versions) {
      const option = new Option(
        `Minecraft ${version.id}`,
        version.id
      );

      profileVersion.add(option);
    }

    const latestRelease = versions.find(
  (version) => version.type === "release"
);

    if (latestRelease) {
      profileVersion.value = latestRelease.id;
}   else if (versions.length > 0) {
      profileVersion.selectedIndex = 0;
}

    if (versions.length === 0) {
      profileVersion.add(
        new Option("Nenhuma versão encontrada", "")
      );
    }
  } catch (error) {
    console.error(
      "[CobbleLauncher] Erro ao carregar versões:",
      error
    );

    profileVersion.replaceChildren(
      new Option("Erro ao carregar versões", "")
    );
  } finally {
    profileVersion.disabled = false;
  }
}
loadMinecraftVersions();

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
  const message = String(error?.message || error || "");

  if (
    message.includes("parece já estar instalado") ||
    message.includes("já está instalado neste perfil")
  ) {
    return "Este mod já está instalado neste perfil.";
  }

  return translate("unexpectedError");
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

  accountName.textContent = translate("microsoftLogin");

  if (accountAvatar) {
    accountAvatar.hidden = true;
    accountAvatar.removeAttribute("src");
  }

  if (logoutButton) {
    logoutButton.hidden = true;
  }
}

async function generateHeadAvatar(skinData) {
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () =>
      reject(new Error("Não foi possível carregar a textura da skin."));
    image.src = skinData;
  });

  if (image.naturalWidth < 64 || image.naturalHeight < 32) {
    throw new Error("A textura da skin possui dimensões inválidas.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  // Frente da cabeça.
  context.drawImage(image, 8, 8, 8, 8, 0, 0, 64, 64);

  // Camada externa da cabeça (chapéu/acessórios).
  context.drawImage(image, 40, 8, 8, 8, 0, 0, 64, 64);

const dataUrl = canvas.toDataURL("image/png");

if (!dataUrl.startsWith("data:image/png;base64,")) {
  throw new Error("O canvas não gerou uma PNG válida.");
}

return dataUrl;
}

function setAccount(account) {
  if (!account?.name) {
    throw new Error(translate("invalidMicrosoftAccount"));
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
  const avatarKey =
    `cobble-account-avatar-${account.name.toLowerCase()}`;
  const savedAvatar = localStorage.getItem(avatarKey);

  accountAvatar.onload = () => {
    accountAvatar.hidden = false;
  };

  accountAvatar.onerror = () => {
    accountAvatar.hidden = true;
  };

  if (savedAvatar) {
    accountAvatar.src = savedAvatar;
  } else {
    accountAvatar.src =
      `https://mc-heads.net/avatar/${encodeURIComponent(uuid)}/64?refresh=${Date.now()}`;
  }
}
  }

  setStatus(translate("accountConnected"));
}

function showModNotice(message, title = translate("noticeTitle"), options = null) {
  const modal = $("modNoticeModal");
  const titleElement = $("modNoticeTitle");
  const messageElement = $("modNoticeMessage");
  const closeButton = $("closeModNotice");

  if (!modal || !titleElement || !messageElement || !closeButton) {
    console.error("[CobbleLauncher] Elementos do modal não encontrados.");
    return;
  }

  // Remove o botão de ação anterior, se existir.
  modal.querySelector("#modNoticeActionButton")?.remove();

  titleElement.textContent = title;
  messageElement.textContent = message;
  closeButton.textContent = options?.closeLabel || translate("close");

  if (options?.actionLabel && typeof options.onAction === "function") {
    const actionButton = document.createElement("button");

    actionButton.id = "modNoticeActionButton";
    actionButton.type = "button";
    actionButton.className = closeButton.className;
    actionButton.textContent = options.actionLabel;

    actionButton.addEventListener("click", async () => {
      modal.hidden = true;
      actionButton.disabled = true;

      try {
        await options.onAction();
      } catch (error) {
        console.error("[CobbleLauncher] Ação do modal falhou:", error);
      } finally {
        actionButton.disabled = false;
        actionButton.remove();
      }
    });

    closeButton.parentElement.insertBefore(actionButton, closeButton);
  }

  closeButton.onclick = () => {
    modal.hidden = true;
    modal.querySelector("#modNoticeActionButton")?.remove();
    closeButton.textContent = translate("close");
  };

  modal.hidden = false;
}

// ==================================================
// BARRA DE PROGRESSO
// ==================================================

function updateLaunchProgress(message, options = {}) {
  if (!launchProgress) return;

  const isObject = typeof message === "object" && message !== null;

  const rawText = isObject
  ? String(message.message || "")
  : String(message ?? "");

const stage = isObject
  ? String(message.stage || "")
  : String(options.stage || "");

const stageTranslations = {
  checking: "checkingFiles",
  java: "checkingJava",
  started: "minecraftStarted",
  closed: "minecraftClosed",
  crashed: "minecraftCrashed"
};

const messageTranslations = {
  "Verificando os arquivos do Minecraft...": "checkingFiles",
  "Verificando e preparando o Java...": "checkingJava",
  "Minecraft iniciado! Bom jogo!": "minecraftStarted",
  "O Minecraft foi fechado.": "minecraftClosed",
  "O Minecraft fechou inesperadamente.": "minecraftCrashed"
};

const stageKey = stageTranslations[stage];

let translatedText;

if (rawText === "download-progress") {
  translatedText = translate("downloadProgress")
    .replace("{percent}", String(message.percent ?? 0))
    .replace("{downloaded}", String(message.downloadedText ?? ""))
    .replace("{total}", String(message.totalText ?? ""))
    .replace("{speed}", message.speedText || "");
} else if (rawText.startsWith("preparing-download:")) {
  const count = rawText.split(":")[1];

  translatedText = translate("preparingDownloadFiles")
    .replace("{count}", count);
} else if (rawText === "preparing") {
  translatedText = translate("preparingMinecraft");
} else if (rawText === "preparing-download") {
  translatedText = translate("preparingDownload");
} else if (rawText === "downloads-completed") {
  translatedText = translate("downloadsCompleted");
  } else if (rawText.startsWith("Grupo de downloads concluído:")) {
  const percent = rawText.match(/\d+(?:[.,]\d+)?/);
  translatedText = translate("downloadGroupCompleted")
    .replace("{percent}", percent ? percent[0] : "0");
} else if (stageKey || messageTranslations[rawText]) {
  translatedText = translate(
    stageKey || messageTranslations[rawText]
  );
} else {
  translatedText = rawText || translate("preparingMinecraft");
}

const text = translatedText;
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
  stage === "closed" ||
  text === translate("minecraftStarted") ||
  text === translate("minecraftClosed");

const isError =
  stage === "error" ||
  stage === "crashed" ||
  /^erro\b/i.test(text) ||
  text === translate("minecraftCrashed");

  launchProgress.hidden = false;

  launchProgress.classList.remove(
    "complete",
    "error",
    "indeterminate"
  );

  if (progressLabel) {
    progressLabel.textContent = translatedText;
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
        `${Math.round(percent)}${translate("percentCompleted")}`
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
      progressPercent.textContent = translate("completed");
    }

    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", "100");
      progressTrack.setAttribute(
        "aria-valuetext",
        translate("initializationCompleted")
      );
    }
  } else if (isError) {
    launchProgress.classList.remove("indeterminate");
    launchProgress.classList.add("error");

    if (progressPercent) {
      progressPercent.textContent = translate("failed");
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
    progressLabel.textContent = translate("preparingMinecraft");
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
      translate("preparingMinecraft")
    );
  }

  setStatus(translate("launcherReady"));
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
    const page = button.dataset.page;

    navigateTo(page);

    if (page === "skins") {
  loadSavedSkins();
}

if (page === "mods") {
  scheduleModsSearch();
}
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
    editButton.textContent = translate("edit");
    editButton.addEventListener("click", () => {
      editProfile(profile.id);
    });

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "secondary-button";
    selectButton.textContent = translate("select");

    selectButton.addEventListener("click", () => {
      if (homeProfile) homeProfile.value = profile.id;
      if (modsProfile) modsProfile.value = profile.id;
      if (settingsProfile) settingsProfile.value = profile.id;

      updateModsInfo();
      loadProfileSettings();
      navigateTo("home");

      setStatus(
  translate("installationSelected").replace("{name}", profile.name)
);
    });

    const manageModsButton = document.createElement("button");
    manageModsButton.type = "button";
    manageModsButton.className = "secondary-button";
    manageModsButton.textContent = translate("manageMods");

    manageModsButton.addEventListener("click", () => {
      openModManager(profile.id);
    });


    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button";
    deleteButton.textContent = translate("delete");

    deleteButton.addEventListener("click", () => {
      deleteProfile(profile.id);
    });


  actions.append(
    editButton,
    selectButton,
    manageModsButton,
    deleteButton
);

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
    saveProfileButton.textContent = translate("createInstallation");
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

  saveProfileButton.textContent = translate("saveChanges");
  cancelProfileButton.hidden = false;

  navigateTo("versions");
  profileName.focus();
}

function showConfirmModal({
  title,
  message,
  confirmText = "Confirmar"
}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("deleteSkinModal");
    const titleElement = document.getElementById("deleteSkinTitle");
    const messageElement = document.getElementById("deleteSkinMessage");
    const cancelButton = document.getElementById("cancelDeleteSkin");
    const confirmButton = document.getElementById("confirmDeleteSkin");

    if (
      !modal ||
      !titleElement ||
      !messageElement ||
      !cancelButton ||
      !confirmButton
    ) {
      console.error("[CobbleLauncher] Painel de confirmação não encontrado.");
      resolve(false);
      return;
    }

    titleElement.textContent = title;
    messageElement.textContent = message;
    confirmButton.textContent = confirmText;

    const finish = (confirmed) => {
      modal.hidden = true;
      cancelButton.removeEventListener("click", onCancel);
      confirmButton.removeEventListener("click", onConfirm);
      resolve(confirmed);
    };

    const onCancel = () => finish(false);
    const onConfirm = () => finish(true);

    cancelButton.addEventListener("click", onCancel);
    confirmButton.addEventListener("click", onConfirm);

    modal.hidden = false;
    cancelButton.focus();
  });
}

async function deleteProfile(id) {
  const profile = getProfile(id);
  if (!profile) return;

  const confirmed = await showConfirmModal({
  title: translate("deleteInstallationTitle"),
  message: translate("deleteInstallationMessage").replace(
    "{name}",
    profile.name
  ),
  confirmText: translate("confirmDeleteInstallation")
});

  if (!confirmed) return;

  try {
    await window.cobble.deleteProfile(id);

    if (profileId?.value === id) {
      resetProfileForm();
    }

    await loadProfiles();

    setStatus(
  translate("installationDeleted").replace("{name}", profile.name)
);
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

    setStatus(
  translate("installationSaved").replace("{name}", saved.name)
);
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
      javaStatus.textContent = translate("javaValidationUnavailable");
    }

    return;
  }

  const candidate = javaPath.value.trim();

  validateJavaButton.disabled = true;

  if (javaStatus) {
    javaStatus.textContent = translate("javaCheckingPath");
  }

  try {
    const result = await window.cobble.validateJava(candidate);

    validatedJavaPath = result.path;

    if (javaStatus) {
      javaStatus.textContent = translate("javaExecutableFound");
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
    setStatus(translate("selectInstallationFirst"));
    return;
  }

  const maxRam = Number(maxRamInput.value);

  if (
    !Number.isInteger(maxRam) ||
    maxRam < 1024 ||
    maxRam > 65536
  ) {
    setStatus(translate("ramRangeError"));
    return;
  }

  const mode = javaMode.value;
  const chosenPath = javaPath.value.trim();

  if (
    mode === "manual" &&
    (!chosenPath || chosenPath !== validatedJavaPath)
  ) {
    setStatus(translate("validateJavaBeforeSaving"));
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

    setStatus(translate("settingsSaved"));
  } catch (error) {
    console.error("[Configurações] Erro ao salvar:", error);

    setStatus(
      `${translate("saveSettingsError")}${friendlyError(error)}`
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
    modsInfo.textContent = translate("modsCreateInstallation");

    return;
  }

  if (profile.loader === "vanilla") {
    modsInfo.textContent = translate("modsVanillaInfo")
  .replace("{name}", profile.name);
  } else {
    modsInfo.textContent = translate("modsLoaderInfo")
  .replace("{name}", profile.name)
  .replace("{loader}", profile.loader)
  .replace("{version}", profile.minecraftVersion);
  }
}

const modsSearchQuery = $("mods-search-query");
const modsSearchStatus = $("mods-search-status");
const modsResults = $("mods-results");
const modsPagination = $("mods-pagination");
const modsCategories = $("mods-categories");

const MODS_PAGE_SIZE = 20;
let modsSearchRequest = 0;
let modsSearchTimer = null;
let modsCurrentPage = 1;
let modsTotalPages = 0;
let modsCategory = "mod";

let modsPlatform = "modrinth";

const modsPlatforms = $("mods-platforms");

modsPlatforms?.querySelectorAll("[data-platform]").forEach((button) => {
  button.addEventListener("click", () => {
    modsPlatform = button.dataset.platform;

    modsPlatforms.querySelectorAll("[data-platform]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    scheduleModsSearch(true);
  });
});

const validModCategories = [
  "mod",
  "resourcepack",
  "datapack",
  "modpack",
  "shader"
];

function formatModDownloads(downloads) {
  const count = Number(downloads);

  if (!Number.isFinite(count) || count < 0) {
    return translate("downloadsUnavailable");
  }

  return translate("downloadCount").replace(
  "{count}",
  count.toLocaleString(
    getCurrentLanguage() === "en-US" ? "en-US" : "pt-BR"
  )
);
}

function showModsMessage(message) {
  if (!modsResults) return;

  modsResults.replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.className = "hint";
  paragraph.textContent = message;
  modsResults.appendChild(paragraph);
}


async function renderModResults(mods) {
  if (!modsResults) return;

  modsResults.replaceChildren();

  const selectedProfileId = modsProfile?.value;
  const selectedCategory = modsCategory;

  let installedIds = new Set();

  // Consulta os mods instalados no perfil selecionado.
  if (
    selectedCategory === "mod" &&
    selectedProfileId &&
    window.cobble?.getInstalledMods
  ) {
    try {
      const installedMods =
        await window.cobble.getInstalledMods(selectedProfileId);

      installedIds = new Set(
        installedMods.map((item) => item.projectId)
      );
    } catch (error) {
      console.error(
        "[Mods instalados]",
        error
      );
    }
  }

  // Evita exibir resultados antigos se o perfil ou a categoria mudar.
  if (
    selectedProfileId !== modsProfile?.value ||
    selectedCategory !== modsCategory
  ) {
    return;
  }

  for (const mod of mods) {
    const card = document.createElement("article");
    card.className = "mod-card";

    const main = document.createElement("div");
    main.className = "mod-card-main";

    const icon = document.createElement("img");
    icon.className = "mod-icon";
    icon.alt = "";
    icon.loading = "lazy";

    const iconUrl = String(mod.iconUrl || "");

    if (iconUrl.startsWith("https://")) {
      icon.src = iconUrl;
    } else {
      icon.hidden = true;
    }

    icon.addEventListener("error", () => {
      icon.hidden = true;
    });

    const details = document.createElement("div");
    details.className = "mod-details";

    const title = document.createElement("h3");
    title.textContent = mod.title || mod.slug || translate("unnamedMod");

    const description = document.createElement("p");
    description.className = "mod-description";
    description.textContent =
      mod.description || translate("noModDescription");

    const author = document.createElement("p");
    author.className = "mod-meta";
    author.textContent =
      `${mod.author || translate("unknownAuthor")} · ` +
formatModDownloads(mod.downloads);

    details.append(title, description, author);
    main.append(icon, details);

    const addButton = document.createElement("button");
    addButton.className = "mod-add-button";
    addButton.type = "button";

const isModpack = selectedCategory === "modpack";

const installedId =
  modsPlatform === "curseforge"
    ? `curseforge-${mod.id}`
    : mod.id;

const isInstalled =
  !isModpack && installedIds.has(installedId);

    function setDownloadedState() {
      addButton.textContent = translate("downloaded");
      addButton.classList.add("downloaded");
      addButton.disabled = true;
      addButton.setAttribute("aria-label", `${mod.title} — Baixado`);
    }

    if (isInstalled) {
      setDownloadedState();
    } else {
      addButton.textContent = isModpack
  ? translate("install")
  : translate("download");
    }

    addButton.addEventListener("click", async () => {
      if (addButton.disabled) return;

    const installFunction =
      modsPlatform === "curseforge"
        ? window.cobble?.installCurseForgeMod
        : window.cobble?.installModrinthContent;

    if (!installFunction) {
      modsSearchStatus.textContent = translate("modInstallationUnavailable");
      return;
    }

      const profile = getProfile(modsProfile?.value);

      if (!profile) {
        modsSearchStatus.textContent = translate("createInstallationFirst");
        return;
      }

      const categoryAtClick = modsCategory;
      const profileIdAtClick = profile.id;

      addButton.disabled = true;

      modsSearchStatus.textContent = isModpack
  ? translate("preparingModpack").replace("{name}", mod.title)
  : translate("downloadingMod").replace("{name}", mod.title);
      try {
const result = await installFunction(
  modsPlatform === "curseforge"
    ? {
        modId: Number(mod.id),
        profileId: profileIdAtClick
      }
    : {
        projectId: mod.id,
        category: categoryAtClick,
        profileId: profileIdAtClick
      }
);
        if (categoryAtClick === "modpack" && result.profile) {
          await loadProfiles();

          const newProfile = result.profile;

          if (homeProfile) homeProfile.value = newProfile.id;
          if (modsProfile) modsProfile.value = newProfile.id;
          if (settingsProfile) settingsProfile.value = newProfile.id;

          updateModsInfo();
          loadProfileSettings();

          modsSearchStatus.textContent = translate("modpackInstalledNewProfile")
  .replace("{name}", newProfile.name);

          scheduleModsSearch(true);
          return;
        }

        modsSearchStatus.textContent = translate("modInstalledProfile")
  .replace("{filename}", result.filename)
  .replace("{profile}", profile.name);

        // Só marca como baixado se ainda estivermos no mesmo perfil
        // e na mesma categoria em que a instalação começou.
        if (
          modsProfile?.value === profileIdAtClick &&
          modsCategory === categoryAtClick
        ) {
          setDownloadedState();
        } else {
          addButton.disabled = false;
        }

} catch (error) {
  console.error("[Instalação de mod]", error);

  const errorMessage = String(error?.message || error || "");

  if (
    errorMessage.includes("parece já estar instalado") ||
    errorMessage.includes("já está instalado neste perfil")
  ) {
    modsSearchStatus.textContent =
      "Este mod já está instalado neste perfil.";

    showModNotice(
  translate("modAlreadyInstalled"),
  translate("modAlreadyInstalledTitle")
);
  } else if (
    modsPlatform === "curseforge" &&
    categoryAtClick === "mod"
  ) {
    modsSearchStatus.textContent =
  translate("curseForgeInstallFailed");

showModNotice(
  translate("curseForgeInstallFailed"),
  translate("installFailedTitle"),
  {
    actionLabel: translate("installViaModrinth"),
    closeLabel: translate("gotIt"),
        onAction: async () => {
          try {
            modsSearchStatus.textContent =
              translate("searchingModrinthMod");

            const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

let matchingMod = null;

if (normalize(mod.title).includes("entity culling")) {
  matchingMod = {
    id: "NNAgCjsB",
    title: "Entity Culling"
  };
} else {
  const result = await window.cobble.searchMods({
    query: mod.title,
    minecraftVersion: profile.minecraftVersion,
    loader: profile.loader,
    category: "mod",
    offset: 0
  });

  const hits = result?.hits || [];

  matchingMod = hits.find(
    (item) => normalize(item.title) === normalize(mod.title)
  );
}

if (!matchingMod) {
  showModNotice(
  translate("modrinthModNotFound"),
  translate("modNotFoundTitle")
);
  return;
}

await window.cobble.installModrinthContent({
  projectId: matchingMod.id,
  category: "mod",
  profileId: profileIdAtClick
});

            modsSearchStatus.textContent =
              translate("modrinthInstallSuccess");

            if (
              modsProfile?.value === profileIdAtClick &&
              modsCategory === categoryAtClick
            ) {
              setDownloadedState();
            }

            scheduleModsSearch(true);
          } catch (fallbackError) {
            console.error(
              "[Instalação pelo Modrinth]",
              fallbackError
            );

            const fallbackMessage = friendlyError(fallbackError);

            const translatedFallbackError =
              /este mod já está instalado neste perfil|this mod is already installed in this profile|este mod ya está instalado en este perfil/i.test(
                fallbackMessage
        )
                ? translate("modAlreadyInstalled")
                : fallbackMessage;

showModNotice(
  translate("modrinthInstallFailed").replace(
    "{error}",
    translatedFallbackError
  ),
  translate("installFailedTitle")
);
          }
        }
      }
    );
  } else {
    modsSearchStatus.textContent = translate("installationFailed")
      .replace("{error}", friendlyError(error));
  }

  addButton.disabled = false;
}
    });

    card.append(main, addButton);
    modsResults.appendChild(card);
  }
}


function renderModsPagination() {
  if (!modsPagination) return;

  modsPagination.replaceChildren();

  if (modsTotalPages <= 1) {
    modsPagination.hidden = true;
    return;
  }

  modsPagination.hidden = false;

  function addPageButton(label, page, options = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "mods-page-button";
    button.textContent = label;
    button.disabled =
      Boolean(options.disabled) ||
      page < 1 ||
      page > modsTotalPages;

    if (options.active) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    if (options.disabled) {
      button.setAttribute("aria-disabled", "true");
    }

    button.addEventListener("click", () => {
      if (button.disabled || page === modsCurrentPage) return;

      modsCurrentPage = page;
      searchModsNow();
    });

    modsPagination.appendChild(button);
  }

  function addEllipsis() {
    const span = document.createElement("span");

    span.className = "mods-page-ellipsis";
    span.textContent = "…";
    span.setAttribute("aria-hidden", "true");

    modsPagination.appendChild(span);
  }

  // Página anterior
  addPageButton("‹", modsCurrentPage - 1, {
    disabled: modsCurrentPage === 1
  });

  // Mostra as primeiras páginas, a atual e a última.
  const pages = new Set([
    1,
    2,
    3,
    modsTotalPages
  ]);

  for (
    let page = modsCurrentPage - 1;
    page <= modsCurrentPage + 1;
    page++
  ) {
    if (page >= 1 && page <= modsTotalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= modsTotalPages)
    .sort((a, b) => a - b);

  let previousPage = 0;

  for (const page of sortedPages) {
    if (previousPage && page - previousPage > 1) {
      addEllipsis();
    }

    addPageButton(String(page), page, {
      active: page === modsCurrentPage
    });

    previousPage = page;
  }

  // Próxima página
  addPageButton("›", modsCurrentPage + 1, {
    disabled: modsCurrentPage === modsTotalPages
  });
}

async function searchModsNow() {
  const requestId = ++modsSearchRequest;
  const query = modsSearchQuery?.value.trim() || "";
  const profile = getProfile(modsProfile?.value);

  if (!modsResults || !modsSearchStatus || !modsPagination) {
    return;
  }

  if (!profile) {
  modsSearchStatus.textContent =
    translate("selectInstallationForMods");

  modsPagination.hidden = true;

  showModsMessage(
    translate("noInstallationSelected")
  );

  return;
}

  if (modsCategory === "mod" && profile.loader === "vanilla") {
    modsSearchStatus.textContent =
      translate("modsNeedLoader");
    modsPagination.hidden = true;
    showModsMessage(
      translate("selectModLoader")
    );
    return;
  }

  if (query.length === 1) {
    modsSearchStatus.textContent = "";
    modsPagination.hidden = true;
    showModsMessage(translate("searchMinCharacters"));
    return;
  }

  if (!window.cobble?.searchMods) {
    modsSearchStatus.textContent = translate("searchUnavailable");
    showModsMessage(translate("checkMainProcess"));
    return;
  }

  modsSearchStatus.textContent = translate("loadingResults");
  showModsMessage(translate("searchingModrinth"));

  try {

let result;

if (modsPlatform === "curseforge") {
  const curseForgeResult = await window.cobble.searchCurseForgeMods({
    query: query || "minecraft",
    gameVersion: profile.minecraftVersion,
    loader: profile.loader,
    index: (modsCurrentPage - 1) * MODS_PAGE_SIZE
  });

  if (!curseForgeResult?.success) {
    throw new Error(
      curseForgeResult?.error || "Falha na pesquisa do CurseForge."
    );
  }

  const curseForgeHits = curseForgeResult.data || [];

  result = {
    hits: curseForgeHits.map((mod) => ({
      id: String(mod.id),
      slug: mod.slug,
      title: mod.name,
      description: mod.summary,
      author: "CurseForge",
      downloads: mod.downloads,
      iconUrl: mod.iconUrl,
      projectType: "mod"
    })),
    totalHits: curseForgeResult.pagination?.totalCount ?? curseForgeHits.length
  };
} else {
  result = await window.cobble.searchMods({
    query,
    minecraftVersion: profile.minecraftVersion,
    loader: profile.loader,
    category: modsCategory,
    offset: (modsCurrentPage - 1) * MODS_PAGE_SIZE
  });
}

    if (requestId !== modsSearchRequest) return;

    const hits = Array.isArray(result?.hits) ? result.hits : [];

    modsTotalPages = Math.ceil(
      (Number(result?.totalHits) || 0) / MODS_PAGE_SIZE
    );

    if (modsTotalPages > 0 && modsCurrentPage > modsTotalPages) {
      modsCurrentPage = modsTotalPages;
      searchModsNow();
      return;
    }

    if (hits.length === 0) {
      modsTotalPages = 0;
      modsPagination.hidden = true;
      modsSearchStatus.textContent = translate("noResultsFound");
      showModsMessage(translate("tryAnotherSearch"));
      return;
    }

    const totalHits = Number(result.totalHits) || hits.length;

    modsSearchStatus.textContent = translate("searchResultsStatus")
  .replace(
    "{count}",
    totalHits.toLocaleString(getCurrentLanguage())
  )
  .replace("{current}", String(modsCurrentPage))
  .replace("{total}", String(modsTotalPages));

    await renderModResults(hits);

if (requestId !== modsSearchRequest) return;

renderModsPagination();
  } catch (error) {
    if (requestId !== modsSearchRequest) return;

    console.error("[Modrinth] Erro:", error);
    modsSearchStatus.textContent = translate("searchFailed");
    modsPagination.hidden = true;
    showModsMessage(translate("checkConnectionRetry"));
  }
}

function scheduleModsSearch(resetPage = false) {
  clearTimeout(modsSearchTimer);

  if (resetPage) {
    modsCurrentPage = 1;
  }

  ++modsSearchRequest;

  modsSearchTimer = setTimeout(() => {
    searchModsNow();
  }, 350);
}

modsSearchQuery?.addEventListener("input", () => {
  scheduleModsSearch(true);
});

modsCategories?.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    if (!validModCategories.includes(category)) return;

    modsCategory = category;
    modsCurrentPage = 1;

    modsCategories.querySelectorAll("[data-category]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    scheduleModsSearch(true);
  });
});

modsProfile?.addEventListener("change", () => {
  updateModsInfo();
  scheduleModsSearch(true);
});


// ==================================================
// LOGIN MICROSOFT
// ==================================================

accountButton?.addEventListener("click", async () => {
  if (loggedIn || loginInProgress) return;

  if (!window.cobble?.loginMicrosoft) {
    setStatus(translate("loginCommunicationError"));
    return;
  }

  loginInProgress = true;
  accountButton.disabled = true;

  setStatus(translate("openingMicrosoftLogin"));

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
    setStatus(translate("loginCommunicationError"));
    return;
  }

  logoutButton.disabled = true;

  try {
    await window.cobble.logoutMicrosoft();

    setLoggedOut();
    setStatus(translate("signedOutMicrosoft"));
  } catch (error) {
    console.error("[Logout] Erro:", error);

    setStatus(friendlyError(error));
  } finally {
    logoutButton.disabled = false;
  }
});

async function restoreSession() {
  if (!window.cobble?.restoreSession) {
    setStatus(translate("signInMicrosoftToPlay"));
    return;
  }

  if (accountButton) {
    accountButton.disabled = true;
  }

  setStatus(translate("checkingSavedAccount"));

  try {
    const account = await window.cobble.restoreSession();

    if (account) {
  setAccount(account);

  if (typeof loadAccountCapes === "function") {
    await loadAccountCapes();
  }
} else {
      setLoggedOut();
      setStatus(translate("signInMicrosoftToPlay"));
    }
  } catch (error) {
    console.error("[Sessão] Erro ao restaurar:", error);

    setLoggedOut();
    setStatus(translate("signInMicrosoftToPlay"));
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
    setStatus(translate("signInMicrosoftFirst"));
    return;
  }

  if (launchInProgress || gameStarted) return;

  const profile = getSelectedProfile();

  if (!profile) {
    setStatus(translate("createInstallationFirst"));
    navigateTo("versions");
    return;
  }

  if (!window.cobble?.installAndLaunch) {
    setStatus(translate("launcherUnavailable"));

    return;
  }

  launchInProgress = true;
  gameStarted = false;

  resetLaunchProgress();

  playButton.disabled = true;

  const preparingMessage = `${translate("preparingMinecraft")} (${profile.name})`;

  setStatus(preparingMessage);

  updateLaunchProgress({
    stage: "preparing",
    message: preparingMessage
});

  try {
    await window.cobble.installAndLaunch({
      profileId: profile.id
    });
  } catch (error) {
    console.error("[Minecraft] Erro ao iniciar:", error);

    const message = friendlyError(error);
    const progressMessage = `${translate("launchError")}: ${message}`;

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
  ? String(message.message || translate("preparingMinecraft"))
  : String(message || translate("preparingMinecraft"));

    const stage = isObject
      ? String(message.stage || "")
      : "";

    updateLaunchProgress(message);

const statusText =
  document.getElementById("progress-label")?.textContent || text;

setStatus(statusText);

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


function createModManager() {
  const overlay = document.createElement("div");
  overlay.className = "mod-manager-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <section
      class="mod-manager"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-manager-title"
    >
      <header class="mod-manager-header">
        <div>
          <h2 id="mod-manager-title" data-i18n="manageMods">Gerenciar mods</h2>
          <p id="mod-manager-profile"></p>
        </div>
        <button
  type="button"
  class="secondary-button"
  data-close-mod-manager
  data-i18n="close"
>
  Fechar
</button>
      </header>
      <div class="mod-manager-list" id="mod-manager-list">
        <p class="mod-manager-empty" data-i18n="loadingMods">Carregando mods...</p>
      </div>
    </section>
  `;

  document.body.append(overlay);

  overlay.addEventListener("click", (event) => {
    if (
      event.target === overlay ||
      event.target.closest("[data-close-mod-manager]")
    ) {
      overlay.hidden = true;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      overlay.hidden = true;
    }
  });

  return overlay;
}

const modManagerOverlay = createModManager();


async function openModManager(profileId) {
  const profile = getProfile(profileId);

  if (!profile) {
    setStatus(translate("installationNotFound"));
    return;
  }

  modManagerOverlay.hidden = false;

  const profileLabel = document.getElementById(
    "mod-manager-profile"
  );

  if (profileLabel) {
    profileLabel.textContent =
      `${profile.name} · Minecraft ${profile.minecraftVersion}`;
  }

  await renderManagedMods(profileId);
}

async function renderManagedMods(profileId) {
  const list = document.getElementById("mod-manager-list");

  if (!list) return;

  list.replaceChildren();

  const loading = document.createElement("p");
  loading.className = "mod-manager-empty";
  loading.textContent = translate("loadingMods");
  list.append(loading);

  try {
    const mods = await window.cobble.getInstalledMods(profileId);

    list.replaceChildren();

    if (!Array.isArray(mods) || mods.length === 0) {
      const empty = document.createElement("p");
      empty.className = "mod-manager-empty";
      empty.textContent = translate("noInstalledMods");
      list.append(empty);
      return;
    }

    for (const mod of mods) {
      const item = document.createElement("article");
      item.className = "mod-manager-item";

      const icon = document.createElement("div");
      icon.className = "mod-manager-icon";
      icon.textContent = "M";

      if (mod.iconUrl) {
        try {
          const iconUrl = new URL(mod.iconUrl);

          if (iconUrl.protocol === "https:" || iconUrl.protocol === "http:") {
            const image = document.createElement("img");
            image.src = iconUrl.href;
            image.alt = "";
            image.width = 52;
            image.height = 52;
            image.style.objectFit = "cover";

            image.addEventListener("error", () => {
              image.remove();
            });

            icon.replaceChildren(image);
          }
        } catch {
          // Mantém o ícone padrão quando a URL não é válida.
        }
      }

      const info = document.createElement("div");
      info.className = "mod-manager-info";

      const title = document.createElement("h3");
      title.textContent = mod.name || translate("unnamedMod");

      const description = document.createElement("p");
description.textContent =
  mod.description || translate("noModDescription");

      const state = document.createElement("p");
      state.textContent = mod.enabled
  ? translate("activated")
  : translate("deactivated");

      info.append(title, description, state);

      const actions = document.createElement("div");
      actions.className = "mod-manager-actions";

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "secondary-button";
      toggleButton.textContent = mod.enabled
  ? translate("disable")
  : translate("enable");

      toggleButton.addEventListener("click", async () => {
        toggleButton.disabled = true;

        try {
          await window.cobble.toggleInstalledMod({
            profileId,
            filename: mod.filename,
            enabled: !mod.enabled
          });

          await renderManagedMods(profileId);
        } catch (error) {
         setStatus(
  translate("toggleModError").replace(
    "{error}",
    friendlyError(error)
  )
);
          toggleButton.disabled = false;
        }
      });


      const removeButton = document.createElement("button");
removeButton.type = "button";
removeButton.className = "secondary-button";
removeButton.textContent = translate("remove");

removeButton.addEventListener("click", async () => {
  const modName = mod.name || mod.filename;

  const confirmed = await showConfirmModal({
    title: translate("removeModTitle"),
    message: translate("removeModMessage").replace(
      "{name}",
      modName
    ),
    confirmText: translate("confirmRemoveMod")
  });

  if (!confirmed) return;

        removeButton.disabled = true;

        try {
          await window.cobble.removeInstalledMod({
            profileId,
            filename: mod.filename
          });

          await renderManagedMods(profileId);
        } catch (error) {
          setStatus(
  translate("removeModError").replace(
    "{error}",
    friendlyError(error)
  )
);
          removeButton.disabled = false;
        }
      });

      actions.append(toggleButton, removeButton);
      item.append(icon, info, actions);
      list.append(item);
    }
  } catch (error) {
    console.error("[Gerenciador de mods] Erro:", error);

    list.replaceChildren();

    const message = document.createElement("p");
    message.className = "mod-manager-empty";
    message.textContent = translate("loadModsError").replace(
  "{error}",
  friendlyError(error)
);

    list.append(message);
  }
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

  loadDefaultSkinPortraits().catch((error) => {
  console.error("Erro ao carregar as skins padrão:", error);
});

  loadProfileSettings();
  updateModsInfo();
  scheduleModsSearch(true);
}

initialize();



async function generateSkinPortrait(skin) {
  const canvas = document.createElement("canvas");

  const viewer = new window.skinview3d.SkinViewer({
    canvas,
    width: 256,
    height: 384,
    backgroundAlpha: 0
  });

  try {
    await viewer.loadSkin(skin.data, {
      model: skin.model === "alex" ? "slim" : "default"
    });

    viewer.controls.enableRotate = false;
    viewer.controls.enableZoom = false;

    viewer.playerObject.rotation.set(0, 0, 0);

    viewer.camera.position.set(0, 0, 40);
    viewer.camera.lookAt(0, 0, 0);
    viewer.render();

    return canvas.toDataURL("image/png");
  } finally {
    viewer.dispose();
  }
}

async function loadDefaultSkinPortraits() {
  const defaultSkins = [
    {
      name: "Steve",
      model: "steve",
      path: "assets/skins/steve.png",
      elementId: "stevePortrait"
    },
    {
      name: "Alex",
      model: "alex",
      path: "assets/skins/alex.png",
      elementId: "alexPortrait"
    }
  ];

  for (const skin of defaultSkins) {
    const response = await fetch(skin.path);

    if (!response.ok) {
      throw new Error(
        `Não foi possível carregar a skin: ${skin.name}`
      );
    }

    const blob = await response.blob();

    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(blob);
    });

    const portrait = await generateSkinPortrait({
      data,
      model: skin.model
    });

    const image = document.getElementById(skin.elementId);

    if (image) {
      image.src = portrait;
    }
  }
}

let selectedAccountSkin = null;
let renamingSkin = null;
let pendingSkinFile = null;

const importSkinButton = document.getElementById("importSkinButton");
const skinFileInput = document.getElementById("skinFileInput");

importSkinButton?.addEventListener("click", () => {
  skinFileInput?.click();
});

document.querySelectorAll(".skin-select").forEach((button) => {
  button.addEventListener("click", () => {
    const model = button.dataset.skin;

    if (model !== "steve" && model !== "alex") {
      return;
    }

    selectedAccountSkin = {
      name: model,
      model,
      isDefault: true
    };

    document.querySelectorAll(".skin-card").forEach((card) => {
      card.classList.remove("selected");
    });

    button.closest(".skin-card")?.classList.add("selected");

    const accountSkinUpdateStatus = document.getElementById(
      "accountSkinUpdateStatus"
    );

    if (accountSkinUpdateStatus) {
  const skinName = model === "alex" ? "Alex" : "Steve";

  accountSkinUpdateStatus.textContent = translate("skinSelectedAccount")
    .replace("{name}", skinName);
}
  });
});

skinFileInput?.addEventListener("change", () => {
  const file = skinFileInput.files?.[0];

  if (!file) return;

  if (file.type !== "image/png") {
    skinStatus.textContent = translate("invalidSkinPng");
    skinFileInput.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    skinStatus.textContent = translate("skinTooLarge");
    skinFileInput.value = "";
    return;
  }

  pendingSkinFile = file;
  renamingSkin = null;

  skinNameInput.value = file.name.replace(/\.png$/i, "");
  confirmSkinNameButton.textContent = translate("importSkin");
  skinNameModal.hidden = false;
  skinNameInput.focus();
  skinNameInput.select();
});

async function loadSavedSkins() {
  const importedSkinsGrid = document.getElementById("importedSkinsGrid");
  const skinStatus = document.getElementById("skinStatus");

  if (!importedSkinsGrid || !window.cobble?.getSavedSkins) {
    return;
  }

  try {
    const skins = await window.cobble.getSavedSkins();

    importedSkinsGrid.replaceChildren();

    if (skins.length === 0) {
      const message = document.createElement("p");
      message.className = "hint";
      message.id = "emptySkinsMessage";
      message.textContent = translate("noSkinsImported");
      importedSkinsGrid.appendChild(message);
      return;
    }

    for (const skin of skins) {
      const skinCard = document.createElement("article");
      skinCard.className = "skin-card";
      skinCard.addEventListener("click", (event) => {
  if (event.target.closest("button, select, label")) {
    return;
  }

  selectedAccountSkin = {
  name: skin.name,
  model: skin.model === "alex" ? "alex" : "steve",
  data: skin.data
};

  document
  .querySelectorAll(".skin-card")
  .forEach((card) => card.classList.remove("selected"));

  skinCard.classList.add("selected");

  const updateStatus = document.getElementById("accountSkinUpdateStatus");


if (updateStatus) {
  updateStatus.textContent = translate("skinSelectedAccount")
    .replace("{name}", skin.name.replace(/\.png$/i, ""));
}
});


      const skinPreview = document.createElement("div");
      skinPreview.className = "skin-preview";

      const preview = document.createElement("img");
preview.alt = `Personagem com a skin ${skin.name}`;
preview.className = "skin-portrait";
preview.src = "";

skinPreview.appendChild(preview);

generateSkinPortrait(skin)
  .then((image) => {
    preview.src = image;
  })
  .catch((error) => {
    console.error("Erro ao gerar imagem 2D da skin:", error);
    console.error(error.stack || error.message || error);
    preview.alt = "Não foi possível gerar a imagem da skin";
  });

const skinName = document.createElement("h3");
skinName.textContent = skin.name.replace(/\.png$/i, "");

const modelLabel = document.createElement("label");
modelLabel.textContent = "Modelo da skin";

const modelSelect = document.createElement("select");
modelSelect.className = "skin-model-select";

const steveOption = document.createElement("option");
steveOption.value = "steve";
steveOption.textContent = translate("steveModel");

const alexOption = document.createElement("option");
alexOption.value = "alex";
alexOption.textContent = translate("alexModel");

modelSelect.append(steveOption, alexOption);
modelSelect.value = skin.model === "alex" ? "alex" : "steve";

modelSelect.addEventListener("change", async () => {
  modelSelect.disabled = true;

  try {
    const result = await window.cobble.setSkinModel({
      name: skin.name,
      model: modelSelect.value
    });

    if (!result?.success) {
      throw new Error("Não foi possível salvar o modelo.");
    }

    skin.model = modelSelect.value;

    if (skinStatus) {
      skinStatus.textContent = translate("skinModelSaved")
  .replace("{name}", skin.name.replace(/\.png$/i, ""));
    }
  } catch (error) {
    modelSelect.value = skin.model === "alex" ? "alex" : "steve";

    if (skinStatus) {
      skinStatus.textContent =
       error.message || translate("saveSkinModelFailed");
    }

    console.error("Erro ao salvar modelo da skin:", error);
  } finally {
    modelSelect.disabled = false;
  }
});

const modelControls = document.createElement("div");
modelControls.className = "skin-model-controls";
modelControls.append(modelLabel, modelSelect);

const renameButton = document.createElement("button");
renameButton.type = "button";
renameButton.className = "skin-rename-button";
renameButton.innerHTML = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
  </svg>
  <span>${translate("renameSkin")}</span>
`;

renameButton.addEventListener("click", () => {
  renamingSkin = skin;
  pendingSkinFile = null;

  skinNameInput.value = skin.name.replace(/\.png$/i, "");
  confirmSkinNameButton.textContent = translate("saveSkinName");

  skinNameModal.hidden = false;
  skinNameInput.focus();
  skinNameInput.select();
});

const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.className = "button-danger";
deleteButton.textContent = translate("deleteSkinButton");

deleteButton.addEventListener("click", async () => {
  const skinDisplayName = skin.name.replace(/\.png$/i, "");

  const confirmed = await showConfirmModal({
    title: translate("deleteSkinTitle"),
    message: `A skin "${skinDisplayName}" será excluída permanentemente do CobbleLauncher.`,
    confirmText: translate("deleteSkinButton")
  });

  if (!confirmed) return;

  deleteButton.disabled = true;

  try {
    const result = await window.cobble.deleteSkin(skin.name);

    if (result?.success === false) {
      throw new Error("Não foi possível excluir a skin.");
    }

    if (selectedAccountSkin?.name === skin.name) {
      selectedAccountSkin = null;
    }

    await loadSavedSkins();

    if (skinStatus) {
      skinStatus.textContent =
        `Skin "${skinDisplayName}" excluída.`;
    }
  } catch (error) {
    console.error("Erro ao excluir skin:", error);

    if (skinStatus) {
      skinStatus.textContent =
        error.message || "Não foi possível excluir a skin.";
    }

    deleteButton.disabled = false;
  }
});

skinCard.append(
  skinPreview,
  skinName,
  modelControls,
  renameButton,
  deleteButton
);

importedSkinsGrid.appendChild(skinCard);
}

} catch (error) {
  console.error("Erro ao carregar skins salvas:", error);

  if (skinStatus) {
    skinStatus.textContent =
      error.message || "Não foi possível carregar as skins salvas.";
  }
}
}


cancelSkinNameButton.addEventListener("click", () => {
  pendingSkinFile = null;
  renamingSkin = null;
  skinNameModal.hidden = true;
  skinNameInput.value = "";
  skinFileInput.value = "";
  confirmSkinNameButton.textContent = translate("importSkin");
});

confirmSkinNameButton.addEventListener("click", async () => {
  const chosenName = skinNameInput.value.trim();

  if (!chosenName) {
    skinNameInput.focus();
    skinStatus.textContent = translate("skinNameRequired");
    return;
  }

  const safeName =
    chosenName
      .replace(/[^a-zA-Z0-9._ -]/g, "_")
      .replace(/\.png$/i, "") + ".png";

  confirmSkinNameButton.disabled = true;
  cancelSkinNameButton.disabled = true;

  try {
    if (renamingSkin) {
      const oldName = renamingSkin.name;

      if (safeName === oldName) {
        skinNameModal.hidden = true;
        renamingSkin = null;
        confirmSkinNameButton.textContent = translate("importSkin");
        return;
      }

      const wasSelected = selectedAccountSkin?.name === oldName;

      const result = await window.cobble.renameSkin({
        oldName,
        newName: safeName
      });

      if (!result?.success) {
        throw new Error("Não foi possível renomear a skin.");
      }

      if (wasSelected) {
        selectedAccountSkin.name = safeName;
      }

      renamingSkin = null;
      confirmSkinNameButton.textContent = translate("importSkin");
      skinNameModal.hidden = true;

      await loadSavedSkins();

      skinStatus.textContent =
        `Skin renomeada para ${safeName.replace(/\.png$/i, "")}.`;
    } else {
      if (!pendingSkinFile) return;

      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () =>
          reject(new Error("Não foi possível ler o arquivo."));

        reader.readAsDataURL(pendingSkinFile);
      });

      const result = await window.cobble.saveSkin({
        name: safeName,
        data
      });

      if (!result?.success) {
        throw new Error("Não foi possível salvar a skin.");
      }

      await loadSavedSkins();

      skinStatus.textContent = translate("skinSaved")
        .replace("{name}", safeName);
      skinNameModal.hidden = true;
      pendingSkinFile = null;
    }
  } catch (error) {
    console.error("Erro ao salvar ou renomear skin:", error);

    skinStatus.textContent =
      error.message || "Não foi possível salvar a skin.";
  } finally {
    confirmSkinNameButton.disabled = false;
    cancelSkinNameButton.disabled = false;
    skinFileInput.value = "";
  }
});


skinNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    confirmSkinNameButton.click();
  }

  if (event.key === "Escape") {
    cancelSkinNameButton.click();
  }
});

const updateAccountSkinButton = document.getElementById(
  "updateAccountSkinButton"
);

const accountSkinUpdateStatus = document.getElementById(
  "accountSkinUpdateStatus"
);

if (updateAccountSkinButton) {
  updateAccountSkinButton.addEventListener("click", async () => {
  if (!selectedAccountSkin) {
    accountSkinUpdateStatus.textContent =
      translate("selectSkinFirst");
    return;
  }

updateAccountSkinButton.disabled = true;
accountSkinUpdateStatus.textContent =
  translate("uploadingAccountSkin");

    try {
      const result = await window.cobble.updateAccountSkin(
  selectedAccountSkin
);

console.log("[Avatar] Upload concluído:", result?.success);
console.log("[Avatar] Imagem recebida:", Boolean(result?.skinData));
console.log(
  "[Avatar] Tamanho dos dados:",
  result?.skinData?.length
);

if (result?.success && result.skinData && accountAvatar) {
  try {
    const avatarData = await generateHeadAvatar(result.skinData);
    const avatarKey =
      `cobble-account-avatar-${accountName.textContent.toLowerCase()}`;

    localStorage.setItem(avatarKey, avatarData);
    console.log("[Avatar] Imagem gerada:", Boolean(avatarData));
    console.log("[Avatar] Tipo:", typeof avatarData);
    console.log("[Avatar] Início da URL:", avatarData.slice(0, 80));
    console.log("[Avatar] Comprimento da URL:", avatarData.length);
    console.log("[Avatar] URL válida:", avatarData.startsWith("data:image/png;base64,"));
    accountAvatar.onload = () => {
      console.log("[Avatar] Imagem carregada com sucesso.");
      accountAvatar.hidden = false;
    };

    accountAvatar.onerror = () => {
      console.error("[Avatar] O navegador não conseguiu exibir a imagem.");
    };

    accountAvatar.src = avatarData;
  } catch (error) {
    console.error("[Avatar] Falha ao gerar a imagem:", error);
  }
}

accountSkinUpdateStatus.textContent =
  translate(result.messageKey || "skinUpdatedSuccess");
} catch (error) {
  accountSkinUpdateStatus.textContent =
    error.message || translate("skinUpdateFailed");
} finally {
  updateAccountSkinButton.disabled = false;
}

  });
}

const capeGrid = document.getElementById("capeGrid");
const capeStatus = document.getElementById("capeStatus");
const refreshCapesButton = document.getElementById("refreshCapesButton");
const hideCapeButton = document.getElementById("hideCapeButton");

function createCapePreview(textureUrl) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 10;
      canvas.height = 16;

      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;

      // Recorta a área frontal da textura da capa.
      context.drawImage(
        image,
        1, 1, 10, 16,
        0, 0, 10, 16
      );

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => resolve(textureUrl);
    image.src = textureUrl;
  });
}

async function loadAccountCapes() {
  if (!capeGrid || !capeStatus) return;

  capeGrid.replaceChildren();
  capeStatus.textContent = translate("loadingCapes");

  try {
    const result = await window.cobble.getAccountCapes();
    const capes = Array.isArray(result) ? result : result?.capes;

    if (!Array.isArray(capes) || capes.length === 0) {
      capeStatus.textContent = translate("noCapesFound");
      return;
    }

    for (const cape of capes) {
      console.log(
  "[CobbleLauncher] Dados da capa:",
  JSON.stringify(cape, null, 2)
);


      const capeCard = document.createElement("article");
      capeCard.className = "skin-card";


    const capeImage = document.createElement("img");
    capeImage.alt = `Capa ${cape.alias || "do Minecraft"}`;
    capeImage.className = "cape-image";
    capeImage.loading = "lazy";

    const textureUrl = cape.url.replace(/^http:/i, "https:");

    createCapePreview(textureUrl).then((previewUrl) => {
      capeImage.src = previewUrl;
});


    const capeName = document.createElement("h3");
    capeName.textContent = cape.alias || "Capa do Minecraft";


      const capeInfo = document.createElement("p");
capeInfo.className = "hint";
capeInfo.textContent = translate(
  cape.state === "active" ? "activeCape" : "availableCape"
);

const selectButton = document.createElement("button");
selectButton.type = "button";
selectButton.className = "secondary-button";
selectButton.textContent = translate("useCape");
      selectButton.disabled = !cape.id;

      selectButton.addEventListener("click", async () => {
        try {
          capeStatus.textContent = translate("updatingCape");
selectButton.disabled = true;

await window.cobble.switchAccountCape(cape.id);
capeStatus.textContent = translate("capeUpdatedSuccess");

          await loadAccountCapes();
        } catch (error) {
          capeStatus.textContent = translate("switchCapeFailed");
        } finally {
          selectButton.disabled = false;
        }
      });

      capeCard.append(capeImage, capeName, capeInfo, selectButton);
      capeGrid.appendChild(capeCard);
    }

    capeStatus.textContent = translate("capesFound")
  .replace("{count}", capes.length);
  } catch (error) {
  console.error("[Capas] Falha ao carregar:", error);
  capeStatus.textContent = translate("loadCapesFailed");
}
}

refreshCapesButton?.addEventListener("click", loadAccountCapes);
document.querySelectorAll(".sidebar button, .sidebar a").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent.trim().toLowerCase();

    if (label === "capas") {
      loadAccountCapes();
    }
  });
});

hideCapeButton?.addEventListener("click", async () => {
  try {
    hideCapeButton.disabled = true;
    capeStatus.textContent = translate("hidingCape");

    const result = await window.cobble.hideAccountCape();

    capeStatus.textContent = translate("capeHiddenSuccess");

    await loadAccountCapes();
  } catch (error) {
    capeStatus.textContent = translate("hideCapeFailed");
  } finally {
    hideCapeButton.disabled = false;
  }
});


const languageSelect = document.getElementById("language-select");

if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    const language = languageSelect.value;

    localStorage.setItem(
      "cobblelauncher-language",
      language
    );

    window.cobble.setLanguage(getCurrentLanguage());
    applyTranslations();
  });
}

window.cobble.setLanguage(getCurrentLanguage());
applyTranslations();