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

        /* Opt-out statt Opt-in (Entscheidung Benjamin, 2026-08-28): nur eine
           ausdrückliche Ablehnung hält das Pixel zurück. Das Schweizer DSG
           verlangt Transparenz und eine Widerspruchsmöglichkeit, keine
           vorherige Einwilligung; das Banner informiert und lässt ablehnen. */
        if (localStorage.getItem('cookieConsent') !== 'denied') load();

        const onConsent = (e: Event) => {
            const status = (e as CustomEvent).detail?.status;
            if (status === 'granted') load();
            /* Das Pixel läuft hier bereits — eine Ablehnung muss es aktiv
               stoppen, sonst sendet es trotz Nein weiter. */
            if (status === 'denied' && typeof (window as any).fbq === 'function') {
                try { (window as any).fbq('consent', 'revoke'); } catch { /* egal */ }
            }
        };
        window.addEventListener('relofinder:cookie-consent', onConsent);
        return () => window.removeEventListener('relofinder:cookie-consent', onConsent);
    }, []);

    return null;
};

export default FacebookPixel;
