import { ButtonItem, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import React from 'react'
import { List, ListProps } from './List'

type GameListProps = ListProps & {
    runningGame?: string | undefined
}

export const GameList = ({
    header,
    data,
    handleClick,
    runningGame,
}: GameListProps) => {
    return (
        <>
            {runningGame && (
                <PanelSection>
                    <PanelSectionRow>
                        <ButtonItem
                            layout="below"
                            onClick={() => handleClick(runningGame)}
                        >
                            {runningGame}
                        </ButtonItem>
                    </PanelSectionRow>
                </PanelSection>
            )}
            <List header={header} data={data} handleClick={handleClick}></List>
        </>
    )
}
