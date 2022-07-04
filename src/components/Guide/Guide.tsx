import { DialogButton, Router, ServerAPI } from 'decky-frontend-lib'
import React, { useContext, useMemo } from 'react'
import { useEffect } from 'react'
import { BsArrowsFullscreen } from 'react-icons/bs'
import { AppContext, AppContextProvider } from '../../context/AppContext'
import { FullScreenGuide } from '../FullScreenGuide/FullScreenGuide'

type GuideProps = {
    serverApi: ServerAPI
}

export const guideStyle = {
    border: 'none',
    overflow: 'hidden',
    height: '100%',
}

export const Guide = ({ serverApi }: GuideProps) => {
    const { state } = useContext(AppContext)
    const { currentGuide } = state
    const guideText = currentGuide?.guideText
    const guideUrl = currentGuide?.guideUrl
    useEffect(() => {
        serverApi.routerHook.addRoute('/deckfaqs-fullscreen', () => {
            return (
                <AppContextProvider initState={state}>
                    <FullScreenGuide />
                </AppContextProvider>
            )
        })
        return function cleanup() {
            serverApi.routerHook.removeRoute('/deckfaqs-fullscreen')
        }
    }, [])

    const guide = guideText ? (
        <div style={{ height: '100%', overflowY: 'scroll' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{guideText}</pre>
        </div>
    ) : (
        <div style={{ height: '400px' }}>
            <iframe src={guideUrl} style={guideStyle} sandbox="" />
        </div>
    )
    return useMemo(
        () => (
            <>
                <DialogButton
                    layout="below"
                    style={{ marginBottom: '5px' }}
                    onClick={() => {
                        Router.CloseSideMenus()
                        Router.Navigate('/deckfaqs-fullscreen')
                    }}
                >
                    <BsArrowsFullscreen />
                </DialogButton>
                {guide}
            </>
        ),
        [currentGuide]
    )
}
