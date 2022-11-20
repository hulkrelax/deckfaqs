import { ButtonItem, PanelSection, PanelSectionRow } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { DefaultProps, gameSearch } from '../../utils';
import { List } from './List';

export type SearchResult = {
    product_name: string | undefined;
    url: string | undefined;
};

export const GameList = ({ serverApi }: DefaultProps) => {
    const search = (game: string) => {
        gameSearch(game, serverApi, dispatch);
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
