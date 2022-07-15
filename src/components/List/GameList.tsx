import {
    ButtonItem,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
} from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { headers } from '../../constants';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { List, ListItem } from './List';

type GameListProps = {
    serverApi: ServerAPI;
};

type SearchResult = {
    product_name: string | undefined;
    platform_name: string | undefined;
    url: string | undefined;
};

export const GameList = ({ serverApi }: GameListProps) => {
    const search = async (game: string) => {
        game = game.replace(' ', '+');
        const searchUrl = `https://gamefaqs.gamespot.com/ajax/home_game_search?term=${game}`;
        const home = 'https://gamefaqs.gamespot.com';
        const response = await serverApi.fetchNoCors<{ body: string }>(
            searchUrl,
            { headers }
        );
        let searchResults: ListItem[] = [];
        if (response.success) {
            const results: SearchResult[] = JSON.parse(response.result.body);
            results.forEach((result) => {
                if (result.product_name) {
                    const url = `${home}/${result.url}`;
                    searchResults.push({
                        text: `${result.product_name} - ${result.platform_name}`,
                        url: url,
                    });
                }
            });
        } else {
            console.error(response.result);
        }
        dispatch({
            type: ActionType.UPDATE_RESULTS,
            payload: searchResults,
        });
    };

    const { state, dispatch } = useContext(AppContext);
    const { runningGame, games } = state;

    return useMemo(
        () => (
            <>
                {runningGame && (
                    <PanelSection>
                        <PanelSectionRow>
                            <ButtonItem
                                layout="below"
                                onClick={() => search(runningGame)}
                            >
                                {runningGame}
                            </ButtonItem>
                        </PanelSectionRow>
                    </PanelSection>
                )}
                <List
                    header="Installed Games"
                    data={games}
                    handleClick={search}
                ></List>
            </>
        ),
        [runningGame, games]
    );
};
