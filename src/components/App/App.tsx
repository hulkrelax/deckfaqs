import React, { useState, useEffect, useRef } from 'react'
import { List, ListItem } from '../List/List'
import { Guide } from '../Guide/Guide'
import { DialogButton, ServerAPI } from 'decky-frontend-lib'
import { FaHome } from 'react-icons/fa'

type AppState = 'games' | 'results' | 'guides' | 'guide'

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

    const [appState, setAppState] = useState<AppState>('games')
    const [games, setGames] = useState<ListItem[]>([])
    const [searchResults, setSearchResults] = useState<ListItem[]>([])
    const [guides, setGuides] = useState<ListItem[]>([])
    const [guideUrl, setGuideUrl] = useState<string | undefined>(undefined)
    const [guideText, setGuideText] = useState<string | undefined>(undefined)

    const mainDiv = useRef(null)

    useEffect(() => {
        // the parent div sets the height to 100% which causes things to scroll too far
        // this is a bit of a hack but it works for the most part
        mainDiv.current.parentNode.style = 'overflow: hidden'
        serverAPI
            .callPluginMethod<{}, string[]>('get_games', {})
            .then((response) => {
                if (response.success) {
                    const result = response.result
                    setGames(
                        result.map((game: string) => {
                            return { text: game }
                        })
                    )
                }
            })
    }, [])

    const back = () => {
        let newState: AppState
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
            <List header="Installed Games" data={games} handleClick={search} />
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
    const mainHeight =
        appState == 'games' ? 'calc(100% - 28px)' : 'calc(100% - 88px)'

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
