const urlSchemes = ['http://', 'https://', 'ws://', 'wss://', '//'];
const allowedModRegex = /^\d*[a-z]+_$|^$/;
const websocketUrlRegex = /^wss?:\/\//i;
const httpUrlRegex = /^http(s)?:\/\//i;
const nonRelativeRegex = /^\/\/|^(http|ws)s?:\/\//i;

const defaultPrefixBlacklist = ['data:', 'blob:', 'about:', 'ftp:', 'file:', 'javascript:'];
const defaultUrlBlacklist = ['about:blank'];

interface UrlRewriterOptions {
    hostname: string;
    pathnamePrefix: string;
    useHttp?: boolean;
    blacklistPrefixes?: string[];
    blacklistUrls?: string[];
    rewriteUrlIntercept?: (rewrittenUrl: string) => string; // called right before return to caller
    unrewriteUrlIntercept?: (rewrittenUrl: string) => string; // called before any unrewrite is done
}

type unrewriteUrlType = { url: string; mod?: string; fail?: boolean };

function appendEachUrlScheme(suffix: string): string[] {
    const arr = [];
    for (const eachScheme of urlSchemes) {
        arr.push(eachScheme + suffix);
    }
    return arr;
}

class UrlRewriter {
    public urlRewriterOptions: UrlRewriterOptions;
    private proxyPrefix: string;
    private proxyPrefixes: string[];
    constructor(options: UrlRewriterOptions) {
        if (!options.pathnamePrefix.startsWith('/')) {
            throw new TypeError('Expected pathnamePrefix to start with /');
        }
        if (!options.pathnamePrefix.endsWith('/')) {
            throw new TypeError('Expected pathnamePrefix to end with /');
        }
        if (options.hostname.endsWith('/')) {
            throw new TypeError('Unexpected trailing slash in hostname');
        }

        this.proxyPrefix = options.hostname + options.pathnamePrefix;
        if (options.useHttp) {
            this.proxyPrefix = 'http://' + this.proxyPrefix;
        } else {
            this.proxyPrefix = 'https://' + this.proxyPrefix;
        }

        if (!options.blacklistPrefixes) {
            options.blacklistPrefixes = [];
        }
        options.blacklistPrefixes = options.blacklistPrefixes.concat(defaultPrefixBlacklist);

        if (!options.blacklistUrls) {
            options.blacklistUrls = [];
        }
        options.blacklistUrls = options.blacklistUrls.concat(defaultUrlBlacklist);

        this.proxyPrefixes = [];
        // scheme://hostname/pathnamePrefix/
        this.proxyPrefixes.push(...appendEachUrlScheme(options.hostname + options.pathnamePrefix));
        // /pathnamePrefix/
        this.proxyPrefixes.push(options.pathnamePrefix);

        this.urlRewriterOptions = options;
    }
    private getProxyPrefix(url: string): string | false {
        for (const proxyPrefix of this.proxyPrefixes) {
            if (url.startsWith(proxyPrefix)) {
                return proxyPrefix;
            }
        }
        return false;
    }
    private isBlacklistedPrefix(url: string): boolean {
        for (const blacklistPrefix of this.urlRewriterOptions.blacklistPrefixes as string[]) {
            if (url.startsWith(blacklistPrefix)) {
                return true;
            }
        }
        return false;
    }
    public unrewriteUrl(proxyUrl = ''): unrewriteUrlType {
        if (typeof this.urlRewriterOptions.unrewriteUrlIntercept === 'function') {
            proxyUrl = this.urlRewriterOptions.unrewriteUrlIntercept(proxyUrl);
        }
        const proxyPrefix = this.getProxyPrefix(proxyUrl);
        if (proxyPrefix === false) {
            return { url: proxyUrl, fail: true };
        }
        // destUrl without mod: https://example.com
        // destUrl with mod: somemod_/https://example.com
        let destUrl = proxyUrl.slice(proxyPrefix.length);
        let mod;
        const nextSlash = destUrl.indexOf('/');
        if (nextSlash !== -1) {
            // url possibly contains a mod
            const testmod = destUrl.slice(0, nextSlash);
            if (allowedModRegex.test(testmod)) {
                mod = testmod;
                destUrl = destUrl.slice(nextSlash + 1);
            }
        }
        return { url: destUrl, mod };
    }
    public rewriteUrl(url: string, proxyPath = '', mod?: string): string {
        url = url.toString();

        if (
            this.isBlacklistedPrefix(url) ||
            this.getProxyPrefix(url) !== false ||
            this.urlRewriterOptions.blacklistUrls?.includes(url)
        ) {
            return url;
        }

        let prefix: string;
        if (nonRelativeRegex.test(url)) {
            prefix = this.proxyPrefix;
        } else {
            prefix = this.urlRewriterOptions.pathnamePrefix;
        }
        let currentDestUrl: URL;
        try {
            const unrewrittenUrl = this.unrewriteUrl(proxyPath);
            if (unrewrittenUrl.fail) {
                return url;
            } else {
                currentDestUrl = new URL(url, unrewrittenUrl.url);
            }
        } catch (e) {
            return url;
        }
        if (mod) {
            if (allowedModRegex.test(mod)) {
                prefix += mod + '/';
            } else {
                throw new TypeError(mod + ' mod not allowed. Does not match the regex ' + allowedModRegex);
            }
        }

        // rewrite proxy prefix with wss urls appropriately
        if (websocketUrlRegex.test(currentDestUrl.href)) {
            prefix = prefix.replace(httpUrlRegex, 'ws$1://');
        }

        let rewrittenUrl = prefix + currentDestUrl.href;
        if (typeof this.urlRewriterOptions.rewriteUrlIntercept === 'function') {
            rewrittenUrl = this.urlRewriterOptions.rewriteUrlIntercept(rewrittenUrl);
        }
        return rewrittenUrl;
    }
}
export { UrlRewriter, UrlRewriterOptions, unrewriteUrlType, allowedModRegex };
