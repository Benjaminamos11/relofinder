import React, { useEffect } from 'react';

/**
 * Meta-Pixel — lädt ausschliesslich nach Einwilligung.
 *
 * Die Zielgruppe wird auch für Werbung der verbundenen Marke Expat Savvy
 * genutzt (Grundversicherung ist in der Schweiz innert drei Monaten nach
 * Zuzug obligatorisch). Offengelegt im Datenschutzhinweis.
 */
const PIXEL_ID = '1215428584096183';

const FacebookPixel = () => {
    useEffect(() => {
        const load = () => {
            const w = window as any;
            if (w.__rfPixelLoaded) return;
            w.__rfPixelLoaded = true;

            const n: any = (w.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            });
            if (!w._fbq) w._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];

            const t = document.createElement('script');
            t.async = true;
            t.src = 'https://connect.facebook.net/en_US/fbevents.js';
            const s = document.getElementsByTagName('script')[0];
            if (s && s.parentNode) s.parentNode.insertBefore(t, s);

            n('init', PIXEL_ID);
            n('track', 'PageView');
        };

        if (localStorage.getItem('cookieConsent') === 'granted') load();

        const onConsent = (e: Event) => {
            if ((e as CustomEvent).detail?.status === 'granted') load();
        };
        window.addEventListener('relofinder:cookie-consent', onConsent);
        return () => window.removeEventListener('relofinder:cookie-consent', onConsent);
    }, []);

    return null;
};

export default FacebookPixel;
