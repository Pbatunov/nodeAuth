import {useEffect, useState} from 'react';

// Значения совпадают с $bp-mobile и $bp-tablet из styles/_breakpoints.scss
const MOBILE_MAX = 640;
const TABLET_MAX = 980;

const QUERIES = {
    mobile: `(max-width: ${MOBILE_MAX}px)`,
    tablet: `(min-width: ${MOBILE_MAX + 1}px) and (max-width: ${TABLET_MAX}px)`,
};

const getDeviceType = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
    if (window.matchMedia(QUERIES.mobile).matches) return 'mobile';
    if (window.matchMedia(QUERIES.tablet).matches) return 'tablet';
    return 'desktop';
};

export default function useDeviceType() {
    const [deviceType, setDeviceType] = useState(getDeviceType);

    useEffect(() => {
        if (!window.matchMedia) return undefined;

        const mediaLists = Object.values(QUERIES).map((q) => window.matchMedia(q));
        const update = () => setDeviceType(getDeviceType());

        mediaLists.forEach((mql) => mql.addEventListener('change', update));
        update();

        return () => mediaLists.forEach((mql) => mql.removeEventListener('change', update));
    }, []);

    return deviceType;
}
