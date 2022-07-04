import { DialogButton } from 'decky-frontend-lib'
import React, { useContext, useMemo } from 'react'
import { FaHome } from 'react-icons/fa'
import { AppContext } from '../../context/AppContext'
import { ActionType } from '../../reducers/AppReducer'

export const Nav = () => {
    const {
        state: { pluginState },
        dispatch,
    } = useContext(AppContext)

    const back = () => {
        dispatch({ type: ActionType.BACK })
    }

    const backToGames = () => {
        dispatch({ type: ActionType.BACK_TO_STATE, payload: 'games' })
    }

    const navButtonStyle = {
        height: '40px',
        width: '50%',
        minWidth: '0',
        padding: '10px 12px',
    }
    return useMemo(() => {
        return (
            <div
                style={{
                    display: pluginState == 'games' ? 'none' : 'flex',
                    width: '100%',
                    marginBottom: '10px',
                }}
            >
                {pluginState !== 'games' && pluginState !== 'results' && (
                    <DialogButton
                        style={{ ...navButtonStyle, marginRight: '10px' }}
                        onClick={backToGames}
                    >
                        <FaHome
                            style={{ margin: '0 auto', display: 'block' }}
                        />
                    </DialogButton>
                )}
                <DialogButton style={navButtonStyle} onClick={back}>
                    Back
                </DialogButton>
            </div>
        )
    }, [pluginState])
}
