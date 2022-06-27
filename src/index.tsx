import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib'
import React from 'react'
import { FaSearch } from 'react-icons/fa'
import { App } from './components/App/App'

export default definePlugin((serverApi: ServerAPI) => {
    return {
        title: <div className={staticClasses.Title}>DeckFAQs</div>,
        content: <App serverAPI={serverApi} />,
        icon: <FaSearch />,
    }
})
