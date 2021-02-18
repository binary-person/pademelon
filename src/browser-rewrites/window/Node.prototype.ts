import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteNodeProto(pademelonInstance: Pademelon): void {
    rewriteGetterSetter(Node.prototype, 'textContent', {
        rewriteSetter(this: HTMLElement, setValue: string) {
            if (this instanceof HTMLScriptElement) {
                setValue = pademelonInstance.rewriteJS(setValue);
            } else if (this instanceof HTMLStyleElement) {
                setValue = pademelonInstance.rewriteCSS(setValue);
            }
            return setValue;
        }
    });
}

export { rewriteNodeProto };
