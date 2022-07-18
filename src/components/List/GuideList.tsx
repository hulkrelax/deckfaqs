import { ServerAPI } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { List } from './List';
import { getGuideHtml } from '../../utils';

type GuideListProps = {
    serverApi: ServerAPI;
};

export const GuideList = ({ serverApi }: GuideListProps) => {
    const {
        state: { guides },
        dispatch,
    } = useContext(AppContext);

    const openGuide = (url: string) => {
        getGuideHtml(
            url,
            serverApi,
            (result: string, toc: Array<any> | undefined) => {
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
