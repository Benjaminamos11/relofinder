import React, { useEffect } from 'react';

const FacebookPixel = () => {
    useEffect(() => {
        const f = (window as any).fbq;
        if (f) return; // Already loaded

        const n: any = (window as any).fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };

        if (!(window as any)._fbq) (window as any)._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];

        const t = document.createElement('script');
        t.async = !0;
        t.src = 'https://connect.facebook.net/en_US/fbevents.js';
        const s = document.getElementsByTagName('script')[0];
        if (s && s.parentNode) {
            s.parentNode.insertBefore(t, s);
        }

        n('init', '1393006485701609');
        n('track', 'PageView');
    }, []);

    return (
        <noscript>
            <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src="https://www.facebook.com/tr?id=1393006485701609&ev=PageView&noscript=1"
                alt=""
            />
        </noscript>
    );
};

export default FacebookPixel;
