import React, { useState, useEffect, useRef } from 'react'
import { List, ListItem } from '../List/List'
import { Guide } from '../Guide/Guide'
import { DialogButton, ServerAPI } from 'decky-frontend-lib'
import { FaHome } from 'react-icons/fa'
import { GameList } from '../List/GameList'

type PluginState = 'games' | 'results' | 'guides' | 'guide'

type SearchResult = {
    product_name: string | undefined
    platform_name: string | undefined
    url: string | undefined
}

type AppProps = {
    serverAPI: ServerAPI
}

// This used to use css modules, but with the way the new React Based router works,
// I have yet to figure out how to import css properly

export const App = ({ serverAPI }: AppProps) => {
    const userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36'
    const headers = { 'User-Agent': userAgent }
    const faqsNightmareRegex =
        /(\/faqs\/\d+)\">(.*?)<\/a>[\S\n\t ]*?(rec)?\">\n.*(v\.[^,]*).*title=\"(.*)\"/gm

    const ignoreSteam = [1887720, 1070560, 1391110, 228980]
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
    ]

    const [appState, setAppState] = useState<PluginState>('games')
    const [games, setGames] = useState<ListItem[]>([])
    const [runningGame, setRunningGame] = useState<string | undefined>(
        undefined
    )
    const [searchResults, setSearchResults] = useState<ListItem[]>([])
    const [guides, setGuides] = useState<ListItem[]>([])
    const [guideUrl, setGuideUrl] = useState<string | undefined>(undefined)
    const [guideText, setGuideText] = useState<string | undefined>(undefined)

    const mainDiv = useRef(null)

    // This would work for Steam games but does not for non-steam games so we just use this for cleraing the running game
    const handleAppStateChange = ({ bRunning }: AppState) => {
        if (!bRunning) {
            setRunningGame(undefined)
        }
    }

    // This works for both Steam and non-Steam games
    const handleGameActionStart = (
        _actionType: number,
        strAppId: string,
        actionName: string
    ) => {
        let newRunningGame: string = undefined
        const appId = parseInt(strAppId)
        if (actionName == 'LaunchApp') {
            let gameInfo: AppOverview = appStore.GetAppOverviewByGameID(
                appId
            )
            if (gameInfo && !ignoreSteam.includes(appId) && !ignoreNonSteam.includes(gameInfo.display_name)) {
                newRunningGame = gameInfo.display_name
            }
        }
        setRunningGame(newRunningGame)
    }

    useEffect(() => {
        // the parent div sets the height to 100% which causes things to scroll too far
        // this is a bit of a hack but it works for the most part
        mainDiv.current.parentNode.style = 'overflow: hidden'

        const getGames = async (): Promise<{
            games: ListItem[]
            runningGame: string
        }> => {
            // Steam Games
            const installFolders =
                await SteamClient.InstallFolder.GetInstallFolders()
            const games: { appName: string; sortAsName: string }[] = []
            let currentRunningGame: string = undefined
            installFolders.forEach((folder) => {
                folder.vecApps.forEach((app) => {
                    if (!ignoreSteam.includes(app.nAppID)) {
                        if (
                            !currentRunningGame &&
                            appStore.GetAppOverviewByGameID(app.nAppID)
                                ?.display_status === DisplayStatus.Running
                        ) {
                            currentRunningGame = app.strAppName
                        }
                        games.push({
                            sortAsName: app.strSortAs,
                            appName: app.strAppName,
                        })
                    }
                })
            })

            // Non-Steam Games
            const shortcuts = await SteamClient.Apps.GetAllShortcuts()
            shortcuts.forEach(({ appid, data: { strSortAs, strAppName } }) => {
                if (!ignoreNonSteam.includes(strAppName)) {
                    if (
                        !currentRunningGame &&
                        appStore.GetAppOverviewByGameID(appid)
                            ?.display_status === DisplayStatus.Running
                    ) {
                        currentRunningGame = strAppName
                    }
                    games.push({ sortAsName: strSortAs, appName: strAppName })
                }
            })
            return {
                games: games
                    .sort((a, b) => a.sortAsName.localeCompare(b.sortAsName))
                    .map(({ appName }): ListItem => {
                        return { text: appName }
                    }),
                runningGame: currentRunningGame,
            }
        }

        getGames().then(({ games, runningGame }) => {
            setGames(games)
            setRunningGame(runningGame)
        })

        const onAppStateChange =
            SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
                handleAppStateChange
            )

        const onGameActionStart = SteamClient.Apps.RegisterForGameActionStart(
            handleGameActionStart
        )
        return function cleanup() {
            onAppStateChange.unregister()
            onGameActionStart.unregister()
        }
    }, [])

    const back = () => {
        let newState: PluginState
        switch (appState) {
            case 'guides':
                newState = 'results'
                break
            case 'guide':
                newState = 'guides'
                break
            default:
                newState = 'games'
                break
        }

        setAppState(newState)
    }

    const backToGames = () => {
        setAppState('games')
    }

    const getGuides = async (url: string) => {
        const guides: ListItem[] = []
        const response = await serverAPI.fetchNoCors<{ body: string }>(
            `${url}/faqs`,
            { headers }
        )
        if (response.success) {
            let body = response.result.body
            const faqs = Array.from(body.matchAll(faqsNightmareRegex))
            // sort by recommended
            faqs.sort((a, _b) => {
                if (a[3] == 'rec') return -1
                return 1
            })
            for (const faq of faqs) {
                const faqUrl = faq[1],
                    title = faq[2],
                    version = faq[4],
                    date = faq[5]
                guides.push({
                    url: `${url}/${faqUrl}`,
                    text: `${title} - ${version} - ${date}`,
                })
            }
        } else {
            console.error(response.result)
        }

        setGuides(guides)
        setAppState('guides')
    }

    const search = async (game: string) => {
        game = game.replace(' ', '+')
        const searchUrl = `https://gamefaqs.gamespot.com/ajax/home_game_search?term=${game}`
        const home = 'https://gamefaqs.gamespot.com'
        const response = await serverAPI.fetchNoCors<{ body: string }>(
            searchUrl,
            { headers }
        )
        let searchResults: ListItem[] = []
        if (response.success) {
            const results: SearchResult[] = JSON.parse(response.result.body)
            results.forEach((result) => {
                if (result.product_name) {
                    const url = `${home}/${result.url}`
                    searchResults.push({
                        text: `${result.product_name} - ${result.platform_name}`,
                        url: url,
                    })
                }
            })
        } else {
            console.error(response.result)
        }
        setSearchResults(searchResults)
        setAppState('results')
    }

    const openGuide = async (url: string) => {
        let gText: string = undefined
        let gUrl: string = undefined
        const response = await serverAPI.fetchNoCors<{ body: string }>(url, {
            headers,
        })
        if (response.success) {
            const htmlBody: string = response.result.body
            if (htmlBody.includes('<div class="faqtext" id="faqtext">')) {
                const parser = new DOMParser()
                const faq = parser.parseFromString(htmlBody, 'text/html')
                const faqText = faq.getElementById('faqtext')
                gText = faqText.innerText
            } else {
                gUrl = url
            }
            setGuideText(gText)
            setGuideUrl(gUrl)
            setAppState('guide')
        } else {
            console.error(response.result)
        }
    }

    const Components = Object.freeze({
        games: (
            <GameList
                header="Installed Games"
                data={games}
                handleClick={search}
                runningGame={runningGame}
            />
        ),
        results: (
            <List
                header="Search Results"
                data={searchResults}
                handleClick={getGuides}
            />
        ),
        guides: <List header="Guides" data={guides} handleClick={openGuide} />,
        guide: <Guide url={guideUrl} text={guideText} />,
    })

    const navButtonStyle = {
        height: '40px',
        width: '50%',
        minWidth: '0',
        padding: '10px 12px',
    }

    // I'm sure there is a more elegant way to do this but I don't have time for that :smile:
    let mainHeight = 'calc(100% - 88px)'

    if (appState === 'games') {
        mainHeight = runningGame ? 'calc(100% - 110px)' : 'calc(100% - 28px)'
    }

    return (
        <div ref={mainDiv} style={{ height: mainHeight, padding: '0 16px' }}>
            <div
                style={{
                    display: appState == 'games' ? 'none' : 'flex',
                    width: '100%',
                    marginBottom: '10px',
                }}
            >
                {appState !== 'games' && appState !== 'results' && (
                    <DialogButton
                        style={{ ...navButtonStyle, marginRight: '10px' }}
                        onClick={backToGames}
                    >
                        <FaHome
                            style={{ margin: '0 auto', display: 'block' }}
                        />
                    </DialogButton>
                )}
                <DialogButton style={navButtonStyle} onClick={back}>
                    Back
                </DialogButton>
            </div>
            {Components[appState]}
        </div>
    )
}
