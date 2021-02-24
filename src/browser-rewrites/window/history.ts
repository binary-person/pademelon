import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewriteHistory(pademelonInstance: Pademelon): void {
    const funcWrapper = <T>(_: T, data: any, title: string, url?: string | null) => {
        if (url) {
            url = pademelonInstance.rewriteUrl(
                url,
                // handle cases where history.pushState is ran inside an empty iframe (spfjs's demo does this)
                window.location.href === 'about:blank' ? window.top.location.pathname : undefined
            );
        }
        return [data, title, url] as const;
    };
    history.pushState = rewriteFunction(history.pushState, { interceptArgs: funcWrapper });
    history.replaceState = rewriteFunction(history.replaceState, { interceptArgs: funcWrapper });
}

export { rewriteHistory };
