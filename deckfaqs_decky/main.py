import re
import os
from os.path import exists

lib_file = "/home/deck/.steam/steam/config/libraryfolders.vdf"
non_steam = "/home/deck/.steam/steam/userdata"
library_regex = re.compile('"path"\t+"(.*)"')
game_regex = re.compile('"name"\t+"(.*)"')
app_id_regex = re.compile('"appid"\t+"(.*)"')
non_steam_regex = re.compile("(appname)\x00(.*?)\x00\x01(?:exe)", re.IGNORECASE)

ignore_apps = ["1887720", "1070560", "1391110", "228980"]
ignore_non_steam = [
    "EmulationStation-DE-x64_SteamDeck",
    "Google Chrome",
    "Cemu",
    "Citra",
    "Dolphin (emulator)",
    "DuckStation (Emulator)",
    "PCSX2",
    "PPSSPP",
    "PrimeHack",
    "RetroArch",
    "RPCS3",
    "xemu (emulator)",
    "Yuzu",
]


class Plugin:
    async def get_games(self):
        games = set()
        lib_folders = []

        # steam games
        if exists(lib_file):
            with open(lib_file, "rt") as f:
                result = f.read()
                lib_folders = library_regex.findall(result)

            for lib_folder in lib_folders:
                app_folder = f"{lib_folder}/steamapps"
                for file in os.listdir(app_folder):
                    if file.endswith(".acf"):
                        with open(f"{app_folder}/{file}", "rt") as f:
                            result = f.read()
                            game = next(iter(game_regex.findall(result)), None)
                            app_id = next(iter(app_id_regex.findall(result)), None)
                            if game and app_id not in ignore_apps:
                                games.add(game)

        # non-steam games
        for folder in os.listdir(non_steam):
            config_folder = f"{non_steam}/{folder}/config"
            if os.path.exists(config_folder):
                for file in os.listdir(config_folder):
                    if file == "shortcuts.vdf":
                        with open(
                            f"{config_folder}/{file}",
                            "r",
                            encoding="utf-8",
                            errors="ignore",
                        ) as f:
                            result = f.read()
                            non_steam_games = non_steam_regex.findall(result)
                            for non_steam_game in non_steam_games:
                                game = non_steam_game[1]
                                if game not in ignore_non_steam:
                                    games.add(game.strip())

        games = list(games)
        games.sort()
        return games
