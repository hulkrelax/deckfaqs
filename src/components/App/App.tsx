import React, { useEffect, useContext, useRef } from 'react';
import { ListItem } from '../List/List';
import { ServerAPI, Router } from 'decky-frontend-lib';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { ignoreNonSteam, ignoreSteam } from '../../constants';
import { Nav } from '../Nav/Nav';
import { MainView } from './MainView';

type AppProps = {
    serverApi: ServerAPI;
};

// This used to use css modules, but with the way the new React Based router works,
// I have yet to figure out how to import css properly
export const App = ({ serverApi }: AppProps) => {
    const {
        state: { pluginState },
        dispatch,
    } = useContext(AppContext);
    const mainDiv = useRef<HTMLDivElement>(null);
    useEffect(() => {
        mainDiv.current?.scrollTo({ top: 0 });
    }, [pluginState]);

    // This would work for Steam games but does not for non-steam games so we just use this for cleraing the running game
    const handleSteamAppStateChange = ({ bRunning }: AppState) => {
        if (!bRunning) {
            dispatch({
                type: ActionType.UPDATE_RUNNING_GAME,
                payload: undefined,
            });
        }
    };

    // This works for both Steam and non-Steam games
    const handleGameActionStart = (
        _actionType: number,
        strAppId: string,
        actionName: string
    ) => {
        let newRunningGame: string | undefined = undefined;
        const appId = parseInt(strAppId);
        if (actionName == 'LaunchApp') {
            let gameInfo: AppOverview = appStore.GetAppOverviewByGameID(appId);
            if (
                gameInfo &&
                !ignoreSteam.includes(appId) &&
                !ignoreNonSteam.includes(gameInfo.display_name)
            ) {
                newRunningGame = gameInfo.display_name;
            }
        }
        dispatch({
            type: ActionType.UPDATE_RUNNING_GAME,
            payload: newRunningGame,
        });
    };

    useEffect(() => {
        const getGames = async (): Promise<{
            games: ListItem[];
            runningGame?: string;
        }> => {
            // Steam Games
            const installFolders =
                await SteamClient.InstallFolder.GetInstallFolders();
            const games: { appName: string; sortAsName: string }[] = [];
            const currentRunningGame = Router.MainRunningApp?.display_name;
            let runningGame: string | undefined = undefined;
            installFolders.forEach((folder) => {
                folder.vecApps.forEach((app) => {
                    if (!ignoreSteam.includes(app.nAppID)) {
                        if (
                            !runningGame &&
                            currentRunningGame == app.strAppName
                        )
                            runningGame = currentRunningGame;
                        games.push({
                            sortAsName: app.strSortAs,
                            appName: app.strAppName,
                        });
                    }
                });
            });

            // Non-Steam Games
            const shortcuts = await SteamClient.Apps.GetAllShortcuts();
            shortcuts.forEach(({ data: { strSortAs, strAppName } }) => {
                if (!ignoreNonSteam.includes(strAppName)) {
                    if (!runningGame && currentRunningGame == strAppName)
                        runningGame = currentRunningGame;
                    games.push({ sortAsName: strSortAs, appName: strAppName });
                }
            });
            const apps = games.map((o) => o.appName);
            const unique = games.filter(
                ({ appName }, index) => !apps.includes(appName, index + 1)
            );
            return {
                games: unique
                    .sort((a, b) => a.sortAsName.localeCompare(b.sortAsName))
                    .map(({ appName }): ListItem => {
                        return { text: appName };
                    }),
                runningGame: currentRunningGame,
            };
        };

        getGames().then(({ games, runningGame }) => {
            dispatch({
                type: ActionType.UPDATE_GAMES,
                payload: { games, runningGame },
            });
        });

        const onAppStateChange =
            SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
                handleSteamAppStateChange
            );

        const onGameActionStart = SteamClient.Apps.RegisterForGameActionStart(
            handleGameActionStart
        );
        return function cleanup() {
            onAppStateChange.unregister();
            onGameActionStart.unregister();
        };
    }, []);

    // I'm sure there is a more elegant way to do this but I don't have time for that :smile:
    //let mainHeight = 'calc(100% - 88px)';

    // if (pluginState === 'games') {
    //     mainHeight = runningGame ? 'calc(100% - 110px)' : 'calc(100% - 28px)';
    // }
    return (
        <div
            style={{
                height: '395px',
                padding: '0 16px',
                display: 'flex',
                flexFlow: 'column',
            }}
        >
            <Nav serverApi={serverApi}/>
            <div ref={mainDiv} style={{ flexGrow: '1', overflow: 'auto' }}>
                <MainView serverApi={serverApi} />
            </div>
        </div>
    );
};
