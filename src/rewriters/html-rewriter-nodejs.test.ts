import { htmlNodejsRewriter } from './html-rewriter-nodejs';
import { htmlUrlRewriter, strStrFunc } from './html-rewriter';

describe('HTML NodeJS Rewriter', () => {
    const urlRewriter: htmlUrlRewriter = (inputUrl, htmlUrlType) => {
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
    };
    const jsRewriter: strStrFunc = (jsText) => {
        return 'var jsRewritten;' + jsText;
    };
    const cssRewriter: strStrFunc = (cssText) => {
        return 'cssRewritten{}' + cssText;
    };
    it('should rewrite js inside <script src="code.js"> and src correctly', () => {
        expect(htmlNodejsRewriter('<script>somecode.execute()</script>', urlRewriter, cssRewriter, jsRewriter)).toEqual(
            '<script>var jsRewritten;somecode.execute()</script>'
        );
    });
    it('should rewrite src in <script src="code.js"> and not rewrite empty js correctly', () => {
        expect(htmlNodejsRewriter('<script src="code.js"></script>', urlRewriter, cssRewriter, jsRewriter)).toEqual(
            '<script src="/script/code.js"></script>'
        );
    });
    it('should rewrite css inside <style> correctly', () => {
        expect(htmlNodejsRewriter('<style>body{}</style>', urlRewriter, cssRewriter, jsRewriter)).toEqual(
            '<style>cssRewritten{}body{}</style>'
        );
    });
    it('should not rewrite empty <style> correctly', () => {
        expect(htmlNodejsRewriter('<style></style>', urlRewriter, cssRewriter, jsRewriter)).toEqual('<style></style>');
    });
    it('should rewrite <link rel="stylesheet" href="style.css"> tags correctly', () => {
        expect(
            htmlNodejsRewriter('<link rel="stylesheet" href="style.css">', urlRewriter, cssRewriter, jsRewriter)
        ).toEqual('<link rel="stylesheet" href="/style/style.css">');
    });
    it('should rewrite <link rel="preload" href="style.css" as="style"> tags correctly', () => {
        expect(
            htmlNodejsRewriter('<link rel="preload" href="style.css" as="style">', urlRewriter, cssRewriter, jsRewriter)
        ).toEqual('<link rel="preload" href="/style/style.css" as="style">');
    });
    it('should rewrite <link rel="preload" href="script.js" as="script"> tags correctly', () => {
        expect(
            htmlNodejsRewriter(
                '<link rel="preload" href="script.js" as="script">',
                urlRewriter,
                cssRewriter,
                jsRewriter
            )
        ).toEqual('<link rel="preload" href="/script/script.js" as="script">');
    });
    it('should rewrite <link rel="preload" href="font.woff2" as="font"> tags correctly', () => {
        expect(
            htmlNodejsRewriter('<link rel="preload" href="font.woff2" as="font">', urlRewriter, cssRewriter, jsRewriter)
        ).toEqual('<link rel="preload" href="/url/font.woff2" as="font">');
    });
    it('should failback to regex provided that the provided html text is invalid', () => {
        expect(
            htmlNodejsRewriter(
                '<unclosedtag><link rel="stylesheet" href =  "style.css">',
                urlRewriter,
                cssRewriter,
                jsRewriter
            )
        ).toEqual('<unclosedtag><link rel="stylesheet" href =  "/url/style.css">');
    });
});
