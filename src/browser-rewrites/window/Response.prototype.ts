import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteResponse(pademelonInstance: Pademelon): void {
    if (!window.Response) {
        // jsdom does not have window.Response so polyfilling it here to prevent
        // it from throwing errors on other browser-rewrite tests
        window.Response = (() => undefined) as any;
        window.Response.prototype = {
            get url() {
                return null;
            }
        } as any;
    }
    rewriteGetterSetter(window.Response.prototype, 'url', {
        rewriteGetter: (returnValue: string) => {
            if (returnValue) {
                returnValue = pademelonInstance.unrewriteUrl(returnValue).url;
            }
            return returnValue;
        }
    });
}

export { rewriteResponse };
