import { ServerAPI } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Guide } from '../Guide/Guide';
import { GameList } from '../List/GameList';
import { GuideList } from '../List/GuideList';
import { ResultList } from '../List/ResultList';

type MainProps = {
    serverApi: ServerAPI;
};

export const MainView = ({ serverApi }: MainProps) => {
    const {
        state: { pluginState },
    } = useContext(AppContext);
    const elementToRender = () => {
        switch (pluginState) {
            case 'games':
                return <GameList serverApi={serverApi} />;
            case 'results':
                return <ResultList serverApi={serverApi} />;
            case 'guides':
                return <GuideList serverApi={serverApi} />;
            case 'guide':
                return <Guide serverApi={serverApi} />;
        }
    };

    return useMemo(() => elementToRender(), [pluginState]);
};
