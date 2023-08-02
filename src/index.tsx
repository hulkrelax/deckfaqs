import { definePlugin, Router, ServerAPI, staticClasses } from 'decky-frontend-lib';
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { App } from './components/App/App';
import { AppContextProvider } from './context/AppContext';

export default definePlugin((serverApi: ServerAPI) => {
    const windowRouter = Router.WindowStore?.GamepadUIMainWindowInstance
    // @ts-ignore
    const browserView = windowRouter?.CreateBrowserView("DeckFAQs");
    return {
        title: <div className={staticClasses.Title}>DeckFAQs</div>,
        content: (
            <AppContextProvider browserView={browserView}>
                <App serverApi={serverApi} />
            </AppContextProvider>
        ),
        icon: <FaSearch />,
        onDismount() {
            SteamClient.BrowserView.Destroy(browserView);
            serverApi.routerHook.removeRoute('/deckfaqs-fullscreen');
        },
        alwaysRender: true,
    };
});
