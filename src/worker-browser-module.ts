import { BasePademelon, BasePademelonOptions } from './base-rewriter-module';
import { workerRewriters } from './browser-rewrites/worker-rewrites/self';
import { unrewriteUrlType } from './rewriters/UrlRewriter';

class Pademelon extends BasePademelon {
    public workerRewriters = workerRewriters;
    // since we are rewriting the location object directly (and it's read-only),
    // we want to cache the original before rewriting
    public readonly realLocation = new URL(self.location.href);

    constructor(options: BasePademelonOptions) {
        super(options);
    }

    public initWorkerRewrites(): void {
        for (const eachRewriter of this.workerRewriters) {
            eachRewriter(this);
        }
    }
    public init(): void {
        this.initWorkerRewrites();
    }

    public rewriteUrl(url: string, proxyPath: string = this.realLocation.pathname, mod?: string): string {
        if (url === this.getBrowserPademelonDistUrl()) return url;
        return super.rewriteUrl(url, proxyPath, mod);
    }
    public unrewriteUrl(proxyUrl: string = this.realLocation.pathname): unrewriteUrlType {
        return super.unrewriteUrl(proxyUrl);
    }
}

export = Pademelon;
