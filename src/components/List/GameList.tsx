import { ButtonItem, PanelSection, PanelSectionRow } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps, getContent } from '../../utils';
import { List, ListItem } from './List';

type SearchResult = {
    product_name: string | undefined;
    platform_name: string | undefined;
    url: string | undefined;
};

export const GameList = ({ serverApi }: DefaultProps) => {
    const search = async (game: string) => {
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
            `function get_games() {
            return document.documentElement.innerText;
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
                                text: `${result.product_name} - ${result.platform_name}`,
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
