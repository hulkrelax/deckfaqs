import { PanelSectionRow, ButtonItem } from 'decky-frontend-lib';
import React, { useCallback } from 'react';

type ListElementProps = {
    displayText: string;
    value: string;
    onClick: (text: string) => void;
};

export const ListElement = ({
    displayText,
    value,
    onClick,
}: ListElementProps) => {
    const handleClick = useCallback(() => {
        onClick(value);
    }, [value]);

    return (
        <PanelSectionRow>
            <ButtonItem
                //@ts-ignore
                disableNavSounds={true}
                layout="below"
                onClick={handleClick}
            >
                {displayText}
            </ButtonItem>
        </PanelSectionRow>
    );
};
