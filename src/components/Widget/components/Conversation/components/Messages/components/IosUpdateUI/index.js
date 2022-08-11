import { useMemo } from 'react';

const IosUpdateUI = () => {
    const divStyle = useMemo(
        () => ({
            maxHeight: 'calc(100vh - 112px)',
            minHeight: 'calc(100vh - 112px)',
            margin: '0 75px 0 75px',
        }),
        []
    );

    return (
        <>
            <div
                style={divStyle}
                className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-text-base	 tw-text-center"
            >
                <p className="tw-font-body  tw-mb-4">
                    很抱歉！MallMall 查已更新，請 iOS 用戶下載 HKTVmall 最新版本 v3.0.2
                    以體驗昇級客戶服務。如有查詢，歡迎
                    <a
                        href="https://hktv.secure.force.com/form/Form_prechat?from=Chatbot"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="tw-text-blue-700"
                    >
                        【按此】
                    </a>
                    填寫表格，同事會儘快為您跟進。
                </p>
                <p className="tw-font-body tw-mb-10">
                    Sorry! MallMall Chat was updated, iOS user is recommend to download the latest
                    HKTVmall App version 3.0.2 for better customer service experience. If you have
                    any enquiry, please
                    <a
                        href="https://hktv.secure.force.com/form/Form_prechat?from=Chatbot"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="tw-text-blue-700"
                    >
                        【Click Here】
                    </a>
                    to fill in the form and we will get back to you shortly.
                </p>
                <button
                    onClick={() => {
                        window.location.href =
                            'https://apps.apple.com/hk/app/hktvmall-online-shopping/id910398738';
                    }}
                    type="button"
                    className="tw-font-bold tw-font-body tw-border-solid tw-border  tw-text-blue-800  tw-py-2 tw-px-5 tw-rounded-xl"
                >
                    立即更新 Update now
                </button>
            </div>
        </>
    );
};

export default IosUpdateUI;
