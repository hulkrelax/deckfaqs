import {
    DialogButton,
    Focusable,
    QuickAccessTab,
    Router,
    ServerAPI,
} from 'decky-frontend-lib';
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Guide } from '../Guide/Guide';

const guideStyle = {
    border: 'none',
    overflow: 'hidden',
    height: '100%',
    width: '100%',
};

const navButtonStyle = {
    height: '40px',
    width: '200px',
    minWidth: '0',
    padding: '10px 12px',
};

type FullGuideProps = {
    serverApi: ServerAPI;
};
export const FullScreenGuide = ({ serverApi }: FullGuideProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                marginTop: '50px',
                flexGrow: '1',
                overflow: 'auto',
            }}
        >
            <div
                style={{
                    marginBottom: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    display: 'flex',
                }}
            >
                <Focusable>
                    {Router.MainRunningApp !== undefined && (
                        <DialogButton
                            style={{ ...navButtonStyle, marginRight: '10px' }}
                            onClick={() => {
                                Router.NavigateBackOrOpenMenu();
                                setTimeout(
                                    () => Router.NavigateToRunningApp(),
                                    200
                                );
                            }}
                        >
                            Back to Game
                        </DialogButton>
                    )}
                    <DialogButton
                        style={navButtonStyle}
                        onClick={() => {
                            Router.NavigateBackOrOpenMenu();
                            setTimeout(
                                () =>
                                    Router.OpenQuickAccessMenu(
                                        QuickAccessTab.Decky
                                    ),
                                200
                            );
                        }}
                    >
                        Back to DeckFAQs
                    </DialogButton>
                </Focusable>
            </div>
            <Guide fullscreen={true} serverApi={serverApi} />
        </div>
    );
};
