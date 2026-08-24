import React, { useEffect, useState } from 'react';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [liftForStickyCta, setLiftForStickyCta] = useState(false);

    useEffect(() => {
        setLiftForStickyCta(/^\/companies\/[^/]+\/?$/.test(window.location.pathname));
        const consent = localStorage.getItem('cookieConsent');

        if (consent === 'granted' || consent === 'denied') {
            updateConsent(consent as 'granted' | 'denied');
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

    const handleChoice = (status: 'granted' | 'denied') => {
        updateConsent(status);
        localStorage.setItem('cookieConsent', status);
        // Der Meta-Pixel hört auf dieses Ereignis und lädt nur bei 'granted'.
        window.dispatchEvent(new CustomEvent('relofinder:cookie-consent', { detail: { status } }));
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className={`fixed left-3 right-3 z-[80] md:bottom-6 md:left-6 md:right-auto md:max-w-md ${liftForStickyCta ? 'bottom-20' : 'bottom-3'}`}>
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur md:p-4">
                <div className="flex items-center gap-3 md:items-start md:gap-4">
                    <div className="min-w-0 flex-1 text-xs leading-relaxed text-slate-600 md:text-sm">
                        We use analytics to improve ReloFinder and, with your consent, marketing cookies (Meta Pixel) so we and our affiliated brand Expat Savvy can show you relevant ads. See our <a href="/privacy" className="underline">privacy notice</a>.
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            onClick={() => handleChoice('denied')}
                            className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 md:text-sm"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => handleChoice('granted')}
                            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#FF6F61] md:text-sm"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
