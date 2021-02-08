import { BasePademelon } from './base-rewriter-module';
import { generateModifiedWindow } from './browser-rewrites/modifiedWindow';
import { rewriterFuncParams, windowRewriters } from './browser-rewrites/window';
import { typeToMod } from './mod';
import { htmlBrowserRewriter } from './rewriters/html-rewriter-browser';
import { unrewriteUrlType } from './rewriters/UrlRewriter';

type globalizeFunctionType = (funcName: string) => boolean;

/**
 * @extends BasePademelon
 */
class Pademelon extends BasePademelon {
    public readonly modifiedWindow = generateModifiedWindow(this);
    public funcLookupChain: globalizeFunctionType[] = [];

    private pademelonDistJS = '';

    public windowRewriters: rewriterFuncParams[] = windowRewriters;

    public initWindowRewrites() {
        for (const eachRewriter of this.windowRewriters) {
            if (typeof eachRewriter === 'function') {
                eachRewriter(this);
            } else {
                throw new TypeError(`one of the windowRewriters is not a function. received ` + eachRewriter);
            }
        }
    }
    public getPademelonDist() {
        if (this.pademelonDistJS) return this.pademelonDistJS;
        const request = new XMLHttpRequest();
        request.open('GET', this.getBrowserPademelonDistUrl(), false);
        request.send();
        this.pademelonDistJS = request.responseText;
        return this.pademelonDistJS;
    }

    public init() {
        this.initWindowRewrites();
    }

    public runFuncLookupChain(funcName: string) {
        // since the last script always overrides its variable on all others,
        // run a lookup starting from the last script
        for (let i = this.funcLookupChain.length - 1; i >= 0; i--) {
            if (this.funcLookupChain[i](funcName)) {
                return;
            }
        }
    }

    public rewriteHTML(element: HTMLElement, recursive = true, proxyPath: string = window.location.pathname) {
        htmlBrowserRewriter(
            element,
            (inputUrl, htmlUrlType) => {
                switch (htmlUrlType) {
                    case 'script':
                        return this.rewriteUrl(inputUrl, typeToMod('javascript'), proxyPath);
                    case 'stylesheet':
                        return this.rewriteUrl(inputUrl, typeToMod('stylesheet'), proxyPath);
                    default:
                        return this.rewriteUrl(inputUrl);
                }
            },
            (cssText) => this.rewriteCSS(cssText, proxyPath),
            this.rewriteJS,
            recursive
        );
    }
    public rewriteUrl = (url: string, mod?: string, proxyPath: string = window.location.pathname): string => {
        if (url === this.getBrowserPademelonDistUrl()) return url;
        return super.rewriteUrl(url, proxyPath, mod);
    };
    public unrewriteUrl = (proxyUrl: string = window.location.pathname): unrewriteUrlType => {
        return super.unrewriteUrl(proxyUrl);
    };
    public rewriteCSS = (cssText: string, proxyPath: string = window.location.pathname): string => {
        return super.rewriteCSS(cssText, proxyPath);
    };
}

export = Pademelon;
