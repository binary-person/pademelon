/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite history', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true,
    });

    it('should rewrite pushState', () => {
        history.pushState = jest.fn();

        pademelonInstance.initWindowRewrites();

        history.pushState(null, '', '/otherapp');
        expect(history.pushState).toHaveBeenCalledWith(null, '', '/prefix/https://proxiedsite.com/otherapp');
    });
    it('should rewrite replaceState', () => {
        history.replaceState = jest.fn();

        pademelonInstance.initWindowRewrites();

        history.replaceState(null, '', '/otherapp');
        expect(history.replaceState).toHaveBeenCalledWith(null, '', '/prefix/https://proxiedsite.com/otherapp');
    });
});
