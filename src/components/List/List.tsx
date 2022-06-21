import React from 'react'
import { ListElement } from '../ListElement/ListElement'
import styles from './List.module.css'

export type ListItem = {
    text: string
    url?: string | undefined
}

interface ListProps {
    header: string
    data: ListItem[]
    handleClick: (text: string) => void
}

export const List = ({ data, header, handleClick }: ListProps) => {
    return (
        <>
            <h1>{header}</h1>
            <ul className={styles.mylist}>
                {data?.map((item) => (
                    <ListElement
                        key={item.text}
                        text={item.text}
                        url={item.url}
                        handleOnClick={handleClick}
                    />
                ))}
            </ul>
        </>
    )
}
