import { HtmlRewriterNodejs } from './HtmlRewriterNodejs';

describe('HTML NodeJS Rewriter', () => {
    const htmlRewriter = new HtmlRewriterNodejs({
        rewriteUrl(inputUrl, htmlUrlType) {
            switch (htmlUrlType) {
                case 'script':
                    return '/script/' + inputUrl;
                case 'stylesheet':
                    return '/style/' + inputUrl;
                case 'url':
                    return '/url/' + inputUrl;
                default:
                    throw new TypeError('Unknown htmlUrlType: ' + htmlUrlType);
            }
        },
        rewriteJS(jsText) {
            return 'var jsRewritten;' + jsText;
        },
        rewriteCSS(cssText) {
            return 'cssRewritten{}' + cssText;
        }
    });
    it('should rewrite js inside <script> and src correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<script>somecode.execute()</script>')).toEqual(
            '<script>var jsRewritten;somecode.execute()</script>'
        );
    });
    it('should rewrite js if <script type="text/javascript">', () => {
        expect(htmlRewriter.rewriteHtmlString('<script type="text/javascript">somecode.execute()</script>')).toEqual(
            '<script type="text/javascript">var jsRewritten;somecode.execute()</script>'
        );
    });
    it('should not rewrite js if <script type="someothertype">', () => {
        expect(htmlRewriter.rewriteHtmlString('<script type="someothertype">somecode.execute()</script>')).toEqual(
            '<script type="someothertype">somecode.execute()</script>'
        );
    });
    it('should rewrite src in <script src="code.js"> and not rewrite empty js correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<script src="code.js"></script>')).toEqual(
            '<script src="/script/code.js"></script>'
        );
    });
    it('should rewrite css inside <style> correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<style>body{}</style>')).toEqual('<style>cssRewritten{}body{}</style>');
    });
    it('should not rewrite empty <style> correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<style></style>')).toEqual('<style></style>');
    });
    it('should rewrite <link rel="stylesheet" href="style.css"> tags correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<link rel="stylesheet" href="style.css">')).toEqual(
            '<link rel="stylesheet" href="/style/style.css">'
        );
    });
    it('should rewrite <link rel="preload" href="style.css" as="style"> tags correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<link rel="preload" href="style.css" as="style">')).toEqual(
            '<link rel="preload" href="/style/style.css" as="style">'
        );
    });
    it('should rewrite <link rel="preload" href="script.js" as="script"> tags correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<link rel="preload" href="script.js" as="script">')).toEqual(
            '<link rel="preload" href="/script/script.js" as="script">'
        );
    });
    it('should rewrite <link rel="preload" href="font.woff2" as="font"> tags correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<link rel="preload" href="font.woff2" as="font">')).toEqual(
            '<link rel="preload" href="/url/font.woff2" as="font">'
        );
    });
    it('should failback to regex provided that the provided html text is invalid', () => {
        expect(htmlRewriter.rewriteHtmlString('<unclosedtag><link rel="stylesheet" href =  "style.css">')).toEqual(
            '<unclosedtag><link rel="stylesheet" href =  "/url/style.css">'
        );
    });
    it('should rewrite style attribute correctly', () => {
        expect(htmlRewriter.rewriteHtmlString('<span style="stylevalue"></span>')).toEqual(
            '<span style="cssRewritten{}stylevalue"></span>'
        );
    });
    it('should rewrite style attribute correctly with failback', () => {
        expect(htmlRewriter.rewriteHtmlString('<unclosedtag><span style="stylevalue"></span>')).toEqual(
            '<unclosedtag><span style="cssRewritten{}stylevalue"></span>'
        );
    });
    it('should rewrite onclick/on... event listener attributes', () => {
        expect(htmlRewriter.rewriteHtmlString('<span onclick="listener()"></span>')).toEqual(
            '<span onclick="var jsRewritten;listener()"></span>'
        );
    });
    // issue regarding this here: https://github.com/taoqf/node-html-parser/issues/98
    it('should be case-insensitive when rewriting onClick', () => {
        expect(htmlRewriter.rewriteHtmlString('<span onClick="listener()"></span>')).toEqual(
            '<span onClick="var jsRewritten;listener()"></span>'
        );
    });
    it('should be case-insensitive when rewriting onClick on failback regex rewriter', () => {
        expect(htmlRewriter.rewriteHtmlString('<unclosedtag><span onClick="listener()"></span>')).toEqual(
            '<unclosedtag><span onClick="var jsRewritten;listener()"></span>'
        );
    });
});
