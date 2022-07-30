import { ModalRootProps } from 'decky-frontend-lib';
import { findModuleChild } from 'decky-frontend-lib';
import { FC } from 'react';

export const EmptyModal = findModuleChild((m) => {
    if (typeof m !== 'object') return undefined;
    for (let prop in m) {
        if (
            m[prop]?.prototype?.OK &&
            m[prop]?.prototype?.Cancel &&
            m[prop]?.prototype?.render
        ) {
            return m[prop];
        }
    }
}) as FC<ModalRootProps>;
