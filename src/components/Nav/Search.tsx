import { DialogButton, showModal } from 'decky-frontend-lib';
import React, { useContext } from 'react';
import { BsSearch, BsArrowBarDown, BsArrowBarUp } from 'react-icons/bs';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps } from '../../utils';
import { SearchModal } from './SearchModal';

const childStyle = {
    flexGrow: '1',
    minWidth: '0px',
    padding: '0px',
};

export const Search = ({ serverApi: _serverApi }: DefaultProps) => {
    const {
        state: { search },
        dispatch,
    } = useContext(AppContext);

    const handleResult = (result: string) => {
        dispatch({
            type: ActionType.UPDATE_SEARCH,
            payload: {
                ...search,
                searchText: result,
            },
        });
    };
    return (
        <>
            <DialogButton
                style={{ ...childStyle, maxWidth: '32%', marginRight: '5px' }}
                onClick={() => {
                    dispatch({
                        type: ActionType.UPDATE_SEARCH,
                        payload: {
                            searchText: '',
                            searchAnchorLength: 0,
                            anchorIndex: 0,
                        },
                    });
                    showModal(<SearchModal setModalResult={handleResult} />);
                }}
            >
                <BsSearch />
            </DialogButton>
            <DialogButton
                style={{ ...childStyle, maxWidth: '10%', marginRight: '5px' }}
                onClick={() => {
                    const anchorIndex = search.anchorIndex - 1;
                    anchorIndex >= 0 &&
                        dispatch({
                            type: ActionType.UPDATE_SEARCH,
                            payload: { ...search, anchorIndex: anchorIndex },
                        });
                }}
            >
                <BsArrowBarUp />
            </DialogButton>
            <DialogButton
                style={{ ...childStyle, maxWidth: '10%' }}
                onClick={() => {
                    const anchorIndex = search.anchorIndex + 1;
                    anchorIndex < search.searchAnchorLength &&
                        dispatch({
                            type: ActionType.UPDATE_SEARCH,
                            payload: {
                                ...search,
                                anchorIndex: anchorIndex,
                            },
                        });
                }}
            >
                <BsArrowBarDown />
            </DialogButton>
        </>
    );
};
