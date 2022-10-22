const faqsNightmareRegex =
    /(\/faqs\/\d+)\">(.*?)<\/a>[\S\n\t ]*?(rec)?\">\n.*(v\.[^,]*).*title=\"(.*)\"/gm;

const ignoreSteam = [1887720, 1070560, 1391110, 228980];
const ignoreNonSteam = [
    'EmulationStation-DE-x64_SteamDeck',
    'Google Chrome',
    'Cemu',
    'Citra',
    'Dolphin (emulator)',
    'DuckStation (Emulator)',
    'PCSX2',
    'PPSSPP',
    'PrimeHack',
    'RetroArch',
    'RPCS3',
    'xemu (emulator)',
    'Yuzu',
    'Moonlight',
    'pcsx2-qt',
    'Ryujinx',
    'ScummVM',
    'Vita3K',
    'Chiaki',
    'Heroic Games Launcher',
    'MAME',
];

export { ignoreSteam, ignoreNonSteam, faqsNightmareRegex };
