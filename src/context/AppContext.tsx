import React, { createContext, useReducer } from 'react';
import { ListItem } from '../components/List/List';
import { AppActions, appReducer } from '../reducers/AppReducer';

export type PluginState = 'games' | 'results' | 'guides' | 'guide';

export type TableOfContentEntry = {
    data: any;
    label: string;
};

export type GuideContents = {
    guideUrl?: string;
    guideHtml?: string;
    guideToc?: Array<TableOfContentEntry>;
    currentTocSection?: any;
    anchor?: string;
};

export type GuideSearch = {
    searchText: string;
    searchAnchorLength: number;
    anchorIndex: number;
};

export type TAppState = {
    pluginState: PluginState;
    games: ListItem[];
    searchResults: ListItem[];
    guides: ListItem[];
    runningGame?: string;
    darkMode: boolean;
    isLoading: boolean;
    currentGuide?: GuideContents;
    search: GuideSearch;
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
    darkMode: false,
    isLoading: false,
    search: { searchText: '', searchAnchorLength: 0, anchorIndex: 0 },
};

export const AppContext = createContext<TAppContext>({
    state: initialState,
    dispatch: () => {},
});

type AppContextProps = {
    incomingState?: TAppState;
};

// This might be kind of overkill but figured why not try non-Redux state management
export const AppContextProvider: React.FC<AppContextProps> = ({
    children,
    incomingState,
}) => {
    const myState = {
        ...initialState,
        ...incomingState,
    };
    const [state, dispatch] = useReducer(appReducer, myState);
    const value = { state, dispatch };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
