import { IncomingMessage } from 'http';
import { Pademelon } from '../nodejs-module';
import { ProxyHandler } from './ProxyHandler';

describe('ProxyHandler', () => {
    const port = 8080;
    const pademelon = new Pademelon({
        hostname: 'localhost:' + port,
        pathnamePrefix: '/pademelonprefix/',
        windowProp: 'pademelonInstance',
        browserPademelonDistUrl: '/pademelon.min.js',
        useHttp: true
    });
    const proxyHandler = new ProxyHandler(pademelon);
    proxyHandler.on('error', (err) => {
        throw err;
    });
    const testClientReq: IncomingMessage = {
        headers: {
            host: 'value_does_not_matter', // host is dependent on req.url
            referer: '/pademelonprefix/https://anotherdomain.com/anotherpath',
            origin: 'value_does_not_matter' // origin is dependent on referer
        },
        url: '/pademelonprefix/https://example.com'
    } as IncomingMessage;
    const testServerRes: IncomingMessage = {
        headers: {
            location: '/redirect'
        }
    } as IncomingMessage;

    describe('clientToServerHeaderRewrites', () => {
        proxyHandler.clientToServerHeaderRewrites(testClientReq);

        it('should rewrite host header', () => {
            expect(testClientReq.headers.host).toEqual('example.com');
        });
        it('should rewrite referer header', () => {
            expect(testClientReq.headers.referer).toEqual('https://anotherdomain.com/anotherpath');
        });
        it('should rewrite origin header with referer header', () => {
            expect(testClientReq.headers.origin).toEqual('https://anotherdomain.com');
        });
        it('should rewrite origin based on req.url given invalid referer header', () => {
            testClientReq.headers.referer = 'http://localhost:8080';
            testClientReq.url = '/pademelonprefix/https://example.com/paths';
            proxyHandler.clientToServerHeaderRewrites(testClientReq);
            expect(testClientReq.headers.origin).toEqual('https://example.com');
        });
        it('should rewrite origin header based on req.url given no referer header', () => {
            delete testClientReq.headers.referer;
            testClientReq.headers.origin = 'value_still_does_not_matter';
            testClientReq.url = '/pademelonprefix/https://example.com/paths';
            proxyHandler.clientToServerHeaderRewrites(testClientReq);
            expect(testClientReq.headers.origin).toEqual('https://example.com');
        });
        it('should rewrite origin header even if origin headers does not exist given mod is api', () => {
            delete testClientReq.headers.origin;
            testClientReq.url = '/pademelonprefix/ap_/https://example.com/morepaths';
            proxyHandler.clientToServerHeaderRewrites(testClientReq);
            expect(testClientReq.headers.origin).toEqual('https://example.com');
        });
        it('should not rewrite origin header if origin header does not exist given mod is not api', () => {
            delete testClientReq.headers.origin;
            testClientReq.url = '/pademelonprefix/https://example.com/morepaths';
            proxyHandler.clientToServerHeaderRewrites(testClientReq);
            expect(testClientReq.headers.origin).toEqual(undefined);
        });
    });
    describe('serverToClientHeaderRewrites', () => {
        proxyHandler.serverToClientHeaderRewrites(testServerRes, testClientReq);

        it('should rewrite location header', () => {
            expect(testServerRes.headers.location).toEqual('/pademelonprefix/https://example.com/redirect');
        });
        it('should rewrite location header with mod', () => {
            testClientReq.url = '/pademelonprefix/mod_/https://example.com';
            testServerRes.headers.location = '/path';
            proxyHandler.serverToClientHeaderRewrites(testServerRes, testClientReq);
            expect(testServerRes.headers.location).toEqual('/pademelonprefix/mod_/https://example.com/path');
        });
    });
    describe('contentTypeToModType', () => {
        it('returns invalid given content-type is undefined', () => {
            expect(proxyHandler['contentTypeToModType']()).toEqual('invalid');
        });
        it('returns invalid given content-type is invalid', () => {
            expect(proxyHandler['contentTypeToModType']('invalidcontent/type')).toEqual('invalid');
        });
        it('returns invalid given content-type is invalid without the slash', () => {
            expect(proxyHandler['contentTypeToModType']('invalidcontenttype')).toEqual('invalid');
        });
        it('returns html given text/html', () => {
            expect(proxyHandler['contentTypeToModType']('text/html')).toEqual('html');
        });
        it('returns html given anything/html', () => {
            expect(proxyHandler['contentTypeToModType']('anything/html')).toEqual('html');
        });
        it('returns html given text/html; charset=utf-8', () => {
            expect(proxyHandler['contentTypeToModType']('text/html; charset=utf-8')).toEqual('html');
        });
        it('returns raw given image/anything', () => {
            expect(proxyHandler['contentTypeToModType']('image/anything')).toEqual('raw');
        });
    });
    describe('modAndContentTypeToModType', () => {
        it('uses mod if mod exists and content-type header is valid', () => {
            expect(proxyHandler['modAndContentTypeToModType']('doesnotmatter/css', 'js_')).toEqual('javascript');
        });
        it('uses mod given content-type modType is raw/invalid', () => {
            expect(proxyHandler['modAndContentTypeToModType']('invalidcontenttype', 'cs_')).toEqual('stylesheet');
        });
        it('uses content-type given mod does not exist', () => {
            expect(proxyHandler['modAndContentTypeToModType']('text/css')).toEqual('stylesheet');
        });
        it('uses mod even if mod is invalid', () => {
            expect(proxyHandler['modAndContentTypeToModType']('text/css', 'invalidmod_')).toEqual('raw');
        });
        it('returns html given no content-type header or mod', () => {
            expect(proxyHandler['modAndContentTypeToModType']()).toEqual('html');
        });
    });
});
