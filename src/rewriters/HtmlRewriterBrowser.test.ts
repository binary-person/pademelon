/**
 * @jest-environment jsdom
 */

import { HtmlRewriterBrowser } from './HtmlRewriterBrowser';

describe('HTML Browser Rewriter', () => {
    const htmlRewriter = new HtmlRewriterBrowser({
        rewriteJS: (js) => 'var rewritten;' + js
    });
    it('should rewrite script tags properly', () => {
        expect(htmlRewriter.rewriteHtmlString('<h3>Some text</h3>\n\n<script>blah</script>')).toEqual(
            '<h3>Some text</h3>\n\n<script>var rewritten;blah</script>'
        );
    });
});
