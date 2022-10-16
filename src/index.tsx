import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib';
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { App } from './components/App/App';
import { AppContextProvider } from './context/AppContext';

export default definePlugin((serverApi: ServerAPI) => {
    return {
        title: <div className={staticClasses.Title}>DeckFAQs</div>,
        content: (
            <AppContextProvider>
                <App serverApi={serverApi} />
            </AppContextProvider>
        ),
        icon: <FaSearch />,
        onDismount() {
            serverApi.routerHook.removeRoute('/deckfaqs-fullscreen');
        },
        alwaysRender: true,
    };
});
