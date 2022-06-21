declare function call_plugin_method(methodName: string, arguments: {}): Promise<any>
declare function fetch_nocors(url: string, request: {}): Promise<any>

import React, { useState, useEffect } from "react";
import styles from './App.module.css';
import { List, ListItem } from '../List/List'
import { Guide } from "../Guide/Guide";

type AppState = "games" | "results" | "guides" | "guide";

type SearchResult = {
    product_name: string | undefined;
    platform_name: string | undefined;
    url: string | undefined;
}

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36';
const headers = { 'User-Agent': userAgent }
const faqsNightmareRegex = /(\/faqs\/\d+)\">(.*?)<\/a>[\S\n\t ]*?(rec)?\">\n.*(v\.[^,]*).*title=\"(.*)\"/gm;

export const App = () => {
    const [appState, setAppState] = useState<AppState>("games");
    const [games, setGames] = useState<ListItem[]>([]);
    const [searchResults, setSearchResults] = useState<ListItem[]>([]);
    const [guides, setGuides] = useState<ListItem[]>([])
    const [guideUrl, setGuideUrl] = useState<string>("");
    const [guideText, setGuideText] = useState<string | undefined>(undefined);

    useEffect(() => {
        call_plugin_method('get_games', {}).then(result => {
            setGames(result.map((game: string) => {
                return { text: game }
            }))
        });
    }, []);

    useEffect(() => {
        window.scrollTo({
            top: 0
        });
    }, [appState])

    const back = () => {
        let newState: AppState;
        switch (appState) {
            case "guides":
                newState = "results";
                break;
            case "guide":
                newState = "guides";
                break;
            default:
                newState = "games";
                break;
        }

        setAppState(newState);
    };

    const backToGames = () => {
        setAppState("games");
    }

    const getGuides = (url: string) => {
        setGuides([])
        fetch_nocors(`${url}/faqs`, { headers })
            .then(response => {
                let body: string = response.body;
                const faqs = Array.from(body.matchAll(faqsNightmareRegex));
                // sort by recommended
                faqs.sort((a, _b) => {
                    if (a[3] == 'rec')
                        return -1;
                    return 1;
                })
                const guides: ListItem[] = [];
                for (const faq of faqs) {
                    const faqUrl = faq[1], title = faq[2], version = faq[4], date = faq[5];
                    guides.push({ url: `${url}/${faqUrl}`, text: `${title} - ${version} - ${date}` })
                }

                setGuides(guides)
                setAppState("guides")
            })
    }

    const search = (game: string) => {
        setSearchResults([])
        game = game.replace(" ", "+");
        const searchUrl = `https://gamefaqs.gamespot.com/ajax/home_game_search?term=${game}`
        const home = "https://gamefaqs.gamespot.com"
        fetch_nocors(searchUrl, { headers })
            .then(response => {
                const results: SearchResult[] = JSON.parse(response.body);
                let searchResults: ListItem[] = []
                results.forEach(result => {
                    if (result.product_name) {
                        const url = `${home}/${result.url}`
                        searchResults.push({ text: `${result.product_name} - ${result.platform_name}`, url: url });
                    }
                });
                setSearchResults(searchResults);
                setAppState("results");
            })
    }

    const openGuide = (url: string) => {
        setGuideText(undefined)
        setGuideUrl("")
        fetch_nocors(url, { headers })
            .then(response => {
                const htmlBody: string = response.body;
                if (htmlBody.includes('<div class="faqtext" id="faqtext">')) {
                    const parser = new DOMParser();
                    const faq = parser.parseFromString(htmlBody, 'text/html');
                    const faqText = faq.getElementById("faqtext");
                    setGuideText(faqText.innerText);
                } else {
                    setGuideUrl(url)
                }
            });
        setAppState("guide");
    }

    const Components = Object.freeze({
        games: <List header="Installed Games" data={games} handleClick={search} />,
        results: <List header="Search Results" data={searchResults} handleClick={getGuides} />,
        guides: <List header="Guides" data={guides} handleClick={openGuide} />,
        guide: <Guide url={guideUrl} text={guideText} />,
    });

    return (
        <>
            <div>
                <div className={`${styles.nav} ${appState === "games" ? styles.hidden : ""}`}>
                    <button onClick={back} type="button" className={styles.btn}>Back</button>
                    {appState !== "games" && appState !== "results" && 
                    <button onClick={backToGames} type="button" className={styles.btn}>Back to Games</button>
                    }
                </div>
            </div>
            <div className={`${appState === "games" || appState === "guide" ? "" : styles.pad}`}>
            {
                Components[appState]
            }
            </div>
        </>
    );
};
