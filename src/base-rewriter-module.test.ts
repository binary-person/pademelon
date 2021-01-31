import { BasePademelon } from './base-rewriter-module';

describe('base rewriter module', () => {
    describe('should rewrite css correctly', () => {
        const pademelon = new BasePademelon({
            hostname: 'proxysite.com',
            pathnamePrefix: '/proxy/',
            windowProp: 'pademelonInstance',
        });
        it('should have correctly rewritten css', () => {
            const cssFile = '@import "/someother.css"; body{background-color: url(asset.png)}';
            expect(pademelon.rewriteCSS(cssFile, '/proxy/https://example.com')).toEqual(
                '@import "/proxy/cs_/https://example.com/someother.css"; body{background-color: url(/proxy/rw_/https://example.com/asset.png)}',
            );
        });
    });
});
