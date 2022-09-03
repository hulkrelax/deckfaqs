import {
    DialogButton,
    Focusable,
    QuickAccessTab,
    Router,
    showModal,
    ToggleField,
} from 'decky-frontend-lib';
import React, { useContext, useMemo } from 'react';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { FaHome } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps, gameSearch } from '../../utils';
import { Search } from './Search';
import { SearchModal } from './SearchModal';
import { TocDropdown } from './TocDropdown';

export const Nav = ({ serverApi }: DefaultProps) => {
    const {
        state: { pluginState, currentGuide, darkMode },
        dispatch,
    } = useContext(AppContext);

    const back = () => {
        dispatch({ type: ActionType.BACK });
    };

    const backToGames = () => {
        dispatch({ type: ActionType.BACK_TO_STATE, payload: 'games' });
    };

    const handleDarkMode = (result: boolean) => {
        dispatch({ type: ActionType.UPDATE_DARK_MODE, payload: result });
    };

    const handleSearch = (result: string) => {
        result = result.trim();
        result && gameSearch(result, serverApi, dispatch);
        Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
    };

    const btnStyle = {
        maxWidth: '32%',
        flexGrow: 1,
    };
    return useMemo(
        () =>
            pluginState !== 'games' ? (
                <div style={{ flex: '0 1 auto', padding: '0 10px' }}>
                    <Focusable
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            marginBottom: '5px',
                        }}
                    >
                        {pluginState !== 'results' && (
                            <DialogButton
                                //@ts-ignore
                                disableNavSounds={true}
                                style={{
                                    ...btnStyle,
                                    minWidth: '0px',
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
                        <DialogButton
                            //@ts-ignore
                            disableNavSounds={true}
                            style={btnStyle}
                            onClick={back}
                        >
                            Back
                        </DialogButton>
                    </Focusable>
                    {pluginState == 'guide' && (
                        <Focusable
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                            }}
                        >
                            <DialogButton
                                //@ts-ignore
                                disableNavSounds={true}
                                style={{
                                    ...btnStyle,
                                    marginRight: '5px',
                                    minWidth: '0px',
                                }}
                                onClick={() => {
                                    Router.CloseSideMenus();
                                    setTimeout(
                                        () =>
                                            Router.Navigate(
                                                '/deckfaqs-fullscreen'
                                            ),
                                        100
                                    );
                                }}
                            >
                                <BsArrowsFullscreen />
                            </DialogButton>
                            {currentGuide &&
                            currentGuide.guideToc!.length > 0 ? (
                                <TocDropdown
                                    style={{ ...btnStyle, minWidth: '160px' }}
                                    serverApi={serverApi}
                                />
                            ) : (
                                <Search />
                            )}
                        </Focusable>
                    )}
                </div>
            ) : (
                <div style={{ flex: '0 1 auto', padding: '0 10px' }}>
                    <DialogButton
                        //@ts-ignore
                        disableNavSounds={true}
                        style={{ ...btnStyle, marginBottom: '10px' }}
                        onClick={() => {
                            showModal(
                                <SearchModal
                                    promptText="Search for a game"
                                    setModalResult={handleSearch}
                                />
                            );
                        }}
                    >
                        Search games
                    </DialogButton>
                    <ToggleField
                        label="Enable Dark Mode?"
                        description={`Enable Dark Mode for Guides`}
                        checked={darkMode}
                        onChange={handleDarkMode}
                    />
                </div>
            ),
        [pluginState, darkMode, currentGuide?.guideToc]
    );
};
