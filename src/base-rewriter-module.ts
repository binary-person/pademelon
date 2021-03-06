import { UrlRewriter, UrlRewriterOptions } from './rewriters/UrlRewriter';
import { cssRewriter } from './rewriters/css-rewriter';
import { invalidWindowPropRegex, jsRewriter } from './rewriters/js-rewriter';
import { typeToMod } from './mod';
import { workerJsRewriter } from './rewriters/worker-js-rewriter';

interface BasePademelonOptions extends UrlRewriterOptions {
    browserPademelonDistUrl?: string;
    browserImportScriptWorkerUrl?: string;
    windowProp?: string;
    selfProp?: string;
    noMod?: boolean;
}

const defaultBrowserPademelonDistUrl = '/pademelon.min.js';
const defaultBrowserImportScriptWorkerUrl = '/pademelon.worker.min.js';

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
        if (invalidWindowPropRegex.test(this.baseOptions.windowProp)) {
            throw new TypeError(
                'Invalid windowProp ' + this.baseOptions.windowProp + '. Does not match regex ' + invalidWindowPropRegex
            );
        }
        if (!this.baseOptions.selfProp) {
            this.baseOptions.selfProp = 'pademelonInstance';
        }
        if (invalidWindowPropRegex.test(this.baseOptions.selfProp)) {
            throw new TypeError(
                'Invalid selfProp ' + this.baseOptions.windowProp + '. Does not match regex ' + invalidWindowPropRegex
            );
        }
        if (this.baseOptions.windowProp === 'Pademelon') {
            throw new TypeError('windowProp cannot be the same name as the class name');
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
                    mod = typeToMod('raw');
                }
            }
            return this.rewriteUrl(unrewrittenUrl, proxyPath, mod);
        });
    }
    public rewriteJS(jsCode: string): string {
        return jsRewriter(jsCode, this.baseOptions.windowProp as string);
    }
    public rewriteWorkerJS(workerJsCode: string): string {
        return workerJsRewriter(
            workerJsCode,
            this.getBrowserImportScriptWorkerUrl(),
            JSON.stringify(this.baseOptions),
            this.baseOptions.selfProp as string
        );
    }
    public generateDefaultPademelonInitCode(): string {
        return (
            'window.' +
            this.baseOptions.windowProp +
            ' = new Pademelon(' +
            JSON.stringify(this.baseOptions) +
            ');' +
            this.baseOptions.windowProp +
            '.init()'
        );
    }
    public getBrowserPademelonDistUrl(): string {
        return this.baseOptions.browserPademelonDistUrl || defaultBrowserPademelonDistUrl;
    }
    public getBrowserImportScriptWorkerUrl(): string {
        return this.baseOptions.browserImportScriptWorkerUrl || defaultBrowserImportScriptWorkerUrl;
    }
    public generateDefaultPademelonInject(): string {
        const pademelonDist = '<script src="' + this.getBrowserPademelonDistUrl() + '"></script>';
        const pademelonInit = '<script>' + this.generateDefaultPademelonInitCode() + '</script>';
        return pademelonDist + pademelonInit;
    }
}

export { BasePademelon, BasePademelonOptions };
