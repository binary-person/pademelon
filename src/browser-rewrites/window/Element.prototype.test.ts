/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite Element.prototype', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });

    it('should rewrite getAttribute', () => {
        Element.prototype.getAttribute = () => '/prefix/https://proxiedsite.com/asset.js';

        pademelonInstance.initWindowRewrites();

        const scriptElement = document.createElement('script');
        expect(scriptElement.getAttribute('src')).toEqual('https://proxiedsite.com/asset.js');
        expect(scriptElement.getAttribute('someotherattribute')).toEqual('/prefix/https://proxiedsite.com/asset.js');
    });
    it('should rewrite setAttribute', () => {
        Element.prototype.setAttribute = jest.fn();

        pademelonInstance.initWindowRewrites();

        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', '/asset.js');
        scriptElement.setAttribute('someotherattribute', '/asset.js');
        expect(scriptElement.setAttribute).toHaveBeenNthCalledWith(
            1,
            'src',
            '/prefix/js_/https://proxiedsite.com/asset.js'
        );
        expect(scriptElement.setAttribute).toHaveBeenNthCalledWith(2, 'someotherattribute', '/asset.js');
    });
});
