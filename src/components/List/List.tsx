import React, { useEffect, useRef } from 'react'
import { ListElement } from './ListElement'

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
    const listDiv = useRef<HTMLDivElement>(null)
    useEffect(() => {
        listDiv.current?.scrollTo(0, 0)
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
                    <ListElement
                        key={text}
                        displayText={text}
                        value={url ?? text}
                        onClick={handleClick}
                    />
                ))}
            </div>
        </div>
    )
}
