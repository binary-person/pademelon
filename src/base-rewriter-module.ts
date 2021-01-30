import { UrlRewriter, UrlRewriterOptions } from './rewriters/UrlRewriter';
import { cssRewriter } from './rewriters/css-rewriter';
import { invalidWindowPropRegex, jsRewriter } from './rewriters/js-rewriter';
import { typeToMod } from './mod';
import { stringify } from 'querystring';

interface BasePademelonOptions extends UrlRewriterOptions {
    windowProp?: string;
    noMod?: boolean;
}

/**
 * extended by browser and nodejs classes
 */
class BasePademelon extends UrlRewriter {
    public baseOptions: BasePademelonOptions;
    constructor(options: BasePademelonOptions) {
        super(options);
        this.baseOptions = options;
        if (!this.baseOptions.windowProp) {
            this.baseOptions.windowProp = 'pademelonInstance';
        }
        this.baseOptions.windowProp = this.baseOptions.windowProp as string;
        if (invalidWindowPropRegex.test(this.baseOptions.windowProp)) {
            throw new Error(
                'Invalid windowProp ' +
                    this.baseOptions.windowProp +
                    '. Does not match regex ' +
                    invalidWindowPropRegex,
            );
        }
        if (this.baseOptions.windowProp === 'Pademelon') {
            throw new Error('windowProp cannot be the same name as the class name');
        }
    }
    /**
     * @param cssText - raw css text
     * @param proxyPath - original proxy path
     * @example ```typescript
     * const cssText = '@import "/someother.css"; body{background-color: url(asset.png)}';
     * const rewrittenCSSText = pademelon.rewriteCSS(cssText, '/proxyprefix/https://example.com');
     * // rewrittenCSSText:
     * '@import "https://proxysite.com/proxy/cs_/https://example.com/someother.css"; body{background-color: url(https://proxysite.com/proxy/st_/https://example.com/asset.png)}'
     * ```
     */
    public rewriteCSS(cssText: string, proxyPath: string): string {
        return cssRewriter(cssText, (unrewrittenUrl, cssUrlType) => {
            let mod: string | undefined;
            if (!this.baseOptions.noMod) {
                if (cssUrlType === '@import') {
                    mod = typeToMod('stylesheet');
                } else {
                    mod = typeToMod('static');
                }
            }
            return this.rewriteUrl(unrewrittenUrl, proxyPath, mod);
        });
    }
    public rewriteJS(jsCode: string): string {
        return jsRewriter(jsCode, this.baseOptions.windowProp as string);
    }
}

export { BasePademelon, BasePademelonOptions };
