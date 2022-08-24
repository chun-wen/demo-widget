import React from 'react';
import parse from 'html-react-parser';
import DEFAULT_WORD from '../../../../../constants/index';
const { disclaimerZh_HK, disclaimerEn } = DEFAULT_WORD;

const Disclaimer = props => {
    const { locale: propsLocale } = props;
    return (
        <>
            <div className="rw-message rw-with-avatar">
                <div className="rw-response">
                    <div className="response">
                        <div className="rm-markdown">
                            {propsLocale === 'zh'
                                ? parse(`${disclaimerZh_HK}`)
                                : parse(`${disclaimerEn}`)}
                            <div />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Disclaimer;
