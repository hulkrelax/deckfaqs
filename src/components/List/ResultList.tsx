import React, { useContext, useMemo } from 'react';
import { faqsNightmareRegex } from '../../constants';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps, getContent } from '../../utils';
import { List, ListItem } from './List';

export const ResultList = ({ serverApi }: DefaultProps) => {
    const {
        state: { searchResults },
        dispatch,
    } = useContext(AppContext);

    const getGuides = async (url: string) => {
        const guides: ListItem[] = [];
        const faqUrl = `${url}/faqs`;
        dispatch({
            type: ActionType.UPDATE_PLUGIN_STATE,
            payload: { pluginState: 'guides', isLoading: true },
        });
        getContent(
            faqUrl,
            serverApi,
            `function get_guides() {
                let content = document.getElementsByClassName("guides")
                if(content.length > 0)
                    return document.documentElement.outerHTML
                return undefined
            }
            get_guides()`,
            (result: string) => {
                const body = result;
                const faqs = Array.from(body.matchAll(faqsNightmareRegex));
                for (const faq of faqs) {
                    const faqUrl = faq[1],
                        title = faq[2],
                        version = faq[4],
                        date = faq[5];
                    guides.push({
                        url: `${url}${faqUrl}`,
                        text: `${title} - ${version} - ${date}`,
                    });
                }
                dispatch({
                    type: ActionType.UPDATE_GUIDES,
                    payload: guides,
                });
            }
        );
    };

    return useMemo(
        () => (
            <List
                header="Search Results"
                data={searchResults}
                handleClick={getGuides}
            ></List>
        ),
        [searchResults]
    );
};
