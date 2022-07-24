import React from 'react';
import { ListElement } from './ListElement';

export type ListItem = {
    text: string;
    url?: string | undefined;
};

export type ListProps = {
    header: string;
    data: ListItem[];
    handleClick: (text: string) => void;
};

export const List = ({ data, header, handleClick }: ListProps) => {
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
            <div>
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
    );
};
