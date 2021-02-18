import { BasePademelon, BasePademelonOptions } from './base-rewriter-module';
import { modTypes, typeToMod } from './mod';
import { htmlInject } from './rewriters/html-inject';
import { htmlNodejsRewriter } from './rewriters/html-rewriter-nodejs';

interface PademelonNodejsOptions extends BasePademelonOptions {
    browserPademelonDistUrl: string;
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
    constructor(options: PademelonNodejsOptions) {
        super(options);
        this.options = options;
    }
    public rewriteHTML(
        htmlText: string,
        proxyPath: string,
        pademelonInject = this.generateDefaultPademelonInject()
    ): string {
        return htmlInject(
            htmlNodejsRewriter(
                htmlText,
                (inputUrl, htmlUrlType) => {
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
                },
                (cssText) => this.rewriteCSS(cssText, proxyPath),
                this.rewriteJS.bind(this)
            ),
            pademelonInject
        );
    }
}

export { Pademelon };
