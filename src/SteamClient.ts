// Non-exhaustive definition of the SteamClient that is available in the SP tab
// This object has a lot more properties/methods than are listed here
declare namespace SteamClient {
    const Apps: {
        GetAllShortcuts(): Promise<Shortcut[]>
    }
    const InstallFolder: {
        GetInstallFolders(): Promise<InstallFolder[]>
    }
}

type Shortcut = {
    appid: number
    data: {
        bIsApplication: true
        strAppName: string
        strSortAs: string
        strExePath: string
        strShortcutPath: string
        strArguments: string
        strIconPath: string
    }
}

type App = {
    nAppID: number
    strAppName: string
    strSortAs: string
    rtLastPlayed: number
    strUsedSize: string
    strDLCSize: string
    strWorkshopSize: string
    strStagedSize: string
}

type InstallFolder = {
    nFolderIndex: number
    strFolderPath: string
    strUserLabel: string
    strDriveName: string
    strCapacity: string
    strFreeSpace: string
    strUsedSize: string
    strDLCSize: string
    strWorkshopSize: string
    strStagedSize: string
    bIsDefaultFolder: boolean
    bIsMounted: boolean
    bIsFixed: boolean
    vecApps: App[]
}
