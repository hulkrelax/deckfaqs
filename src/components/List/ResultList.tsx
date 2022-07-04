// import { ButtonItem, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { ServerAPI } from 'decky-frontend-lib'
import React, { useContext, useMemo } from 'react'
import { faqsNightmareRegex, headers } from '../../constants'
import { AppContext } from '../../context/AppContext'
import { ActionType } from '../../reducers/AppReducer'
import { List, ListItem } from './List'

type ResultListProps = {
    serverApi: ServerAPI
}

export const ResultList = ({ serverApi }: ResultListProps) => {
    const {
        state: { searchResults },
        dispatch,
    } = useContext(AppContext)

    const getGuides = async (url: string) => {
        const guides: ListItem[] = []
        const response = await serverApi.fetchNoCors<{ body: string }>(
            `${url}/faqs`,
            { headers }
        )
        if (response.success) {
            let body = response.result.body
            const faqs = Array.from(body.matchAll(faqsNightmareRegex))
            // sort by recommended
            faqs.sort((a, _b) => {
                if (a[3] == 'rec') return -1
                return 1
            })
            for (const faq of faqs) {
                const faqUrl = faq[1],
                    title = faq[2],
                    version = faq[4],
                    date = faq[5]
                guides.push({
                    url: `${url}/${faqUrl}`,
                    text: `${title} - ${version} - ${date}`,
                })
            }
        } else {
            console.error(response.result)
        }

        dispatch({
            type: ActionType.UPDATE_GUIDES,
            payload: guides,
        })
    }

    return useMemo(
        () => (
            <List
                header="Search Results"
                data={searchResults}
                handleClick={getGuides}
            ></List>
        ),
        [searchResults]
    )
}
