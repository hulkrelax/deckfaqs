import {
    ModalRootProps,
    QuickAccessTab,
    Router,
    TextField,
} from 'decky-frontend-lib';
import React, { useState } from 'react';
import { EmptyModal } from '../EmptyModal';

type MyProps = ModalRootProps & {
    setModalResult?(result: string): void;
};

export const SearchModal = ({ closeModal, setModalResult }: MyProps) => {
    const [searchText, setSearchText] = useState('');
    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setSearchText(e.target.value);
    };
    const showData = () => {
        setModalResult && setModalResult(searchText);
        Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
    };
    return (
        <EmptyModal
            onCancel={() => {
                Router.OpenQuickAccessMenu(QuickAccessTab.Decky);
            }}
            closeModal={closeModal}
        >
            <form onSubmit={showData}>
                <TextField label="Search" onChange={handleText} />
            </form>
        </EmptyModal>
    );
};
