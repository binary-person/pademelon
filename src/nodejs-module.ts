import { BasePademelon, BasePademelonOptions } from './base-rewriter-module';
import { modTypes, typeToMod } from './mod';
import { htmlInject } from './rewriters/html-inject';
import { HtmlRewriterNodejs } from './rewriters/HtmlRewriterNodejs';

interface PademelonNodejsOptions extends BasePademelonOptions {
    browserPademelonDistUrl: string;
    browserImportScriptWorkerUrl: string;
}

/**
 * @example ```typescript
 * const pademelon = new Pademelon({
 *     hostname: 'proxysite.com',
 *     pathnamePrefix: '/proxy/',
 *     windowProp: 'pademelonInstance'
 * });
 * ```
 * @extends BasePademelon
 */
class Pademelon extends BasePademelon {
    public options: PademelonNodejsOptions;
    private htmlRewriter: HtmlRewriterNodejs;
    constructor(options: PademelonNodejsOptions) {
        super(options);
        this.options = options;
        this.htmlRewriter = new HtmlRewriterNodejs();
    }
    public rewriteHTML(
        htmlText: string,
        proxyPath: string,
        pademelonInject = this.generateDefaultPademelonInject()
    ): string {
        this.htmlRewriter.rewriteUrl = (inputUrl, htmlUrlType) => {
            let mod: modTypes | undefined;
            switch (htmlUrlType) {
                case 'script':
                    mod = 'javascript';
                    break;
                case 'stylesheet':
                    mod = 'stylesheet';
                    break;
                case 'fetch':
                    mod = 'api';
                    break;
            }
            return this.rewriteUrl(inputUrl, proxyPath, typeToMod(mod));
        };
        this.htmlRewriter.rewriteCSS = (cssText) => this.rewriteCSS(cssText, proxyPath);
        this.htmlRewriter.rewriteJS = this.rewriteJS.bind(this);
        return htmlInject(this.htmlRewriter.rewriteHtmlString(htmlText), pademelonInject);
    }
}

export { Pademelon };
