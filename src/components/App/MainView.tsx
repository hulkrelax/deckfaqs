import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { DefaultProps } from '../../utils';
import { Guide } from '../Guide/Guide';
import { GameList } from '../List/GameList';
import { GuideList } from '../List/GuideList';
import { ResultList } from '../List/ResultList';

export const MainView = ({ serverApi }: DefaultProps) => {
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
