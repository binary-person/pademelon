import fs = require('fs');
import path = require('path');
import { cssRewriter, cssUrlTypes } from './css-rewriter';

type cssRewriterArgs = {
    inputUrl: string;
    urlTypes: cssUrlTypes;
};

describe('CSS Rewriter', () => {
    const cssUrlRewriterCalls: cssRewriterArgs[] = [];
    const originalCSS = fs.readFileSync(path.resolve(__dirname, 'css-rewriter.test.css'), 'utf8');
    const rewrittenCSSSolution = fs.readFileSync(path.resolve(__dirname, 'css-rewriter.rewritten.test.css'), 'utf8');
    const rewrittenCSS = cssRewriter(originalCSS, (inputUrl: string, urlTypes: cssUrlTypes) => {
        cssUrlRewriterCalls.push({
            inputUrl,
            urlTypes
        });
        return '/prefixed/' + inputUrl;
    });
    it('should have correct rewrite url calls', () => {
        expect(cssUrlRewriterCalls).toStrictEqual([
            { inputUrl: 'https://import-single-quote.com', urlTypes: '@import' },
            { inputUrl: '  https://import-extra-space.com  ', urlTypes: '@import' },
            { inputUrl: 'https://import-double-quote.com', urlTypes: '@import' },
            { inputUrl: "https://import'with-redundant-escaped-single-quote.com", urlTypes: '@import' },
            { inputUrl: 'https://import"with-escaped-double-quote.com', urlTypes: '@import' },
            { inputUrl: 'https://import\\with-escaped-backslash.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url-no-quote.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url-extra-space.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url)with-escaped-parentheses', urlTypes: '@import' },
            { inputUrl: 'https://import-url"with-escaped-double-quote.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url\\with-escaped-backslash.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url-single-quote.com', urlTypes: '@import' },
            { inputUrl: '  https://import-url-quoted-extra-space.com  ', urlTypes: '@import' },
            { inputUrl: 'https://import-url-double-quote.com', urlTypes: '@import' },
            { inputUrl: "https://import-url'with-redundant-escaped-single-quote.com", urlTypes: '@import' },
            { inputUrl: 'https://import-url"with-escaped-double-quote.com', urlTypes: '@import' },
            { inputUrl: 'https://import-url\\with-escaped-backslash.com', urlTypes: '@import' },
            { inputUrl: 'https://url-no-quote.com', urlTypes: 'url' },
            { inputUrl: 'https://url-extra-space.com', urlTypes: 'url' },
            { inputUrl: 'https://url"with-escaped-double-quote.com', urlTypes: 'url' },
            { inputUrl: 'https://url)with-escaped-parentheses', urlTypes: 'url' },
            { inputUrl: 'https://url\\with-escaped-backslash.com', urlTypes: 'url' },
            { inputUrl: 'https://url-single-quote.com', urlTypes: 'url' },
            { inputUrl: '  https://url-quoted-extra-space.com  ', urlTypes: 'url' },
            { inputUrl: 'https://url-double-quote.com', urlTypes: 'url' },
            { inputUrl: "https://url'with-redundant-escaped-single-quote.com", urlTypes: 'url' },
            { inputUrl: 'https://url"with-escaped-double-quote.com', urlTypes: 'url' },
            { inputUrl: 'https://url\\with-escaped-backslash.com', urlTypes: 'url' }
        ]);
    });
    it('should match correctly rewritten css file solution', () => {
        expect(rewrittenCSS).toStrictEqual(rewrittenCSSSolution);
    });
});
