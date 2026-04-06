declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

import React, { useEffect } from 'react';

const GoogleTag = () => {
    useEffect(() => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        // Default consent to denied
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
        });

        // Load Google Tag script
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11375797246';
        script.async = true;
        document.head.appendChild(script);

        // Initialize config
        gtag('js', new Date());
        gtag('config', 'AW-11375797246');
        gtag('config', 'AW-17984489661');
        gtag('config', 'G-8M24FL4XQQ');

        return () => {
            // Cleanup if necessary (usually not for global tags)
        };
    }, []);

    return null;
};

export default GoogleTag;
