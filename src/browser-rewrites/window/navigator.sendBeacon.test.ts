/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite navigator.sendBeacon', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });

    it('should rewrite correctly', () => {
        window.navigator.sendBeacon = jest.fn();

        pademelonInstance.initWindowRewrites();

        window.navigator.sendBeacon('/ping', 'data');
        expect(window.navigator.sendBeacon).toBeCalledWith('/prefix/ap_/https://proxiedsite.com/ping', 'data');
    });
});
