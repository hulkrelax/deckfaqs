import { DialogButton, QuickAccessTab, Router } from 'decky-frontend-lib'
import React, { useContext } from 'react'
import { MyRouter } from '../App/MyRouter'
import { AppContext } from '../../context/AppContext'

const guideStyle = {
    border: 'none',
    overflow: 'hidden',
    height: '100%',
    width: '100%',
}

const navButtonStyle = {
    height: '40px',
    width: '200px',
    minWidth: '0',
    padding: '10px 12px',
}

export const FullScreenGuide = () => {
    const {
        state: { currentGuide },
    } = useContext(AppContext)
    return (
        <div style={{ marginTop: '50px', color: 'white' }}>
            <div
                style={{
                    marginBottom: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    display: 'flex',
                }}
            >
                {MyRouter.MainRunningApp !== undefined && (
                    <DialogButton
                        style={{ ...navButtonStyle, marginRight: '10px' }}
                        onClick={() => {
                            Router.NavigateBackOrOpenMenu()
                            setTimeout(
                                () => MyRouter.NavigateToRunningApp(),
                                200
                            )
                        }}
                    >
                        Back to Game
                    </DialogButton>
                )}
                <DialogButton
                    style={navButtonStyle}
                    onClick={() => {
                        Router.NavigateBackOrOpenMenu()
                        setTimeout(
                            () =>
                                Router.OpenQuickAccessMenu(
                                    QuickAccessTab.Decky
                                ),
                            200
                        )
                    }}
                >
                    Back to DeckFAQs
                </DialogButton>
            </div>
            <div style={{ height: '400px' }}>
                <iframe
                    src={currentGuide?.guideUrl}
                    style={guideStyle}
                    sandbox=""
                />
            </div>
        </div>
    )
}
