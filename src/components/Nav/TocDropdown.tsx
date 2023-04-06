import { Dropdown } from 'decky-frontend-lib';
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { ActionType } from '../../reducers/AppReducer';
import { DefaultProps, getGuideHtml } from '../../utils';

type TocDropdownProps = DefaultProps & {
    style?: React.CSSProperties;
};

export const TocDropdown = ({ serverApi, style }: TocDropdownProps) => {
    const {
        state: { currentGuide },
        dispatch,
        browserView,
    } = useContext(AppContext);
    const handleTOCChange = (data: any) => {
        const path: string = data.data;
        let anchor: string | undefined = undefined;
        const href = `${currentGuide?.guideUrl}/${path}`;
        if (path.startsWith('#')) {
            anchor = path.substring(1);
            dispatch({
                type: ActionType.UPDATE_GUIDE,
                payload: { ...currentGuide, anchor, currentTocSection: path },
            });
        } else {
            dispatch({ type: ActionType.UPDATE_LOADING, payload: true });
            getGuideHtml(href, serverApi, browserView, (result: string) => {
                if (path.indexOf('#') > 0) {
                    anchor = path.substring(path.indexOf('#') + 1);
                }
                dispatch({
                    type: ActionType.UPDATE_GUIDE,
                    payload: {
                        ...currentGuide,
                        guideHtml: result,
                        anchor,
                        currentTocSection: path,
                    },
                });
            });
        }
    };
    return (
        <div style={style}>
            <Dropdown
                //@ts-ignore
                disableNavSounds={true}
                rgOptions={currentGuide?.guideToc ?? []}
                strDefaultLabel="TOC"
                selectedOption={currentGuide?.currentTocSection}
                renderButtonValue={(e) => {
                    return (
                        <div
                            style={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {e}
                        </div>
                    );
                }}
                onChange={handleTOCChange}
            />
        </div>
    );
};
