/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite XMLHttpRequest.prototype', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });

    it('should rewrite open correctly', () => {
        XMLHttpRequest.prototype.open = jest.fn();

        pademelonInstance.initWindowRewrites();

        const request = new XMLHttpRequest();
        request.open('GET', '/asset.png');
        expect(request.open).toHaveBeenCalledWith('GET', '/prefix/ap_/https://proxiedsite.com/asset.png');
    });
});
