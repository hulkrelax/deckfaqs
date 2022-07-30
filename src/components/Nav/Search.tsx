import { DialogButton, showModal } from 'decky-frontend-lib';
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps } from '../../utils';
import { SearchModal } from './SearchModal';

const navButtonStyle = {
    height: '40px',
    width: '33%',
    minWidth: '0',
    display: 'inline-block',
    verticalAlign: 'bottom',
    padding: '10px 12px',
    flexGrow: 1,
    //margin: '0 auto',
};

export const Search = ({ serverApi: _serverApi }: DefaultProps) => {
    const {
        state: { search },
        dispatch,
    } = useContext(AppContext);

    const handleResult = (result: string) => {
        console.log(`handleResult(${result})`);
        dispatch({
            type: ActionType.UPDATE_SEARCH_TEXT,
            payload: {
                ...search,
                searchText: result,
            },
        });
    };
    return (
        <DialogButton
            style={navButtonStyle}
            onClick={() => {
                showModal(<SearchModal setModalResult={handleResult} />);
            }}
        >
            Search
        </DialogButton>
    );
};
