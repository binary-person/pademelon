import { UrlRewriter } from './UrlRewriter';

describe('UrlRewriter', () => {
    let testRewriteUrlIntercept = false;
    let testUnrewriteUrlIntercept = false;
    const urlRewriter = new UrlRewriter({
        hostname: 'proxysite.com',
        pathnamePrefix: '/proxyprefix/',
        blacklistPrefixes: ['https://ignored.com'],
        rewriteUrlIntercept: (url) => {
            if (!testRewriteUrlIntercept) return url;
            return '/rewriteModified' + url;
        },
        unrewriteUrlIntercept: (url) => {
            if (!testUnrewriteUrlIntercept) return url;
            // cancel out effects of rewriteUrlIntercept
            return url.replace(/^\/rewriteModified/, '');
        }
    });

    describe('rewriteUrl', () => {
        // relative protocol tests
        it('should rewrite relative protocols correctly', () => {
            expect(urlRewriter.rewriteUrl('//relativeprotocol.com', '/proxyprefix/https://proxiedsite.com')).toEqual(
                'https://proxysite.com/proxyprefix/https://relativeprotocol.com/'
            );
        });
        it('should rewrite relative protocols with mod correctly', () => {
            expect(
                urlRewriter.rewriteUrl('//relativeprotocol.com', '/proxyprefix/https://proxiedsite.com', 'mod_')
            ).toEqual('https://proxysite.com/proxyprefix/mod_/https://relativeprotocol.com/');
        });

        // ws/wss protocol tests
        it('should rewrite ws protocol correctly', () => {
            expect(urlRewriter.rewriteUrl('ws://relativeprotocol.com', '/proxyprefix/ws://proxiedsite.com')).toEqual(
                'wss://proxysite.com/proxyprefix/ws://relativeprotocol.com/'
            );
        });
        it('should rewrite wss protocol correctly', () => {
            expect(urlRewriter.rewriteUrl('wss://relativeprotocol.com', '/proxyprefix/wss://proxiedsite.com')).toEqual(
                'wss://proxysite.com/proxyprefix/wss://relativeprotocol.com/'
            );
        });
        it('should rewrite wss protocol with mod correctly', () => {
            expect(
                urlRewriter.rewriteUrl('wss://relativeprotocol.com', '/proxyprefix/wss://proxiedsite.com', 'mod_')
            ).toEqual('wss://proxysite.com/proxyprefix/mod_/wss://relativeprotocol.com/');
        });

        // absolute path tests
        it('should rewrite absolute paths with rewritten absolute paths correctly', () => {
            expect(urlRewriter.rewriteUrl('/absolutepath.asset.png', '/proxyprefix/https://proxiedsite.com')).toEqual(
                '/proxyprefix/https://proxiedsite.com/absolutepath.asset.png'
            );
        });

        // relative path tests
        it('should rewrite relative paths with rewritten relative paths correctly', () => {
            expect(urlRewriter.rewriteUrl('relative/path/asset.png', '/proxyprefix/https://proxiedsite.com')).toEqual(
                '/proxyprefix/https://proxiedsite.com/relative/path/asset.png'
            );
        });
        it('should rewrite relative paths given site with no trailing slash correctly', () => {
            expect(
                urlRewriter.rewriteUrl('relative/path/asset.png', '/proxyprefix/https://proxiedsite.com/app')
            ).toEqual('/proxyprefix/https://proxiedsite.com/relative/path/asset.png');
        });
        it('should rewrite relative paths given site with trailing slash correctly', () => {
            expect(
                urlRewriter.rewriteUrl('relative/path/asset.png', '/proxyprefix/https://proxiedsite.com/app/')
            ).toEqual('/proxyprefix/https://proxiedsite.com/app/relative/path/asset.png');
        });

        // test differing proxyPaths
        it('should return original url when provided an invalid proxyPath', () => {
            expect(
                urlRewriter.rewriteUrl('relative/path/asset.png', '/notvalidprefix/https://proxiedsite.com')
            ).toEqual('relative/path/asset.png');
        });
        it('should rewrite relative when provided a full proxyPath', () => {
            expect(
                urlRewriter.rewriteUrl(
                    'relative/path/asset.png',
                    'https://proxysite.com/proxyprefix/https://proxiedsite.com'
                )
            ).toEqual('/proxyprefix/https://proxiedsite.com/relative/path/asset.png');
        });

        // test blacklist
        it('should return original when url matches blacklist', () => {
            expect(urlRewriter.rewriteUrl('/relative/path/asset.png', 'https://ignored.com/app/')).toEqual(
                '/relative/path/asset.png'
            );
        });

        // test intercept
        it('should be intercepted correctly provided there is a rewriteUrlIntercept function', () => {
            testRewriteUrlIntercept = true;
            expect(urlRewriter.rewriteUrl('relative/path/asset.png', '/proxyprefix/https://proxiedsite.com')).toEqual(
                '/rewriteModified/proxyprefix/https://proxiedsite.com/relative/path/asset.png'
            );
            testRewriteUrlIntercept = false;
        });
    });
    describe('unrewriteUrl', () => {
        it('should unrewrite urls given absolute proxy path correctly', () => {
            expect(urlRewriter.unrewriteUrl('/proxyprefix/https://example.com')).toStrictEqual({
                url: 'https://example.com',
                mod: undefined
            });
        });
        it('should unrewrite urls given absolute proxy path with mod correctly', () => {
            expect(urlRewriter.unrewriteUrl('/proxyprefix/mod_/https://example.com')).toStrictEqual({
                url: 'https://example.com',
                mod: 'mod_'
            });
        });
        it('should return original url and fail true given invalid proxy path', () => {
            expect(urlRewriter.unrewriteUrl('/notvalidprefix/https://example.com')).toStrictEqual({
                url: '/notvalidprefix/https://example.com',
                fail: true
            });
        });
        it('should unrewrite urls given full proxy path correctly', () => {
            expect(urlRewriter.unrewriteUrl('https://proxysite.com/proxyprefix/https://example.com')).toStrictEqual({
                url: 'https://example.com',
                mod: undefined
            });
        });
        it('should be intercepted correctly provided there is a unrewriteUrlIntercept function', () => {
            testUnrewriteUrlIntercept = true;
            expect(urlRewriter.unrewriteUrl('/rewriteModified/proxyprefix/https://example.com')).toStrictEqual({
                url: 'https://example.com',
                mod: undefined
            });
            testRewriteUrlIntercept = false;
        });
    });
});
