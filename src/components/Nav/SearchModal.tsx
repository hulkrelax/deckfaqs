import { ModalRootProps, TextField } from 'decky-frontend-lib';
import React, { useState } from 'react';
import { EmptyModal } from '../EmptyModal';

type MyProps = ModalRootProps & {
    setModalResult?(result: string): void;
};

export const SearchModal = ({ closeModal, setModalResult }: MyProps) => {
    const [searchText, setSearchText] = useState('');
    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };
    const handleSubmit = () => {
        setModalResult && setModalResult(searchText);
    };
    return (
        <EmptyModal
            onCancel={() => {
                handleSubmit();
            }}
            closeModal={closeModal}
        >
            <form onSubmit={handleSubmit}>
                <TextField label="Search" onChange={handleText} />
            </form>
        </EmptyModal>
    );
};
