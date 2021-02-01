/**
 * @jest-environment jsdom
 */

import Pademelon = require('../../browser-module');

describe('rewrite fetch, Request, and Response', () => {
    history.pushState(null, '', '/prefix/https://proxiedsite.com');
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });

    it('should rewrite correctly', async () => {
        window.Response = function (this: any, options: { url: string }) {
            this.innerUrl = options.url;
        } as any;
        window.Response.prototype = {
            get url() {
                return this.innerUrl;
            }
        } as any;
        // using jest mocks to create a new constructor, to fix '_Request is not a constructor'
        window.Request = jest.fn().mockImplementation((input: string | { url: string }) => {
            return typeof input === 'string' ? { url: input } : input;
        }) as any;
        window.fetch = jest.fn().mockImplementation((requestObj: { url: string }) => {
            return new Promise((resolve) => {
                resolve(new Response(requestObj as any));
            });
        });

        pademelonInstance.initWindowRewrites();

        // checks Response is rewritten correctly
        expect((await window.fetch('/asset.png')).url).toEqual('https://proxiedsite.com/asset.png');
        // checks Request and fetch is rewritten correctly
        expect(window.fetch).toBeCalledWith({ url: '/prefix/ap_/https://proxiedsite.com/asset.png' });
    });
});
