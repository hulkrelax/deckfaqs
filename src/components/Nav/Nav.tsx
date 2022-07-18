import { DialogButton, Focusable, Router } from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { FaHome } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps } from '../../utils';
import { TocDropdown } from './TocDropdown';

export const Nav = ({ serverApi }: DefaultProps) => {
    const {
        state: { pluginState, currentGuide },
        dispatch,
    } = useContext(AppContext);

    const back = () => {
        dispatch({ type: ActionType.BACK });
    };

    const backToGames = () => {
        dispatch({ type: ActionType.BACK_TO_STATE, payload: 'games' });
    };

    const navButtonStyle = {
        height: '40px',
        width: '49%',
        minWidth: '0',
        display: 'inline-block',
        verticalAlign: 'bottom',
        padding: '10px 12px',
        margin: '0 auto',
    };
    const childStyle = {
        maxWidth: '49%',
        flexGrow: 1,
    };
    return useMemo(() => {
        return (
            <div style={{ flex: '0 1 auto', marginBottom: '10px' }}>
                <div
                    style={{
                        display:
                            pluginState == 'games' ? 'none' : 'inline-block',
                        width: '100%',
                        marginBottom: '5px',
                    }}
                >
                    <Focusable>
                        {pluginState !== 'games' && pluginState !== 'results' && (
                            <DialogButton
                                style={{
                                    ...navButtonStyle,
                                    marginRight: '5px',
                                }}
                                onClick={backToGames}
                            >
                                <FaHome
                                    style={{
                                        margin: '0 auto',
                                        display: 'block',
                                    }}
                                />
                            </DialogButton>
                        )}
                        <DialogButton style={navButtonStyle} onClick={back}>
                            Back
                        </DialogButton>
                    </Focusable>
                </div>
                {pluginState == 'guide' && (
                    <Focusable
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ ...childStyle, marginRight: '5px' }}>
                            <DialogButton
                                style={{ minWidth: '0px' }}
                                onClick={() => {
                                    Router.CloseSideMenus();
                                    Router.Navigate('/deckfaqs-fullscreen');
                                }}
                            >
                                <BsArrowsFullscreen />
                            </DialogButton>
                        </div>
                        {currentGuide?.guideToc && (
                            <TocDropdown
                                style={childStyle}
                                serverApi={serverApi}
                            />
                        )}
                    </Focusable>
                )}
            </div>
        );
    }, [pluginState]);
};
