import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewriteHistory(pademelonInstance: Pademelon) {
    const funcWrapper = (_: any, data: any, title: any, url?: string) => {
        if (url) {
            url = pademelonInstance.rewriteUrl(url);
        }
        return [data, title, url];
    };
    rewriteFunction(history, 'pushState', { interceptArgs: funcWrapper });
    rewriteFunction(history, 'replaceState', { interceptArgs: funcWrapper });
}

export { rewriteHistory };
