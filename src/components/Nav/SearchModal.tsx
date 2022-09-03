import { ModalRootProps, TextField } from 'decky-frontend-lib';
import React, { useEffect, useRef, useState } from 'react';
import { EmptyModal } from '../EmptyModal';

type MyProps = ModalRootProps & {
    setModalResult?(result: string): void;
    promptText: string;
};

export const SearchModal = ({
    closeModal,
    setModalResult,
    promptText,
}: MyProps) => {
    const [searchText, setSearchText] = useState('');
    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };
    const handleSubmit = () => {
        setModalResult && setModalResult(searchText);
    };
    const textField = useRef<any>();

    useEffect(() => {
        //This will open up the virtual keyboard
        textField.current?.element?.click();
    }, []);
    return (
        <EmptyModal
            onCancel={() => {
                handleSubmit();
            }}
            closeModal={closeModal}
        >
            <form onSubmit={handleSubmit}>
                <TextField
                    //@ts-ignore
                    ref={textField}
                    focusOnMount={true}
                    label="Search"
                    //@ts-ignore
                    placeholder={promptText}
                    onChange={handleText}
                />
            </form>
        </EmptyModal>
    );
};
