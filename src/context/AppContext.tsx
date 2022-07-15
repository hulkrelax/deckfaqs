import React, { createContext, useReducer } from 'react';
import { ListItem } from '../components/List/List';
import { AppActions, appReducer } from '../reducers/AppReducer';

export type PluginState = 'games' | 'results' | 'guides' | 'guide';

export type Guide = {
    guideUrl?: string | undefined;
    guideText?: string | undefined;
    guideHtml?: string | undefined;
};

export type TAppState = {
    pluginState: PluginState;
    games: ListItem[];
    searchResults: ListItem[];
    guides: ListItem[];
    runningGame?: string;
    currentGuide?: Guide;
};

type TAppContext = {
    state: TAppState;
    dispatch: React.Dispatch<AppActions>;
};

export const initialState: TAppState = {
    pluginState: 'games',
    games: [],
    searchResults: [],
    guides: [],
    runningGame: undefined,
    currentGuide: undefined,
};

export const AppContext = createContext<TAppContext>({
    state: initialState,
    dispatch: () => {},
});

type AppContextProps = {
    initState: TAppState;
};

// This might be kind of overkill but figured why not try non-Redux state management
export const AppContextProvider: React.FC<AppContextProps> = ({
    children,
    initState,
}) => {
    const [state, dispatch] = useReducer(appReducer, initState);
    const value = { state, dispatch };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
