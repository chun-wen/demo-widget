import React from 'react';
import { useMemo } from 'react';

import DEFAULT_WORD  from '../../../../../constants/index';

const {
    connectionFailZh_HK,
    connectionFailEn,
    connectionFailRetryButtonZh_HK,
    connectionFailRetryButtonEn,
} = DEFAULT_WORD;


const OfflineUI = (props) => {
    const { locale: propsLocale } = props;

    const connectionFailWord =
        propsLocale === 'zh' ? `${connectionFailZh_HK}` : `${connectionFailEn}`;
    const retryButton =
        propsLocale === 'zh'
            ? `${connectionFailRetryButtonZh_HK}`
            : `${connectionFailRetryButtonEn}`;
    const divStyle = useMemo(
        () => ({
            maxHeight: 'calc(100vh - 112px)',
            minHeight: 'calc(100vh - 112px)',
        }),
        []
    );

    return (
        <>
            <div
                style={divStyle}
                className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-xl tw-text-center"
            >
                <p className="tw-font-bold tw-mb-4 tw-font-body">{connectionFailWord}</p>
                <button
                    onClick={() => {
                        window.location.reload();
                    }}
                    type="button"
                    className="tw-text-sm tw-font-bold tw-font-body tw-border-solid tw-border tw-border-blue-700 tw-text-blue-800  tw-py-2 tw-px-5 tw-rounded-xl"
                >
                    {retryButton}
                </button>
            </div>
        </>
    );
};

export default OfflineUI;
