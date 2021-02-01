import { BasePademelon } from './base-rewriter-module';
import { generateModifiedWindow } from './browser-rewrites/modifiedWindow';
import { generateScopeProxy } from './browser-rewrites/scopeProxy';
import { rewriterFuncParams, windowRewriters } from './browser-rewrites/window';
import { typeToMod } from './mod';
import { htmlBrowserRewriter } from './rewriters/html-rewriter-browser';
import { unrewriteUrlType } from './rewriters/UrlRewriter';

/**
 * @extends BasePademelon
 */
class Pademelon extends BasePademelon {
    public readonly modifiedWindow = generateModifiedWindow(this);
    public readonly scopeProxy = generateScopeProxy(this);

    public windowRewriters: rewriterFuncParams[] = windowRewriters;

    public initWindowRewrites() {
        for (const eachRewriter of this.windowRewriters) {
            if (typeof eachRewriter === 'function') {
                eachRewriter(this);
            } else {
                throw new Error(`one of the windowRewriters is not a function. received ` + eachRewriter);
            }
        }
    }

    public init() {
        this.initWindowRewrites();
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
