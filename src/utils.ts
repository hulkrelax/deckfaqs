import { ServerAPI } from 'decky-frontend-lib';
import DOMPurify from 'dompurify';
import React from 'react';
import { SearchResult } from './components/List/GameList';
import { ListItem } from './components/List/List';
import { ActionType, AppActions } from './reducers/AppReducer';

export type DefaultProps = {
    serverApi: ServerAPI;
};

const getGuideCode = `function parseList(list) {
    let newT = [];
    for (let element of list.children) {
        const tagName = element.tagName;
        switch (tagName) {
            case 'LI':
                const a = element.getElementsByTagName('a')[0];
                if (a)
                    newT.push({
                        data: a.getAttribute('href'),
                        label: a.textContent,
                    });
                break;
            case 'OL':
                let label = element.previousSibling?.textContent;
                let res = parseList(element);
                newT.push({ label, options: res });
                break;
        }
    }

    return newT;
}

function get_guide() {
    let faq = document.getElementById('faqwrap');
    let tocObjc = [];
    if (faq) {
        let toc = faq.getElementsByClassName('ftoc');
        if (toc.length > 0) {
            let mainList = toc[0].getElementsByTagName('ol');
            if (mainList.length > 0) {
                tocObjc = parseList(mainList[0]);
            }
        }
        return JSON.stringify({ guide: faq.outerHTML, toc: tocObjc });
    }
    return undefined;
}
get_guide();
`;

async function delay(ms: number, state = null) {
    return new Promise((resolve, _reject) => {
        window.setTimeout(() => resolve(state), ms);
    });
}

const MAX_POLLING = 100;

export const getContent = async (
    url: string,
    serverApi: ServerAPI,
    browserView: any,
    code: string,
    handleResult: Function
) => {
    let htmlResult = '';
    browserView.LoadURL(url);
    let maxPolling = 0;
    while (maxPolling < MAX_POLLING) {
        maxPolling++;
        const response = await serverApi.fetchNoCors<{ body: string }>(
            'http://localhost:8080/json'
        );
        let tabs: Array<any> = [];
        if (response.success) tabs = JSON.parse(response.result.body);
        const tab = tabs.find(
            (a) => a.url === encodeURI(url).replace(/'/g, '%27')
        );
        if (tab && tab.title) {
            try {
                const result: any = await serverApi.executeInTab(
                    tab.title,
                    true,
                    code
                );
                htmlResult = result.result.result;
            } catch (e) {}
        }
        if (htmlResult) break;
        await delay(100);
    }
    browserView.LoadURL('data:text/html,<body><%2Fbody>');
    handleResult(htmlResult);
};

export const getGuideHtml = async (
    url: string,
    serverApi: ServerAPI,
    browserView: any,
    handleResult: Function
) => {
    url = encodeURI(url);
    let htmlResult = '';
    let toc = '';
    browserView.LoadURL(url);
    let maxPolling = 0;
    while (maxPolling < MAX_POLLING) {
        maxPolling++;
        const response = await serverApi.fetchNoCors<{ body: string }>(
            'http://localhost:8080/json'
        );
        let tabs: Array<any> = [];
        if (response.success) tabs = JSON.parse(response.result.body);
        const tab = tabs.find((a) => a.url === url);
        if (tab && tab.title) {
            try {
                const result: any = await serverApi.executeInTab(
                    tab.title,
                    true,
                    getGuideCode
                );

                let htmlBody = result.result.result;
                if (htmlBody) {
                    htmlBody = JSON.parse(htmlBody);
                    htmlResult = DOMPurify.sanitize(htmlBody.guide ?? '');
                    toc = htmlBody.toc;
                }
            } catch (e) {}
        }
        if (htmlResult) break;
        await delay(100);
    }
    browserView.LoadURL('data:text/html,<body><%2Fbody>');
    handleResult(htmlResult, toc);
};

export const gameSearch = async (
    game: string,
    serverApi: ServerAPI,
    browserView: any,
    dispatch: React.Dispatch<AppActions>
) => {
    game = game.replace(' ', '+');
    const searchUrl = `https://gamefaqs.gamespot.com/ajax/home_game_search?term=${game}`;
    const home = 'https://gamefaqs.gamespot.com';
    dispatch({
        type: ActionType.UPDATE_PLUGIN_STATE,
        payload: { pluginState: 'results', isLoading: true },
    });
    getContent(
        searchUrl,
        serverApi,
        browserView,
        `function get_games() {
            if(document.documentElement) {
                return document.documentElement.innerText;
            }
            return '';
        }
    get_games()`,
        (result: string) => {
            let searchResults: ListItem[] = [];
            if (result) {
                const results: SearchResult[] = JSON.parse(result);
                results.forEach((result) => {
                    if (result.product_name) {
                        const url = `${home}${result.url}`;
                        searchResults.push({
                            text: `${result.product_name}`,
                            url: url,
                        });
                    }
                });
            }
            dispatch({
                type: ActionType.UPDATE_RESULTS,
                payload: searchResults,
            });
        }
    );
};
