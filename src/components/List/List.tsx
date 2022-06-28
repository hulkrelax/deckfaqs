import { ButtonItem, PanelSectionRow } from 'decky-frontend-lib'
import React, { useEffect, useRef } from 'react'

export type ListItem = {
    text: string
    url?: string | undefined
}

export type ListProps = {
    header: string
    data: ListItem[]
    handleClick: (text: string) => void
}

export const List = ({ data, header, handleClick }: ListProps) => {
    const listDiv = useRef(null)
    useEffect(() => {
        listDiv.current.scrollTo(0, 0)
    }, [data])
    return (
        <div style={{ height: '100%' }}>
            <div
                style={{
                    fontSize: '16px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    width: '100%',
                }}
            >
                {header}
            </div>
            <div
                ref={listDiv}
                style={{
                    height: '100%',
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                }}
            >
                {data?.map(({ text, url }) => (
                    <PanelSectionRow>
                        <ButtonItem
                            key={text}
                            layout="below"
                            onClick={() => handleClick(url ?? text)}
                        >
                            {text}
                        </ButtonItem>
                    </PanelSectionRow>
                ))}
            </div>
        </div>
    )
}
