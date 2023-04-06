import React, { useContext, useMemo } from 'react';
import { AppContext, TableOfContentEntry } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { List } from './List';
import { DefaultProps, getGuideHtml } from '../../utils';

export const GuideList = ({ serverApi }: DefaultProps) => {
    const {
        state: { guides },
        dispatch,
        browserView,
    } = useContext(AppContext);

    const openGuide = (url: string) => {
        dispatch({
            type: ActionType.UPDATE_PLUGIN_STATE,
            payload: { pluginState: 'guide', isLoading: true },
        });
        getGuideHtml(
            url,
            serverApi,
            browserView,
            (result: string, toc: Array<TableOfContentEntry>) => {
                dispatch({
                    type: ActionType.UPDATE_GUIDE,
                    payload: {
                        guideHtml: result,
                        guideUrl: url,
                        guideToc: toc,
                    },
                });
            }
        );
    };
    return useMemo(
        () => (
            <List header="Guides" data={guides} handleClick={openGuide}></List>
        ),
        [guides]
    );
};
