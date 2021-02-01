/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite HTMLElements', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true,
    });

    it('should rewrite script src with mod correctly', () => {
        const setterMock = jest.fn();
        Object.defineProperty(HTMLScriptElement.prototype, 'src', {
            get: () => '/prefix/https://proxiedsite.com/script.js',
            set: setterMock
        });

        pademelonInstance.initWindowRewrites();

        const scriptElement = document.createElement('script');
        expect(scriptElement.src).toEqual('https://proxiedsite.com/script.js');
        scriptElement.src = '/asset.js';
        expect(setterMock).toHaveBeenCalledWith('/prefix/js_/https://proxiedsite.com/asset.js');
    });
    it('should rewrite special attribute srcset correctly', () => {
        const setterMock = jest.fn();
        Object.defineProperty(HTMLImageElement.prototype, 'srcset', {
            get: () => '/prefix/https://proxiedsite.com/size1.png 1x, /prefix/https://proxiedsite.com/size2.png 2x',
            set: setterMock
        });

        pademelonInstance.initWindowRewrites();

        const imgElement = document.createElement('img');
        expect(imgElement.srcset).toEqual('https://proxiedsite.com/size1.png 1x, https://proxiedsite.com/size2.png 2x');
        imgElement.srcset = '/size3.png 3x, /size4.png 4x';
        expect(setterMock).toHaveBeenCalledWith('/prefix/rw_/https://proxiedsite.com/size3.png 3x, /prefix/rw_/https://proxiedsite.com/size4.png 4x');
    });
});