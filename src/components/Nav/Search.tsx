import {
    DialogButton,
    findSP,
    Navigation,
    QuickAccessTab,
    showModal,
} from 'decky-frontend-lib';
import React, { useContext } from 'react';
import { BsSearch, BsArrowBarDown, BsArrowBarUp } from 'react-icons/bs';
import { AppContext, initSearchState } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { SearchModal } from './SearchModal';

const childStyle = {
    flexGrow: '1',
    minWidth: '0px',
    padding: '0px',
};

type SearchProps = {
    fullScreen?: boolean;
};

export const Search = ({ fullScreen }: SearchProps) => {
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
        if (!fullScreen) {
            Navigation.OpenQuickAccessMenu(QuickAccessTab.Decky);
        }
    };
    return (
        <>
            <DialogButton
                //@ts-ignore
                disableNavSounds={true}
                style={{ ...childStyle, maxWidth: '32%', marginRight: '5px' }}
                onClick={() => {
                    dispatch({
                        type: ActionType.UPDATE_SEARCH,
                        payload: initSearchState,
                    });
                    showModal(
                        <SearchModal
                            promptText="Search the guide"
                            setModalResult={handleResult}
                        />,
                        findSP()
                    );
                }}
            >
                <BsSearch />
            </DialogButton>
            <DialogButton
                //@ts-ignore
                disableNavSounds={true}
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
                //@ts-ignore
                disableNavSounds={true}
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
