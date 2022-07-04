import { findModuleChild, Module } from 'decky-frontend-lib'
import MyRouter from '../../MyRouter'

export const MyRouter = findModuleChild((m: Module) => {
    if (typeof m !== 'object') return undefined
    for (let prop in m) {
        if (m[prop]?.Navigate && m[prop]?.NavigationManager) return m[prop]
    }
}) as MyRouter
