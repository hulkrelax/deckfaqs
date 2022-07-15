import { ServerAPI } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { headers } from '../../constants';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { List } from './List';
import DOMPurify from 'dompurify';

type GuideListProps = {
    serverApi: ServerAPI;
};

export const GuideList = ({ serverApi }: GuideListProps) => {
    const {
        state: { guides },
        dispatch,
    } = useContext(AppContext);

    const openGuide = async (url: string) => {
        let guideText: string | undefined = undefined;
        let guideUrl: string | undefined = undefined;
        const response = await serverApi.fetchNoCors<{ body: string }>(url, {
            headers,
        });
        if (response.success) {
            const htmlBody: string = response.result.body;
            const parser = new DOMParser();
            const faq = parser.parseFromString(htmlBody, 'text/html');
            if (htmlBody.includes('<div class="faqtext" id="faqtext">')) {
                const faqText = faq.getElementById('faqtext');
                guideText = DOMPurify.sanitize(faqText?.outerHTML ?? '');
            } else {
                guideText = DOMPurify.sanitize(
                    faq.getElementById('faqwrap')?.outerHTML ?? ''
                );
            }
            guideUrl = url;
            dispatch({
                type: ActionType.UPDATE_GUIDE,
                payload: {
                    guideText: guideText,
                    guideUrl: guideUrl,
                },
            });
        } else {
            console.error(response.result);
        }
    };

    return useMemo(
        () => (
            <List header="Guides" data={guides} handleClick={openGuide}></List>
        ),
        [guides]
    );
};
