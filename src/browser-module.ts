import { BasePademelon } from './base-rewriter-module';
import { generateModifiedWindow } from './browser-rewrites/modifiedWindow';
import { rewriterFuncParams, windowRewriters } from './browser-rewrites/window';
import { unrewriteUrlType } from './rewriters/UrlRewriter';

type globalizeVariableType = (funcName: string) => boolean;

/**
 * @extends BasePademelon
 */
class Pademelon extends BasePademelon {
    public readonly modifiedWindow = generateModifiedWindow(this);
    public varLookupChain: globalizeVariableType[] = [];

    private pademelonDistJS = '';

    public windowRewriters: rewriterFuncParams[] = windowRewriters;

    public initWindowRewrites(): void {
        for (const eachRewriter of this.windowRewriters) {
            if (typeof eachRewriter === 'function') {
                eachRewriter(this);
            } else {
                throw new TypeError(`one of the windowRewriters is not a function. received ` + eachRewriter);
            }
        }
    }
    public getPademelonDist(): string {
        if (this.pademelonDistJS) return this.pademelonDistJS;
        const request = new XMLHttpRequest();
        request.open('GET', this.getBrowserPademelonDistUrl(), false);
        request.send();
        this.pademelonDistJS = request.responseText;
        return this.pademelonDistJS;
    }

    public init(): void {
        this.initWindowRewrites();
    }

    public runFuncLookupChain(funcName: string): void {
        // since the last script always overrides its variable on all others,
        // run a lookup starting from the last script
        for (let i = this.varLookupChain.length - 1; i >= 0; i--) {
            if (this.varLookupChain[i](funcName)) {
                return;
            }
        }
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
