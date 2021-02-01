import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewriteHistory(pademelonInstance: Pademelon) {
    const funcWrapper = (_: any, data: any, title: any, url?: string) => {
        if (url) {
            url = pademelonInstance.rewriteUrl(url);
            return [data, title, url];
        }
    };
    rewriteFunction(history, 'pushState', false, funcWrapper);
    rewriteFunction(history, 'replaceState', false, funcWrapper);
}

export { rewriteHistory };
