import React, { useEffect, useState } from 'react';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');

        if (consent === 'granted') {
            updateConsent('granted');
        } else {
            setShowBanner(true);
        }
    }, []);

    const updateConsent = (status: 'granted' | 'denied') => {
        // @ts-ignore
        if (typeof window.gtag === 'function') {
            // @ts-ignore
            window.gtag('consent', 'update', {
                'ad_storage': status,
                'analytics_storage': status,
                'ad_user_data': status,
                'ad_personalization': status
            });
        }
    };

    const handleAccept = () => {
        updateConsent('granted');
        localStorage.setItem('cookieConsent', 'granted');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:p-6">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    <p>
                        We use cookies to improve your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies for these purposes.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
