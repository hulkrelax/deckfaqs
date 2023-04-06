declare const enum DisplayStatus {
    Invalid = 0,
    Launching = 1,
    Uninstalling = 2,
    Installing = 3,
    Running = 4,
    Validating = 5,
    Updating = 6,
    Downloading = 7,
    Synchronizing = 8,
    ReadyToInstall = 9,
    ReadyToPreload = 10,
    ReadyToLaunch = 11,
    RegionRestricted = 12,
    PresaleOnly = 13,
    InvalidPlatform = 14,
    PreloadComplete = 16,
    BorrowerLocked = 17,
    UpdatePaused = 18,
    UpdateQueued = 19,
    UpdateRequired = 20,
    UpdateDisabled = 21,
    DownloadPaused = 22,
    DownloadQueued = 23,
    DownloadRequired = 24,
    DownloadDisabled = 25,
    LicensePending = 26,
    LicenseExpired = 27,
    AvailForFree = 28,
    AvailToBorrow = 29,
    AvailGuestPass = 30,
    Purchase = 31,
    Unavailable = 32,
    NotLaunchable = 33,
    CloudError = 34,
    CloudOutOfDate = 35,
    Terminating = 36,
}

type AppState = {
    unAppID: number;
    nInstanceID: number;
    bRunning: boolean;
};

declare namespace appStore {
    function GetAppOverviewByGameID(appId: number): AppOverview;
}

type RegisteredEvent = {
    unregister(): void;
};

type Shortcut = {
    appid: number;
    data: {
        bIsApplication: true;
        strAppName: string;
        strSortAs: string;
        strExePath: string;
        strShortcutPath: string;
        strArguments: string;
        strIconPath: string;
    };
};

type AppOverview = {
    appid: string;
    display_name: string;
    display_status: DisplayStatus;
    sort_as: string;
};

type App = {
    nAppID: number;
    strAppName: string;
    strSortAs: string;
    rtLastPlayed: number;
    strUsedSize: string;
    strDLCSize: string;
    strWorkshopSize: string;
    strStagedSize: string;
};

type InstallFolder = {
    nFolderIndex: number;
    strFolderPath: string;
    strUserLabel: string;
    strDriveName: string;
    strCapacity: string;
    strFreeSpace: string;
    strUsedSize: string;
    strDLCSize: string;
    strWorkshopSize: string;
    strStagedSize: string;
    bIsDefaultFolder: boolean;
    bIsMounted: boolean;
    bIsFixed: boolean;
    vecApps: App[];
};

type NonSteamGame = {
    appid: number;
    sort_as: string;
    display_name: string;
}

declare namespace collectionStore {
    const deckDesktopApps: {allApps: NonSteamGame[]};
}