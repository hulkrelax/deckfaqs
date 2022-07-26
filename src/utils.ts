import { ServerAPI } from 'decky-frontend-lib';
import DOMPurify from 'dompurify';

export type DefaultProps = {
    serverApi: ServerAPI;
};

export const loadingStyle = `
.lds-ring {
    display: block;
    position: relative;
    margin-left: auto;
    margin-right: auto;
    width: 80px;
    height: 80px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #fff;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const MAX_POLLING = 100;

export const getContent = (
    url: string,
    serverApi: ServerAPI,
    code: string,
    handleResult: Function
) => {
    const test = SteamClient.BrowserView.Create();
    let htmlResult = '';
    test.LoadURL(url);
    let maxPolling = 0;

    let myInterval = setInterval(async () => {
        if (maxPolling >= MAX_POLLING) {
            clearInterval(myInterval);
            SteamClient.BrowserView.Destroy(test);
            handleResult(htmlResult);
            return;
        }
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
            serverApi
                .executeInTab(tab.title, false, code)
                .then((result: any) => {
                    htmlResult = result.result.result;
                })
                .finally(() => {
                    if (htmlResult) {
                        clearInterval(myInterval);
                        SteamClient.BrowserView.Destroy(test);
                        handleResult(htmlResult);
                    }
                });
        }
    }, 100);
};

export const getGuideHtml = (
    url: string,
    serverApi: ServerAPI,
    handleResult: Function
) => {
    const test = SteamClient.BrowserView.Create();
    let htmlResult = '';
    let toc = '';
    test.LoadURL(url);
    let maxPolling = 0;
    let myInterval = setInterval(async () => {
        if (maxPolling >= MAX_POLLING) {
            clearInterval(myInterval);
            SteamClient.BrowserView.Destroy(test);
            return;
        }
        maxPolling++;
        const response = await serverApi.fetchNoCors<{ body: string }>(
            'http://localhost:8080/json'
        );
        let tabs: Array<any> = [];
        if (response.success) tabs = JSON.parse(response.result.body);
        const tab = tabs.find((a) => a.url === url);
        if (tab.title) {
            serverApi
                .executeInTab(
                    tab.title,
                    false,
                    `function parseList(list) {
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
                    `
                )
                .then((result: any) => {
                    let htmlBody: any = result.result.result;
                    if (htmlBody) {
                        htmlBody = JSON.parse(htmlBody);
                        htmlResult = DOMPurify.sanitize(htmlBody.guide ?? '');
                        toc = htmlBody.toc;
                    }
                })
                .finally(() => {
                    if (htmlResult) {
                        clearInterval(myInterval);
                        SteamClient.BrowserView.Destroy(test);
                        handleResult(htmlResult, toc);
                    }
                });
        }
    }, 100);
};
