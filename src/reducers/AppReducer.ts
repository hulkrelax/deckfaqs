import { ListItem } from '../components/List/List';
import { GuideContents, PluginState, TAppState } from '../context/AppContext';

export enum ActionType {
    UPDATE_PLUGIN_STATE,
    UPDATE_RESULTS,
    UPDATE_GAMES,
    UPDATE_GUIDES,
    UPDATE_RUNNING_GAME,
    UPDATE_GUIDE,
    BACK,
    BACK_TO_STATE,
}

export type AppActions =
    | UpdatePluginStateAction
    | UpdateResultsAction
    | UpdateGuidesAction
    | UpdateGamesAction
    | UpdateRunningGameAction
    | UpdateGuideAction
    | BackAction
    | BackToStateAction;

export type UpdatePluginStateAction = {
    type: ActionType.UPDATE_PLUGIN_STATE;
    payload: PluginState;
};

export type UpdateResultsAction = {
    type: ActionType.UPDATE_RESULTS;
    payload: ListItem[];
};

export type UpdateGamesAction = {
    type: ActionType.UPDATE_GAMES;
    payload: { games: ListItem[]; runningGame?: string };
};

export type UpdateGuidesAction = {
    type: ActionType.UPDATE_GUIDES;
    payload: ListItem[];
};

export type UpdateRunningGameAction = {
    type: ActionType.UPDATE_RUNNING_GAME;
    payload?: string;
};

export type UpdateGuideAction = {
    type: ActionType.UPDATE_GUIDE;
    payload: GuideContents;
};

export type BackAction = {
    type: ActionType.BACK;
};

export type BackToStateAction = {
    type: ActionType.BACK_TO_STATE;
    payload: PluginState;
};

export const appReducer = (state: TAppState, action: AppActions): TAppState => {
    switch (action.type) {
        case ActionType.UPDATE_PLUGIN_STATE:
            return {
                ...state,
                pluginState: action.payload,
            };
        case ActionType.UPDATE_GAMES:
            return {
                ...state,
                games: action.payload.games,
                runningGame: action.payload.runningGame,
                pluginState: 'games',
            };
        case ActionType.UPDATE_RESULTS:
            return {
                ...state,
                searchResults: action.payload,
                pluginState: 'results',
            };
        case ActionType.UPDATE_GUIDES:
            return {
                ...state,
                guides: action.payload,
                pluginState: 'guides',
            };
        case ActionType.UPDATE_RUNNING_GAME:
            return {
                ...state,
                runningGame: action.payload,
            };
        case ActionType.UPDATE_GUIDE:
            return {
                ...state,
                currentGuide: action.payload,
                pluginState: 'guide',
            };
        case ActionType.BACK:
            let newPluginState: PluginState = 'games';
            switch (state.pluginState) {
                case 'guides':
                    newPluginState = 'results';
                    break;
                case 'guide':
                    newPluginState = 'guides';
                    break;
                default:
                    newPluginState = 'games';
                    break;
            }
            return {
                ...state,
                pluginState: newPluginState,
            };
        case ActionType.BACK_TO_STATE:
            return {
                ...state,
                pluginState: action.payload,
            };
        default:
            return state;
    }
};
