import { ModalRootProps, ModalRoot, TextField } from 'decky-frontend-lib';
import React, { useEffect, useRef, useState } from 'react';

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
        closeModal && closeModal();
    };
    const textField = useRef<any>();

    useEffect(() => {
        //This will open up the virtual keyboard
        textField.current?.element?.click();
    }, []);
    return (
        <ModalRoot closeModal={handleSubmit}>
            <form>
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
        </ModalRoot>
    );
};
