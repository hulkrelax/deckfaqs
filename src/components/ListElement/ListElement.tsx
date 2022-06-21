import React from 'react'

// a bit hacky with the optional url
type GameElementProps = {
    text: string
    url?: string | undefined
    handleOnClick: (text: string) => void
}

export const ListElement = ({ text, url, handleOnClick }: GameElementProps) => {
    const handleClick = () => {
        handleOnClick(url ?? text)
    }

    return (
        <li>
            <a onClick={handleClick}>{text}</a>
        </li>
    )
}
